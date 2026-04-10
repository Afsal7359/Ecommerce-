require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Category = require('../models/Category')
const Brand = require('../models/Brand')
const { CmsPage, Banner } = require('../models/Other')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ironforge')
  console.log('Connected to MongoDB')

  // Create superadmin
  const existing = await User.findOne({ email: 'admin@ironforge.ae' })
  if (!existing) {
    await User.create({ name:'IronForge Admin', email:'admin@ironforge.ae', password:'Admin@1234', role:'superadmin', isActive:true })
    console.log('✅ Admin created: admin@ironforge.ae / Admin@1234')
  }

  // Create categories
  const cats = ['Power Tools','Paints & Painting Tools','Plumbing','Construction Chemicals','Wood & Timber','Fasteners & Joining','Electrical','Measuring & Testing','Gypsum & Drywalls','Waterproofing']
  for (const name of cats) {
    if (!await Category.findOne({ name })) await Category.create({ name, description:`${name} from top brands`, isActive:true })
  }
  console.log('✅ Categories created')

  // Create brands
  const brands = [
    { name:'Bosch', country:'Germany', isFeatured:true },
    { name:'Dewalt', country:'USA', isFeatured:true },
    { name:'Grohe', country:'Germany', isFeatured:true },
    { name:'Jotun', country:'Norway', isFeatured:true },
    { name:'Fischer', country:'Germany', isFeatured:false },
    { name:'Weber', country:'France', isFeatured:false },
    { name:'Mapei', country:'Italy', isFeatured:false },
    { name:'National Paints', country:'UAE', isFeatured:false },
    { name:'Dr. Fixit', country:'India', isFeatured:false },
    { name:'GPlex', country:'Malaysia', isFeatured:false },
  ]
  for (const b of brands) {
    if (!await Brand.findOne({ name: b.name })) await Brand.create({ ...b, isActive:true })
  }
  console.log('✅ Brands created')

  // Create hero banners
  const heroSlides = [
    {
      title: 'Build With Confidence.',
      subtitle: "Dubai's No.1 Hardware Store",
      ctaText: 'Shop Power Tools',
      ctaLink: '/collections?category=Power+Tools',
      image: { url: 'https://i.pinimg.com/1200x/58/3f/b6/583fb6eee46a0e12f3d87326e68e4a39.jpg', publicId: null },
      position: 'hero', sortOrder: 1, isActive: true,
      bgColor: '#1C1916', textColor: '#FFFFFF',
    },
    {
      title: 'Premium Paints & Coatings.',
      subtitle: 'New Collection',
      ctaText: 'Shop Paints',
      ctaLink: '/collections?category=Paints',
      image: { url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1600&h=900&fit=crop&auto=format', publicId: null },
      position: 'hero', sortOrder: 2, isActive: true,
      bgColor: '#1C1916', textColor: '#FFFFFF',
    },
    {
      title: 'Plumbing & Chemical Products.',
      subtitle: 'Full Range Available',
      ctaText: 'Shop Plumbing',
      ctaLink: '/collections?category=Plumbing',
      image: { url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1600&h=900&fit=crop&auto=format', publicId: null },
      position: 'hero', sortOrder: 3, isActive: true,
      bgColor: '#1C1916', textColor: '#FFFFFF',
    },
    {
      title: 'Construction Materials & More.',
      subtitle: 'Bulk Discounts Available',
      ctaText: 'Get Site Quote',
      ctaLink: '/bulk-enquiries',
      image: { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=900&fit=crop&auto=format', publicId: null },
      position: 'hero', sortOrder: 4, isActive: true,
      bgColor: '#1C1916', textColor: '#FFFFFF',
    },
  ]
  const existingBanners = await Banner.countDocuments({ position: 'hero' })
  if (existingBanners === 0) {
    await Banner.insertMany(heroSlides)
    console.log('✅ Hero banners created')
  }

  // Create promo banners
  const promoSlides = [
    {
      title: 'Bosch Power Tools',
      subtitle: 'Up to 15% Off',
      description: 'Drills, grinders & saws from Germany\'s #1 power tool brand.',
      ctaText: 'Shop Now',
      ctaLink: '/collections?brand=Bosch',
      image: { url: 'https://images.unsplash.com/photo-1581147036324-c47a03a81d48?w=800&h=360&fit=crop&auto=format', publicId: null },
      position: 'promo', sortOrder: 1, isActive: true,
    },
    {
      title: 'Premium Paints & Coatings',
      subtitle: 'New Arrivals',
      description: 'Jotun, National Paints & MAS — vibrant colours, lasting finish.',
      ctaText: 'Shop Now',
      ctaLink: '/collections?category=Paints+%26+Painting+Tools',
      image: { url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=360&fit=crop&auto=format', publicId: null },
      position: 'promo', sortOrder: 2, isActive: true,
    },
  ]
  const existingPromo = await Banner.countDocuments({ position: 'promo' })
  if (existingPromo === 0) {
    await Banner.insertMany(promoSlides)
    console.log('✅ Promo banners created')
  }

  // Create marketing cards
  const marketingSlides = [
    {
      title: 'Built for Builders.',
      subtitle: 'Professional Grade',
      description: 'From foundation to finish — IronForge stocks every material, tool and fitting for any scale of project across UAE.',
      ctaText: 'Shop All Categories',
      ctaLink: '/collections',
      image: { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=640&fit=crop&auto=format', publicId: null },
      position: 'marketing', sortOrder: 1, isActive: true,
    },
    {
      title: 'Volume Pricing for Contractors.',
      subtitle: 'B2B & Bulk Orders',
      description: 'Get competitive quotes on bulk orders for construction materials, paints, electrical & more. Trusted by 500+ UAE contractors.',
      ctaText: 'Request Bulk Quote',
      ctaLink: '/bulk-enquiries',
      image: { url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&h=640&fit=crop&auto=format', publicId: null },
      position: 'marketing', sortOrder: 2, isActive: true,
    },
  ]
  const existingMarketing = await Banner.countDocuments({ position: 'marketing' })
  if (existingMarketing === 0) {
    await Banner.insertMany(marketingSlides)
    console.log('✅ Marketing cards created')
  }

  // Create CMS pages
  const pages = [
    { title:'About Us', slug:'about', content:'<h1>About IronForge Hardware</h1><p>Dubai\'s #1 online hardware store since 2019.</p>', isSystem:true, isActive:true },
    { title:'Privacy Policy', slug:'privacy', content:'<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>', isSystem:true, isActive:true },
    { title:'Terms & Conditions', slug:'terms', content:'<h1>Terms & Conditions</h1><p>By using our site you agree to these terms.</p>', isSystem:true, isActive:true },
    { title:'Shipping Policy', slug:'shipping', content:'<h1>Shipping Policy</h1><p>Free delivery on orders over AED 300. Same-day dispatch available.</p>', isSystem:true, isActive:true },
    { title:'Return Policy', slug:'returns', content:'<h1>Return Policy</h1><p>Easy 7-day returns on all orders.</p>', isSystem:true, isActive:true },
  ]
  for (const p of pages) {
    if (!await CmsPage.findOne({ slug: p.slug })) await CmsPage.create(p)
  }
  console.log('✅ CMS pages created')

  // Create products
  const products = [
    { name:'Bosch Rotary Hammer Drill 800W',    brand: 'Bosch',  cat: 'Power Tools', price: 950, stock: 15, images: [{url:'https://images.unsplash.com/photo-1572981779307-38b8cabb2407', isMain:true}], description: 'Professional rotary hammer drill.', slug: 'bosch-rotary-hammer' },
    { name:'DeWalt Circular Saw 1350W 185mm',  brand: 'Dewalt', cat: 'Power Tools', price: 530, stock: 20, images: [{url:'https://images.unsplash.com/photo-1609205807936-7b2bb7bce547', isMain:true}], description: 'High powered circular saw.', slug: 'dewalt-circular-saw' },
    { name:'Bosch Angle Grinder 900W 115mm',   brand: 'Bosch',  cat: 'Power Tools', price: 335, stock: 30, images: [{url:'https://images.unsplash.com/photo-1581147036324-c47a03a81d48', isMain:true}], description: 'Compact and powerful grinder.', slug: 'bosch-angle-grinder' },
    { name:'Grohe Kitchen Sink Mixer Chrome',  brand: 'Grohe',  cat: 'Plumbing',    price: 360, stock: 12, images: [{url:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13', isMain:true}], description: 'Premium kitchen mixer.', slug: 'grohe-mixer' },
    { name:'Jotun Fenomastic Pure Colors',     brand: 'Jotun',  cat: 'Paints & Painting Tools', price: 120, stock: 50, images: [{url:'https://images.unsplash.com/photo-1589939705384-5185137a7f0f', isMain:true}], description: 'Excellent paint formulation.', slug: 'jotun-fenomastic' },
    { name:'Fischer SX Plug Box (100 pcs)',    brand: 'Fischer',cat: 'Fasteners & Joining', price: 45,  stock: 100, images: [{url:'https://images.unsplash.com/photo-1601999109332-7eba49e4b81e', isMain:true}], description: 'High quality nylon plugs.', slug: 'fischer-sx-plug' },
    { name:'Mapei Keraflex Maxi S1 25kg',      brand: 'Mapei',  cat: 'Construction Chemicals', price: 85, stock: 200, images: [{url:'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae', isMain:true}], description: 'Premium tile adhesive.', slug: 'mapei-keraflex' },
    { name:'GPlex MDF White Sheet 1.2x2.4m',   brand: 'GPlex',  cat: 'Wood & Timber', price: 140, stock: 35, images: [{url:'https://images.unsplash.com/photo-1542621334-a254cf47733d', isMain:true}], description: 'Durable MDF sheets.', slug: 'gplex-mdf-white' },
    { name:'Weber Saint-Gobain Plaster 25kg',  brand: 'Weber',  cat: 'Construction Chemicals', price: 35, stock: 150, images: [{url:'https://images.unsplash.com/photo-1600880292203-757bb62b4baf', isMain:true}], description: 'Smoothening plaster.', slug: 'weber-plaster' },
    { name:'National Paints Enamel Gloss 1GL', brand: 'National Paints', cat: 'Paints & Painting Tools', price: 80, stock: 60, images: [{url:'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd', isMain:true}], description: 'Glossy finish enamel.', slug: 'national-enamel-gloss' },
  ];
  
  const Product = require('../models/Product');
  for (const p of products) {
    if (!await Product.findOne({ slug: p.slug })) {
      const b = await Brand.findOne({ name: p.brand });
      const c = await Category.findOne({ name: p.cat });
      if (b && c) {
        await Product.create({
          name: p.name, slug: p.slug, sku: p.slug + '-1', description: p.description,
          category: c._id, brand: b._id, price: p.price, images: p.images, stock: p.stock,
          isActive: true
        });
      }
    }
  }
  console.log('✅ Products created')

  console.log('\n🎉 Seed complete! Login: admin@ironforge.ae / Admin@1234')
  process.exit(0)
}
seed().catch(e => { console.error(e); process.exit(1) })
