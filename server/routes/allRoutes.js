// ── CATEGORIES ────────────────────────────────────────────────────────────────
const catRouter = require('express').Router()
const Category  = require('../models/Category')
const { protect, adminOnly, AppError } = require('../middleware/auth')
const { categoryUpload, brandUpload, bannerUpload, deleteImage } = require('../middleware/upload')

catRouter.get('/', async (req, res, next) => {
  try {
    const cats = await Category.find({ isActive: true }).sort('sortOrder name')
    res.json({ success: true, categories: cats })
  } catch (e) { next(e) }
})
catRouter.get('/all', protect, adminOnly, async (req, res, next) => {
  try {
    const cats = await Category.find().sort('sortOrder name').populate('productCount')
    res.json({ success: true, categories: cats })
  } catch (e) { next(e) }
})
catRouter.post('/', protect, adminOnly, categoryUpload.single('image'), async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (req.file) data.image = { url: req.file.path, publicId: req.file.filename }
    else if (data.imageUrl) { data.image = { url: data.imageUrl, publicId: null }; delete data.imageUrl }
    const cat = await Category.create(data)
    res.status(201).json({ success: true, category: cat })
  } catch (e) { next(e) }
})
catRouter.put('/:id', protect, adminOnly, categoryUpload.single('image'), async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (req.file) data.image = { url: req.file.path, publicId: req.file.filename }
    else if (data.imageUrl) { data.image = { url: data.imageUrl, publicId: null }; delete data.imageUrl }
    const cat = await Category.findByIdAndUpdate(req.params.id, data, { new: true })
    res.json({ success: true, category: cat })
  } catch (e) { next(e) }
})
catRouter.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id)
    if (!cat) return next(AppError('Category not found', 404))
    if (cat.image?.publicId) await deleteImage(cat.image.publicId)
    await cat.deleteOne()
    res.json({ success: true, message: 'Category deleted' })
  } catch (e) { next(e) }
})
module.exports.categoryRouter = catRouter

// ── BRANDS ────────────────────────────────────────────────────────────────────
const brandRouter = require('express').Router()
const Brand = require('../models/Brand')

brandRouter.get('/', async (req, res, next) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort('sortOrder name')
    res.json({ success: true, brands })
  } catch (e) { next(e) }
})
brandRouter.get('/all', protect, adminOnly, async (req, res, next) => {
  try {
    const brands = await Brand.find().sort('sortOrder name').populate('productCount')
    res.json({ success: true, brands })
  } catch (e) { next(e) }
})
brandRouter.post('/', protect, adminOnly, brandUpload.single('logo'), async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (req.file) data.logo = { url: req.file.path, publicId: req.file.filename }
    const brand = await Brand.create(data)
    res.status(201).json({ success: true, brand })
  } catch (e) { next(e) }
})
brandRouter.put('/:id', protect, adminOnly, brandUpload.single('logo'), async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (req.file) data.logo = { url: req.file.path, publicId: req.file.filename }
    const brand = await Brand.findByIdAndUpdate(req.params.id, data, { new: true })
    res.json({ success: true, brand })
  } catch (e) { next(e) }
})
brandRouter.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id)
    if (brand?.logo?.publicId) await deleteImage(brand.logo.publicId)
    await brand?.deleteOne()
    res.json({ success: true })
  } catch (e) { next(e) }
})
module.exports.brandRouter = brandRouter

// ── USERS ─────────────────────────────────────────────────────────────────────
const userRouter = require('express').Router()
const User = require('../models/User')

userRouter.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query
    const filter = {}
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
    if (role)   filter.role = role
    const skip  = (Number(page) - 1) * Number(limit)
    const total = await User.countDocuments(filter)
    const users = await User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit))
    res.json({ success: true, total, pages: Math.ceil(total / limit), users })
  } catch (e) { next(e) }
})
userRouter.get('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    res.json({ success: true, user })
  } catch (e) { next(e) }
})
userRouter.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { role, isActive } = req.body
    const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true })
    res.json({ success: true, user })
  } catch (e) { next(e) }
})
userRouter.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (e) { next(e) }
})
module.exports.userRouter = userRouter

// ── COUPONS ───────────────────────────────────────────────────────────────────
const couponRouter = require('express').Router()
const { Coupon } = require('../models/Other')

