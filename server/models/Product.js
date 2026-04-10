const mongoose = require('mongoose')
const slugify  = require('slugify')

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true })

const variantSchema = new mongoose.Schema({
  name:  String,
  sku:   String,
  price: Number,
  stock: Number,
  attrs: mongoose.Schema.Types.Mixed,
})

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  sku:         { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  shortDesc:   String,
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand:       { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  price:       { type: Number, required: true, min: 0 },
  comparePrice:{ type: Number, default: 0 },
  costPrice:   { type: Number, default: 0 },
  images:      [{ url: String, publicId: String, isMain: Boolean }],
  stock:       { type: Number, default: 0, min: 0 },
  lowStockAlert:{ type: Number, default: 5 },
  variants:    [variantSchema],
  features:    [String],
  specs:       mongoose.Schema.Types.Mixed,
  tags:        [String],
  badge:       { type: String, enum: ['new','sale','hot','bestseller',''], default: '' },
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  weight:      Number,
  dimensions:  { l: Number, w: Number, h: Number },
  reviews:     [reviewSchema],
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 },
  soldCount:   { type: Number, default: 0 },
  viewCount:   { type: Number, default: 0 },
  metaTitle:   String,
  metaDesc:    String,
}, { timestamps: true, toJSON: { virtuals: true } })

// Indexes for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' })
productSchema.index({ category: 1, brand: 1, isActive: 1 })
productSchema.index({ price: 1 })
productSchema.index({ createdAt: -1 })

productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug)
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now()
  // Recalculate average rating
  if (this.reviews.length > 0) {
    this.rating = this.reviews.filter(r => r.isApproved).reduce((s, r) => s + r.rating, 0) /
                  this.reviews.filter(r => r.isApproved).length
    this.numReviews = this.reviews.filter(r => r.isApproved).length
  }
  next()
})

productSchema.virtual('discountPct').get(function () {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100)
})

productSchema.virtual('inStock').get(function () { return this.stock > 0 })
productSchema.virtual('isLowStock').get(function () { return this.stock > 0 && this.stock <= this.lowStockAlert })

module.exports = mongoose.model('Product', productSchema)
