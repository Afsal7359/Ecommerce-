const mongoose = require('mongoose')

// ── COUPON ────────────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema({
  code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:          { type: String, enum: ['percentage','fixed'], required: true },
  value:         { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxDiscount:   { type: Number, default: 0 },  // 0 = no cap
  usageLimit:    { type: Number, default: 0 },   // 0 = unlimited
  usedCount:     { type: Number, default: 0 },
  perUserLimit:  { type: Number, default: 1 },
  users:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  categories:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  products:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive:      { type: Boolean, default: true },
  startsAt:      { type: Date, default: Date.now },
  expiresAt:     { type: Date, required: true },
  description:   String,
}, { timestamps: true })

couponSchema.methods.isValid = function (userId, orderValue) {
  const now = new Date()
  if (!this.isActive) return { valid: false, msg: 'Coupon is inactive' }
  if (now < this.startsAt) return { valid: false, msg: 'Coupon not yet active' }
  if (now > this.expiresAt) return { valid: false, msg: 'Coupon has expired' }
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) return { valid: false, msg: 'Coupon usage limit reached' }
  if (orderValue < this.minOrderValue) return { valid: false, msg: `Minimum order AED ${this.minOrderValue}` }
  if (userId && this.perUserLimit > 0) {
    const used = this.users.filter(u => u.toString() === userId.toString()).length
    if (used >= this.perUserLimit) return { valid: false, msg: 'You have already used this coupon' }
  }
  return { valid: true }
}

couponSchema.methods.calcDiscount = function (subtotal) {
  let discount = this.type === 'percentage' ? (subtotal * this.value) / 100 : this.value
  if (this.maxDiscount > 0) discount = Math.min(discount, this.maxDiscount)
  return parseFloat(discount.toFixed(2))
}

// ── BANNER ────────────────────────────────────────────────────────────────────
const bannerSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  subtitle:    String,
  description: String,
  ctaText:     String,
  ctaLink:     String,
  image:       { url: String, publicId: String },
  position:    { type: String, enum: ['hero','marketing','promo','sidebar','popup'], default: 'hero' },
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0 },
  startsAt:   Date,
  endsAt:     Date,
  bgColor:    { type: String, default: '#1C1916' },
  textColor:  { type: String, default: '#FFFFFF' },
}, { timestamps: true })

// ── BULK ENQUIRY ──────────────────────────────────────────────────────────────
const enquirySchema = new mongoose.Schema({
  name:      { type: String, required: true },
  company:   String,
  email:     { type: String, required: true },
  phone:     { type: String, required: true },
  products:  { type: String, required: true },
  quantity:  String,
  orderValue:String,
  message:   String,
  status:    { type: String, enum: ['new','contacted','quoted','won','lost'], default: 'new' },
  notes:     String,
  assignedTo:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quotedAmt: Number,
}, { timestamps: true })

// ── CMS PAGE ──────────────────────────────────────────────────────────────────
const cmsPageSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  slug:     { type: String, required: true, unique: true },
  content:  { type: String, required: true },
  metaTitle:String,
  metaDesc: String,
  isActive: { type: Boolean, default: true },
  isSystem: { type: Boolean, default: false }, // system pages can't be deleted
}, { timestamps: true })

// ── INVENTORY LOG ─────────────────────────────────────────────────────────────
const inventoryLogSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type:      { type: String, enum: ['in','out','adjustment','return','damage'], required: true },
  quantity:  { type: Number, required: true },
  prevStock: Number,
  newStock:  Number,
  note:      String,
  reference: String, // order number or PO number
  doneBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports.Coupon       = mongoose.model('Coupon', couponSchema)
module.exports.Banner       = mongoose.model('Banner', bannerSchema)
module.exports.BulkEnquiry  = mongoose.model('BulkEnquiry', enquirySchema)
module.exports.CmsPage      = mongoose.model('CmsPage', cmsPageSchema)
module.exports.InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema)
