const express = require('express')
const router  = express.Router()
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Order   = require('../models/Order')
const Product = require('../models/Product')
const { Coupon } = require('../models/Other')
const { protect, adminOnly, AppError } = require('../middleware/auth')
const emailUtil = require('../utils/email')

// ── CREATE ORDER ──────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shipping, paymentMethod, couponCode, notes } = req.body

    // Validate items and calculate subtotal
    let subtotal = 0
    const orderItems = []
    for (const item of items) {
      const product = await Product.findById(item.product).populate('brand', 'name')
      if (!product || !product.isActive) return next(AppError(`Product ${item.product} not available`, 400))
      if (product.stock < item.quantity) return next(AppError(`Insufficient stock for ${product.name}`, 400))
      const linePrice = product.price * item.quantity
      subtotal += linePrice
      orderItems.push({
        product: product._id, name: product.name,
        image: product.images[0]?.url || '',
        brand: product.brand?.name || '',
        price: product.price, quantity: item.quantity, sku: product.sku,
      })
    }

    // Apply coupon
    let discount = 0
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() })
      if (!coupon) return next(AppError('Invalid coupon code', 400))
      const check = coupon.isValid(req.user._id, subtotal)
      if (!check.valid) return next(AppError(check.msg, 400))
      discount = coupon.calcDiscount(subtotal)
      coupon.usedCount++
      coupon.users.push(req.user._id)
      await coupon.save()
    }

    const shippingFee = Order.getShippingFee(shipping.emirate, subtotal - discount)
    const vat         = parseFloat(((subtotal - discount + shippingFee) * 0.05).toFixed(2))
    const total       = parseFloat((subtotal - discount + shippingFee + vat).toFixed(2))

    const order = await Order.create({
      user: req.user._id, items: orderItems, shipping,
      subtotal, discount, coupon: couponCode || '', shippingFee, vat, total,
      paymentMethod, notes,
      statusHistory: [{ status: 'pending', note: 'Order placed', updatedBy: req.user.name }],
    })

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, soldCount: item.quantity } })
    }

    // Update user stats
    await req.user.constructor.findByIdAndUpdate(req.user._id, {
      $inc: { totalOrders: 1, totalSpent: total },
    })

    // Send confirmation email
    emailUtil.sendOrderConfirmation(order).catch(console.error)

    // Stripe payment intent if online payment
    if (paymentMethod === 'stripe') {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // AED in fils
        currency: 'aed',
        metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
      })
      order.stripePaymentIntentId = intent.id
      await order.save({ validateBeforeSave: false })
      return res.status(201).json({ success: true, order, clientSecret: intent.client_secret })
    }

    res.status(201).json({ success: true, order })
  } catch (e) { next(e) }
})

// ── STRIPE WEBHOOK ────────────────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig   = req.headers['stripe-signature']
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    if (event.type === 'payment_intent.succeeded') {
      const orderId = event.data.object.metadata.orderId
      const order   = await Order.findById(orderId)
      if (order) {
        order.paymentStatus = 'paid'
        order.orderStatus   = 'confirmed'
        order.statusHistory.push({ status: 'confirmed', note: 'Payment received via Stripe' })
        await order.save({ validateBeforeSave: false })
      }
    }
    res.json({ received: true })
  } catch (e) { res.status(400).send(`Webhook Error: ${e.message}`) }
})

// ── USER — own orders ─────────────────────────────────────────────────────────
router.get('/my', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip   = (Number(page) - 1) * Number(limit)
    const total  = await Order.countDocuments({ user: req.user._id })
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt').skip(skip).limit(Number(limit))
    res.json({ success: true, total, pages: Math.ceil(total / limit), orders })
  } catch (e) { next(e) }
})

router.get('/my/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) return next(AppError('Order not found', 404))
    res.json({ success: true, order })
  } catch (e) { next(e) }
})

// ── ADMIN — all orders ────────────────────────────────────────────────────────
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, payStatus, search, from, to } = req.query
    const filter = {}
    if (status)    filter.orderStatus   = status
    if (payStatus) filter.paymentStatus = payStatus
    if (search)    filter.$or = [{ orderNumber: { $regex: search, $options: 'i' } }, { 'shipping.name': { $regex: search, $options: 'i' } }]
    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to)   filter.createdAt.$lte = new Date(to)
    }
    const skip   = (Number(page) - 1) * Number(limit)
    const total  = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt').skip(skip).limit(Number(limit))
    res.json({ success: true, total, pages: Math.ceil(total / limit), orders })
  } catch (e) { next(e) }
})

router.get('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone')
    if (!order) return next(AppError('Order not found', 404))
    res.json({ success: true, order })
  } catch (e) { next(e) }
})

// Update order status
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, note, trackingNumber, courierName } = req.body
    const order = await Order.findById(req.params.id).populate('user', 'email name')
    if (!order) return next(AppError('Order not found', 404))
    order.orderStatus = status
    if (trackingNumber) order.trackingNumber = trackingNumber
    if (courierName)    order.courierName    = courierName
    if (status === 'delivered') order.deliveredAt = new Date()
    order.statusHistory.push({ status, note: note || '', updatedBy: req.user.name })
    await order.save({ validateBeforeSave: false })
    // Send email
    if (order.user?.email)
      emailUtil.sendStatusUpdate(order, status, order.user.email).catch(console.error)
    res.json({ success: true, order })
  } catch (e) { next(e) }
})

// Update payment status
router.put('/:id/payment', protect, adminOnly, async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus: req.body.status }, { new: true })
    if (!order) return next(AppError('Order not found', 404))
    res.json({ success: true, order })
  } catch (e) { next(e) }
})

module.exports = router
