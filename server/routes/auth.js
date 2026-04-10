const router = require('express').Router()
const crypto = require('crypto')
const User   = require('../models/User')
const { protect, sendToken, AppError } = require('../middleware/auth')
const email  = require('../utils/email')

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email: em, password, phone } = req.body
    if (await User.findOne({ email: em })) return next(AppError('Email already registered', 400))
    const user = await User.create({ name, email: em, password, phone })
    email.sendWelcome(user).catch(console.error)
    sendToken(user, 201, res)
  } catch (e) { next(e) }
})

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email: em, password } = req.body
    if (!em || !password) return next(AppError('Email and password required', 400))
    const user = await User.findOne({ email: em }).select('+password')
    if (!user || !(await user.comparePassword(password)))
      return next(AppError('Invalid credentials', 401))
    if (!user.isActive) return next(AppError('Account deactivated', 401))
    user.lastLogin = new Date(); await user.save({ validateBeforeSave: false })
    sendToken(user, 200, res)
  } catch (e) { next(e) }
})

// Get me
router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }))

// Update profile
router.put('/me', protect, async (req, res, next) => {
  try {
    const { name, phone } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true })
    res.json({ success: true, user })
  } catch (e) { next(e) }
})

// Change password
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.comparePassword(currentPassword))) return next(AppError('Wrong current password', 400))
    user.password = newPassword
    await user.save()
    sendToken(user, 200, res)
  } catch (e) { next(e) }
})

// Forgot password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) return next(AppError('No user with that email', 404))
    const token = crypto.randomBytes(32).toString('hex')
    user.resetToken   = crypto.createHash('sha256').update(token).digest('hex')
    user.resetExpires = Date.now() + 60 * 60 * 1000
    await user.save({ validateBeforeSave: false })
    const link = `${process.env.CLIENT_URL}/reset-password/${token}`
    await email.sendPasswordReset(user, link)
    res.json({ success: true, message: 'Reset link sent to your email' })
  } catch (e) { next(e) }
})

// Reset password
router.put('/reset-password/:token', async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({ resetToken: hashed, resetExpires: { $gt: Date.now() } })
    if (!user) return next(AppError('Invalid or expired reset token', 400))
    user.password     = req.body.password
    user.resetToken   = undefined
    user.resetExpires = undefined
    await user.save()
    sendToken(user, 200, res)
  } catch (e) { next(e) }
})

// Wishlist toggle
router.post('/wishlist/:productId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const pid  = req.params.productId
    const idx  = user.wishlist.indexOf(pid)
    if (idx > -1) user.wishlist.splice(idx, 1)
    else user.wishlist.push(pid)
    await user.save({ validateBeforeSave: false })
    res.json({ success: true, wishlist: user.wishlist })
  } catch (e) { next(e) }
})

module.exports = router
