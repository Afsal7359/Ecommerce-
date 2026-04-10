const router  = require('express').Router()
const mongoose = require('mongoose')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Brand = require('../models/Brand')
const { InventoryLog } = require('../models/Other')
const { protect, adminOnly, AppError } = require('../middleware/auth')
const { productUpload, deleteImage } = require('../middleware/upload')

// ── PUBLIC ────────────────────────────────────────────────────────────────────
// GET /api/products  — list with search, filter, sort, pagination
router.get('/', async (req, res, next) => {
  try {
    const { search, category, brand, minPrice, maxPrice, badge, sort = '-createdAt', page = 1, limit = 12, featured } = req.query
    const filter = { isActive: true }
    if (search)   filter.$text = { $search: search }
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category
      } else {
        const esc = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const cat = await Category.findOne({ $or: [{ slug: category }, { name: { $regex: `^${esc}$`, $options: 'i' } }] })
        filter.category = cat ? cat._id : null
      }
    }
    if (brand) {
      if (mongoose.Types.ObjectId.isValid(brand)) {
        filter.brand = brand
      } else {
        const esc = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const br = await Brand.findOne({ $or: [{ slug: brand }, { name: { $regex: `^${esc}$`, $options: 'i' } }] })
        filter.brand = br ? br._id : null
      }
    }
    if (badge)    filter.badge = badge
    if (featured) filter.isFeatured = true
    if (minPrice || maxPrice) filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)

    const skip  = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(filter)
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .select('-reviews -specs')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), products })
  } catch (e) { next(e) }
})

// GET /api/products/featured
router.get('/featured', async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name').populate('brand', 'name logo')
      .limit(8).sort('-createdAt')
    res.json({ success: true, products })
  } catch (e) { next(e) }
})

// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .populate('reviews.user', 'name avatar')
    if (!product) return next(AppError('Product not found', 404))
    product.viewCount++; await product.save({ validateBeforeSave: false })
    res.json({ success: true, product })
  } catch (e) { next(e) }
})

// POST /api/products/:id/reviews
router.post('/:id/reviews', protect, async (req, res, next) => {
  try {
    const { rating, comment } = req.body
    const product = await Product.findById(req.params.id)
    if (!product) return next(AppError('Product not found', 404))
    const already = product.reviews.find(r => r.user.toString() === req.user._id.toString())
    if (already) return next(AppError('You already reviewed this product', 400))
    product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment })
    await product.save()
    res.status(201).json({ success: true, message: 'Review submitted for approval' })
  } catch (e) { next(e) }
})

// ── ADMIN ─────────────────────────────────────────────────────────────────────
// GET /api/products/admin/all — includes inactive
router.get('/admin/all', protect, adminOnly, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, brand, lowStock } = req.query
    const filter = {}
    if (search)   filter.$or = [{ name: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }]
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category
      } else {
        const esc = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const cat = await Category.findOne({ $or: [{ slug: category }, { name: { $regex: `^${esc}$`, $options: 'i' } }] })
        filter.category = cat ? cat._id : null
      }
    }
    if (brand) {
      if (mongoose.Types.ObjectId.isValid(brand)) {
        filter.brand = brand
      } else {
        const esc = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const br = await Brand.findOne({ $or: [{ slug: brand }, { name: { $regex: `^${esc}$`, $options: 'i' } }] })
        filter.brand = br ? br._id : null
      }
    }
    if (lowStock) filter.$expr = { $lte: ['$stock', '$lowStockAlert'] }
    const skip  = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(filter)
    const products = await Product.find(filter)
      .populate('category', 'name').populate('brand', 'name')
      .sort('-createdAt').skip(skip).limit(Number(limit))
    res.json({ success: true, total, pages: Math.ceil(total / limit), products })
  } catch (e) { next(e) }
})