couponRouter.post('/validate', protect, async (req, res, next) => {
  try {
    const coupon = await Coupon.findOne({ code: req.body.code?.toUpperCase() })
    if (!coupon) return next(AppError('Invalid coupon', 404))
    const check = coupon.isValid(req.user._id, req.body.subtotal)
    if (!check.valid) return next(AppError(check.msg, 400))
    const discount = coupon.calcDiscount(req.body.subtotal)
    res.json({ success: true, discount, coupon: { code: coupon.code, type: coupon.type, value: coupon.value } })
  } catch (e) { next(e) }
})
couponRouter.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt')
    res.json({ success: true, coupons })
  } catch (e) { next(e) }
})
couponRouter.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body)
    res.status(201).json({ success: true, coupon })
  } catch (e) { next(e) }
})
couponRouter.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, coupon })
  } catch (e) { next(e) }
})
couponRouter.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (e) { next(e) }
})
module.exports.couponRouter = couponRouter

// ── BANNERS ───────────────────────────────────────────────────────────────────
const bannerRouter = require('express').Router()
const { Banner } = require('../models/Other')

bannerRouter.get('/', async (req, res, next) => {
  try {
    const now     = new Date()
    const banners = await Banner.find({
      isActive: true,
      $or: [{ startsAt: null }, { startsAt: { $lte: now } }],
      $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
      ...(req.query.position ? { position: req.query.position } : {}),
    }).sort('sortOrder')
    res.json({ success: true, banners })
  } catch (e) { next(e) }
})
bannerRouter.get('/admin', protect, adminOnly, async (req, res, next) => {
  try {
    const banners = await Banner.find().sort('-createdAt')
    res.json({ success: true, banners })
  } catch (e) { next(e) }
})
bannerRouter.post('/', protect, adminOnly, bannerUpload.single('image'), async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (req.file) data.image = { url: req.file.path, publicId: req.file.filename }
    else if (data.imageUrl) { data.image = { url: data.imageUrl, publicId: null }; delete data.imageUrl }
    const banner = await Banner.create(data)
    res.status(201).json({ success: true, banner })
  } catch (e) { next(e) }
})
bannerRouter.put('/:id', protect, adminOnly, bannerUpload.single('image'), async (req, res, next) => {
  try {
    const data = { ...req.body }
    if (req.file) data.image = { url: req.file.path, publicId: req.file.filename }
    else if (data.imageUrl) { data.image = { url: data.imageUrl, publicId: null }; delete data.imageUrl }
    const banner = await Banner.findByIdAndUpdate(req.params.id, data, { new: true })
    res.json({ success: true, banner })
  } catch (e) { next(e) }
})
bannerRouter.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (banner?.image?.publicId) await deleteImage(banner.image.publicId)
    await banner?.deleteOne()
    res.json({ success: true })
  } catch (e) { next(e) }
})
module.exports.bannerRouter = bannerRouter

// ── CMS PAGES ─────────────────────────────────────────────────────────────────
const cmsRouter = require('express').Router()
const { CmsPage } = require('../models/Other')

cmsRouter.get('/:slug', async (req, res, next) => {
  try {
    const page = await CmsPage.findOne({ slug: req.params.slug, isActive: true })
    if (!page) return next(AppError('Page not found', 404))
    res.json({ success: true, page })
  } catch (e) { next(e) }
})
cmsRouter.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const pages = await CmsPage.find().sort('title')
    res.json({ success: true, pages })
  } catch (e) { next(e) }
})
cmsRouter.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const page = await CmsPage.create(req.body)
    res.status(201).json({ success: true, page })
  } catch (e) { next(e) }
})
cmsRouter.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const page = await CmsPage.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, page })
  } catch (e) { next(e) }
})
cmsRouter.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const page = await CmsPage.findById(req.params.id)
    if (page?.isSystem) return next(AppError('Cannot delete system page', 400))
    await page?.deleteOne()
    res.json({ success: true })
  } catch (e) { next(e) }
})
module.exports.cmsRouter = cmsRouter

// ── BULK ENQUIRIES ────────────────────────────────────────────────────────────
const enquiryRouter = require('express').Router()
const { BulkEnquiry } = require('../models/Other')

enquiryRouter.post('/', async (req, res, next) => {
  try {
    const enquiry = await BulkEnquiry.create(req.body)
    res.status(201).json({ success: true, enquiry })
  } catch (e) { next(e) }
})
enquiryRouter.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = status ? { status } : {}
    const skip   = (Number(page) - 1) * Number(limit)
    const total  = await BulkEnquiry.countDocuments(filter)
    const enquiries = await BulkEnquiry.find(filter).sort('-createdAt').skip(skip).limit(Number(limit))
    res.json({ success: true, total, pages: Math.ceil(total / limit), enquiries })
  } catch (e) { next(e) }
})
enquiryRouter.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const e = await BulkEnquiry.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, enquiry: e })
  } catch (e) { next(e) }
})
module.exports.enquiryRouter = enquiryRouter

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
const analyticsRouter = require('express').Router()
const Order = require('../models/Order')
const Product = require('../models/Product')

