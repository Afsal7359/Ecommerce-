const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:      String,
  image:     String,
  brand:     String,
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  sku:       String,
})

const shippingSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  phone:   { type: String, required: true },
  line1:   { type: String, required: true },
  line2:   String,
  city:    { type: String, required: true },
  emirate: { type: String, required: true },
  country: { type: String, default: 'UAE' },
})

// UAE delivery zones
const ZONE_FEES = {
  Dubai: 15, 'Abu Dhabi': 25, Sharjah: 20, Ajman: 20,
  RAK: 30, Fujairah: 35, UAQ: 25,
}

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestEmail:  String,
  items:       [itemSchema],
  shipping:    shippingSchema,
  subtotal:    { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  discount:    { type: Number, default: 0 },
  coupon:      { type: String, default: '' },
  vat:         { type: Number, default: 0 },    // 5% UAE VAT
  total:       { type: Number, required: true },
  paymentMethod: { type: String, enum: ['stripe','cod','paypal'], required: true },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  stripePaymentIntentId: String,
  orderStatus: {
    type: String,
    enum: ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned'],
    default: 'pending',
  },
  statusHistory: [{
    status: String, note: String, updatedBy: String, at: { type: Date, default: Date.now },
  }],
  notes:        String,
  trackingNumber: String,
  courierName:    String,
  deliveredAt:    Date,
  cancelReason:   String,
  isReviewed:     { type: Boolean, default: false },
}, { timestamps: true })

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderNumber = `IFH-${String(count + 1).padStart(5, '0')}`
  }
  // Calculate VAT (5%)
  this.vat = parseFloat(((this.subtotal - this.discount + this.shippingFee) * 0.05).toFixed(2))
  next()
})

orderSchema.statics.getShippingFee = function (emirate, subtotal) {
  if (subtotal >= 300) return 0  // Free delivery above AED 300
  return ZONE_FEES[emirate] || 30
}

module.exports = mongoose.model('Order', orderSchema)
