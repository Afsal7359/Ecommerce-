require('dotenv').config({ path: '../.env' })
const express     = require('express')
const mongoose    = require('mongoose')
const cors        = require('cors')
const helmet      = require('helmet')
const morgan      = require('morgan')
const compression = require('compression')
const rateLimit   = require('express-rate-limit')

const authRoutes      = require('./routes/auth')
const productRoutes   = require('./routes/products')
const orderRoutes     = require('./routes/orders')
const {
  categoryRouter, brandRouter, userRouter, couponRouter,
  bannerRouter, cmsRouter, enquiryRouter, analyticsRouter, inventoryRouter,
} = require('./routes/allRoutes')

const app = express()

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3002'], credentials: true }))
app.use(compression())
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))
 
// Raw body for Stripe webhook
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }))
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }))

// Routes
app.use('/api/auth',      authRoutes)
app.use('/api/products',  productRoutes)
app.use('/api/orders',    orderRoutes)
app.use('/api/categories',categoryRouter)
app.use('/api/brands',    brandRouter)
app.use('/api/users',     userRouter)
app.use('/api/coupons',   couponRouter)
app.use('/api/banners',   bannerRouter)
app.use('/api/cms',       cmsRouter)
app.use('/api/enquiries', enquiryRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/inventory', inventoryRouter)

// Health
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }))

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }))

// Error handler
app.use((err, req, res, next) => {
  console.error('❌', err.message)
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server error' })
})

// Connect DB and start
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ironforge')
  .then(() => {
    console.log('✅ MongoDB connected')
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => console.log(`🚀 API running → http://localhost:${PORT}/api`))
  })
  .catch(err => { console.error('❌ DB Error:', err.message); process.exit(1) })
