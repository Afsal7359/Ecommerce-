const mongoose = require('mongoose')
const slugify  = require('slugify')

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, unique: true },
  slug:        { type: String, unique: true },
  description: String,
  image:       { url: String, publicId: String },
  parent:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
  metaTitle:   String,
  metaDesc:    String,
}, { timestamps: true, toJSON: { virtuals: true } })

categorySchema.virtual('productCount', {
  ref: 'Product', localField: '_id', foreignField: 'category', count: true,
})

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) this.slug = slugify(this.name, { lower: true, strict: true })
  next()
})

module.exports = mongoose.model('Category', categorySchema)
