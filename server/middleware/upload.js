const cloudinary = require('cloudinary').v2
const multer     = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const makeStorage = (folder) => new CloudinaryStorage({
  cloudinary,
  params: {
    folder: `ironforge/${folder}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
})

const productUpload  = multer({ storage: makeStorage('products'),  limits: { fileSize: 5 * 1024 * 1024 } })
const categoryUpload = multer({ storage: makeStorage('categories'), limits: { fileSize: 2 * 1024 * 1024 } })
const brandUpload    = multer({ storage: makeStorage('brands'),     limits: { fileSize: 2 * 1024 * 1024 } })
const bannerUpload   = multer({ storage: makeStorage('banners'),    limits: { fileSize: 5 * 1024 * 1024 } })
const avatarUpload   = multer({ storage: makeStorage('avatars'),    limits: { fileSize: 2 * 1024 * 1024 } })

const deleteImage = (publicId) => cloudinary.uploader.destroy(publicId)

module.exports = { productUpload, categoryUpload, brandUpload, bannerUpload, avatarUpload, deleteImage, cloudinary }
