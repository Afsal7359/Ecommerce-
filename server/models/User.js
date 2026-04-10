const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const addressSchema = new mongoose.Schema({
  label:    { type: String, default: 'Home' },
  line1:    { type: String, required: true },
  line2:    String,
  city:     { type: String, required: true },
  emirate:  { type: String, enum: ['Dubai','Abu Dhabi','Sharjah','Ajman','RAK','Fujairah','UAQ'], required: true },
  country:  { type: String, default: 'UAE' },
  isDefault:{ type: Boolean, default: false },
}, { _id: true })

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:     { type: String, trim: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  role:      { type: String, enum: ['customer','admin','superadmin'], default: 'customer' },
  avatar:    { type: String, default: '' },
  isActive:  { type: Boolean, default: true },
  isVerified:{ type: Boolean, default: false },
  addresses: [addressSchema],
  wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  totalOrders:  { type: Number, default: 0 },
  totalSpent:   { type: Number, default: 0 },
  lastLogin:    Date,
  resetToken:   String,
  resetExpires: Date,
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}
userSchema.methods.toSafe = function () {
  const o = this.toObject()
  delete o.password; delete o.resetToken; delete o.resetExpires
  return o
}

module.exports = mongoose.model('User', userSchema)