analyticsRouter.get('/dashboard', protect, adminOnly, async (req, res, next) => {
  try {
    const now   = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth  = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalOrders, todayOrders, monthOrders, lastMonthOrders,
      totalRevenue, monthRevenue, lastMonthRevenue,
      totalProducts, lowStockProducts, totalUsers,
      pendingOrders, recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      Order.countDocuments({ createdAt: { $gte: lastMonth, $lte: lastMonthEnd } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockAlert'] }, isActive: true }),
      User.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    ])

    // Sales chart - last 30 days
    const salesChart = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { sold: -1 } }, { $limit: 5 },
    ])

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ])

    const mr = monthRevenue[0]?.total || 0
    const lmr = lastMonthRevenue[0]?.total || 0

    res.json({
      success: true,
      stats: {
        totalOrders, todayOrders, monthOrders, lastMonthOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: mr, lastMonthRevenue: lmr,
        revenueGrowth: lmr > 0 ? (((mr - lmr) / lmr) * 100).toFixed(1) : 0,
        totalProducts, lowStockProducts, totalUsers, pendingOrders,
      },
      recentOrders, salesChart, topProducts, ordersByStatus,
    })
  } catch (e) { next(e) }
})

analyticsRouter.get('/sales-report', protect, adminOnly, async (req, res, next) => {
  try {
    const { from, to, groupBy = 'day' } = req.query
    const match = {}
    if (from || to) {
      match.createdAt = {}
      if (from) match.createdAt.$gte = new Date(from)
      if (to)   match.createdAt.$lte = new Date(to)
    }
    const fmt = groupBy === 'month' ? '%Y-%m' : groupBy === 'week' ? '%Y-W%V' : '%Y-%m-%d'
    const report = await Order.aggregate([
      { $match: match },
      { $group: {
        _id: { $dateToString: { format: fmt, date: '$createdAt' } },
        orders: { $sum: 1 }, revenue: { $sum: '$total' }, vat: { $sum: '$vat' },
        discount: { $sum: '$discount' }, avgOrder: { $avg: '$total' },
      }},
      { $sort: { _id: 1 } },
    ])
    res.json({ success: true, report })
  } catch (e) { next(e) }
})

// ── INVENTORY ─────────────────────────────────────────────────────────────────
const inventoryRouter = require('express').Router()
const { InventoryLog } = require('../models/Other')

inventoryRouter.get('/logs', protect, adminOnly, async (req, res, next) => {
  try {
    const { product, page = 1, limit = 20 } = req.query
    const filter = product ? { product } : {}
    const skip = (Number(page) - 1) * Number(limit)
    const total = await InventoryLog.countDocuments(filter)
    const logs  = await InventoryLog.find(filter)
      .populate('product', 'name sku').populate('doneBy', 'name')
      .sort('-createdAt').skip(skip).limit(Number(limit))
    res.json({ success: true, total, pages: Math.ceil(total / limit), logs })
  } catch (e) { next(e) }
})

inventoryRouter.post('/adjust', protect, adminOnly, async (req, res, next) => {
  try {
    const { productId, type, quantity, note, reference } = req.body
    const product = await Product.findById(productId)
    if (!product) return next(AppError('Product not found', 404))
    const prevStock = product.stock
    if (type === 'in')   product.stock += Number(quantity)
    if (type === 'out')  product.stock = Math.max(0, product.stock - Number(quantity))
    if (type === 'adjustment') product.stock = Number(quantity)
    await product.save({ validateBeforeSave: false })
    await InventoryLog.create({ product: productId, type, quantity, prevStock, newStock: product.stock, note, reference, doneBy: req.user._id })
    res.json({ success: true, stock: product.stock })
  } catch (e) { next(e) }
})

inventoryRouter.get('/low-stock', protect, adminOnly, async (req, res, next) => {
  try {
    const products = await Product.find({ $expr: { $lte: ['$stock', '$lowStockAlert'] }, isActive: true })
      .populate('category', 'name').populate('brand', 'name').sort('stock')
    res.json({ success: true, products })
  } catch (e) { next(e) }
})

module.exports.analyticsRouter  = analyticsRouter
module.exports.inventoryRouter  = inventoryRouter
