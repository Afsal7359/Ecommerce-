const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const AppError = (msg, code = 400) => { const e = new Error(msg); e.statusCode = code; return e }

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.token
    if (!token) return next(AppError('Not authenticated', 401))
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user || !user.isActive) return next(AppError('User not found or inactive', 401))
    req.user = user
    next()
  } catch (err) {
    next(AppError('Invalid or expired token', 401))
  }
}

const adminOnly = (req, res, next) => {
  if (!['admin', 'superadmin'].includes(req.user?.role))
    return next(AppError('Admin access required', 403))
  next()
}

const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'superadmin')
    return next(AppError('Superadmin access required', 403))
  next()
}

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar,
    },
  })
}

module.exports = { protect, adminOnly, superAdminOnly, signToken, sendToken, AppError }