// POST /api/products — create
router.post('/', protect, adminOnly, productUpload.array('images', 8), async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (data.features)    data.features = JSON.parse(data.features)
    if (data.specs)       data.specs    = JSON.parse(data.specs)
    if (data.tags)        data.tags     = JSON.parse(data.tags)
    // Handle keepImages (URL-pasted images sent even on create)
    const keepUrls = data.keepImages ? JSON.parse(data.keepImages) : []
    delete data.keepImages
    const urlImgs  = keepUrls.map((u, i) => ({ url: u, publicId: null, isMain: i === 0 }))
    const fileImgs = (req.files || []).map((f, i) => ({ url: f.path, publicId: f.filename, isMain: i === 0 && !urlImgs.length }))
    const allImgs  = [...urlImgs, ...fileImgs]
    if (allImgs.length) data.images = allImgs
    const product = await Product.create(data)
    // Log inventory
    await InventoryLog.create({ product: product._id, type: 'in', quantity: product.stock, newStock: product.stock, note: 'Initial stock', doneBy: req.user._id })
    res.status(201).json({ success: true, product })
  } catch (e) { next(e) }
})

// PUT /api/products/:id — update
router.put('/:id', protect, adminOnly, productUpload.array('images', 8), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return next(AppError('Product not found', 404))
    const data = { ...req.body }
    if (data.features) data.features = JSON.parse(data.features)
    if (data.specs)    data.specs    = JSON.parse(data.specs)
    if (data.tags)     data.tags     = JSON.parse(data.tags)

    // Handle image removal + addition
    if (data.keepImages !== undefined) {
      const keepUrls = JSON.parse(data.keepImages)
      delete data.keepImages
      // Delete removed Cloudinary images
      const removed = product.images.filter(img => !keepUrls.includes(img.url))
      await Promise.all(removed.map(img => img.publicId ? deleteImage(img.publicId).catch(() => {}) : null))
      // Keep existing saved images that are still in keepUrls
      const kept = product.images.filter(img => keepUrls.includes(img.url))
      // URL-only images pasted by admin (in keepUrls but not in product.images yet)
      const existingUrls = product.images.map(img => img.url)
      const urlOnlyNew = keepUrls
        .filter(u => !existingUrls.includes(u))
        .map((u, i) => ({ url: u, publicId: null, isMain: i === 0 && !kept.length }))
      // File uploads
      const fileImgs = (req.files || []).map((f, i) => ({ url: f.path, publicId: f.filename, isMain: i === 0 && !kept.length && !urlOnlyNew.length }))
      data.images = [...kept, ...urlOnlyNew, ...fileImgs]
      if (data.images.length > 0) data.images[0].isMain = true
    } else if (req.files?.length) {
      const newImgs = req.files.map((f, i) => ({ url: f.path, publicId: f.filename, isMain: i === 0 && !product.images.length }))
      data.images = [...(product.images || []), ...newImgs]
    }
    // Track stock change
    const oldStock = product.stock
    const updated  = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
    if (oldStock !== updated.stock) {
      const diff = updated.stock - oldStock
      await InventoryLog.create({
        product: product._id, type: diff > 0 ? 'in' : 'adjustment',
        quantity: Math.abs(diff), prevStock: oldStock, newStock: updated.stock,
        note: data.stockNote || 'Manual update', doneBy: req.user._id,
      })
    }
    res.json({ success: true, product: updated })
  } catch (e) { next(e) }
})

// DELETE /api/products/:id
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return next(AppError('Product not found', 404))
    // Delete images from Cloudinary
    await Promise.all(product.images.map(img => img.publicId ? deleteImage(img.publicId) : null))
    await product.deleteOne()
    res.json({ success: true, message: 'Product deleted' })
  } catch (e) { next(e) }
})

// PUT /api/products/:id/reviews/:reviewId/approve
router.put('/:id/reviews/:reviewId/approve', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    const review  = product.reviews.id(req.params.reviewId)
    if (!review) return next(AppError('Review not found', 404))
    review.isApproved = true
    await product.save()
    res.json({ success: true, message: 'Review approved' })
  } catch (e) { next(e) }
})

module.exports = router
