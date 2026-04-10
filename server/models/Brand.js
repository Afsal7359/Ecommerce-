const mongoose = require('mongoose')
const slugify  = require('slugify')

const brandSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, unique: true },
  slug:        { type: String, unique: true },
  logo:        { url: String, publicId: String },
  description: String,
  country:     String,
  website:     String,
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true } })

brandSchema.virtual('productCount', {
  ref: 'Product', localField: '_id', foreignField: 'brand', count: true,
})

brandSchema.pre('save', function (next) {
  if (this.isModified('name')) this.slug = slugify(this.name, { lower: true, strict: true })
  next()
})

module.exports = mongoose.model('Brand', brandSchema)
