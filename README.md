# IronForge Hardware — Full-Stack E-Commerce Platform

A complete, production-ready hardware e-commerce platform built for Dubai/UAE market.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript |
| **Admin Panel** | Next.js `/admin` route (embedded) |
| **Backend** | Express.js 4 + Node.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT (HTTP-only cookies + localStorage) |
| **Images** | Cloudinary (free tier: 25GB) |
| **Payments** | Stripe + Cash on Delivery |
| **Email** | Nodemailer (Gmail SMTP) |
| **Styling** | Tailwind CSS 3 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Fonts** | Playfair Display + Plus Jakarta Sans |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Environment Variables

```bash
cp .env.example .env
# Edit .env with your values
```

Required services (all have free tiers):
- **MongoDB Atlas** — free 512MB cluster → https://mongodb.com/atlas
- **Cloudinary** — free 25GB storage → https://cloudinary.com
- **Stripe** — test mode is free → https://stripe.com
- **Gmail** — enable App Password in Google Account settings

### 3. Seed the Database

```bash
npm run seed
# Creates: admin user, categories, brands, CMS pages
# Admin login: admin@ironforge.ae / Admin@1234
```

### 4. Run Development

```bash
# Run both frontend + backend together
npm run dev

# Or separately:
npm run dev:client   # Next.js → http://localhost:3000
npm run dev:server   # Express → http://localhost:5000
```

---

## 📁 Project Structure

```
ironforge/
├── app/
│   ├── (shop)/              ← Public storefront
│   │   ├── page.tsx         ← Homepage (dynamic, SSR)
│   │   ├── collections/     ← Product listing + filters
│   │   ├── products/[slug]/ ← Product detail
│   │   ├── cart/            ← Shopping cart
│   │   └── checkout/        ← Checkout + Stripe
│   ├── (auth)/
│   │   ├── login/           ← Login page
│   │   └── register/        ← Register page
│   └── admin/               ← 🔐 Admin Panel (protected)
│       ├── page.tsx          ← Dashboard + analytics
│       ├── products/         ← Product CRUD + image upload
│       ├── categories/       ← Category management
│       ├── brands/           ← Brand management
│       ├── orders/           ← Order management + status
│       ├── users/            ← User management + roles
│       ├── inventory/        ← Stock tracking + adjustments
│       ├── banners/          ← Banner management
│       ├── coupons/          ← Discount / coupon system
│       ├── cms/              ← CMS page editor
│       ├── enquiries/        ← Bulk enquiry management
│       └── reports/          ← Sales reports + charts
├── components/
│   ├── admin/AdminUI.tsx     ← Reusable admin components
│   └── shop/index.tsx        ← All shop UI components
├── lib/
│   ├── api.ts               ← Axios API client (all endpoints)
│   ├── auth.tsx             ← Auth context + JWT
│   └── cart.tsx             ← Cart context + localStorage
└── server/                  ← Express.js backend
    ├── models/
    │   ├── User.js
    │   ├── Product.js       ← Full product with reviews, variants
    │   ├── Category.js
    │   ├── Brand.js
    │   ├── Order.js         ← UAE shipping zones + VAT
    │   └── Other.js         ← Coupon, Banner, CmsPage, Enquiry, InventoryLog
    ├── routes/
    │   ├── auth.js          ← Register, login, forgot/reset password
    │   ├── products.js      ← CRUD + search + reviews
    │   ├── orders.js        ← Create, Stripe webhook, status updates
    │   └── allRoutes.js     ← Categories, brands, users, coupons, banners, CMS, analytics, inventory
    ├── middleware/
    │   ├── auth.js          ← JWT protect, adminOnly, superAdminOnly
    │   └── upload.js        ← Cloudinary multer storage
    └── utils/
        ├── email.js         ← Order confirmation, status updates, welcome
        └── seed.js          ← Database seeder
```

---

## 🛡️ Admin Panel Features

Access at: **http://localhost:3000/admin**
Login with seeded credentials.

| Section | Features |
|---------|----------|
| **Dashboard** | Revenue, orders, products stats; sales chart; top products; recent orders |
| **Products** | Full CRUD, image upload (Cloudinary), variants, specs, SEO, stock tracking |
| **Categories** | CRUD with image, SEO, sort order |
| **Brands** | CRUD with logo, featured flag |
| **Orders** | View all orders, update status, tracking number, payment status, email notifications |
| **Users** | List, change role (customer/admin/superadmin), activate/deactivate |
| **Inventory** | Low stock alerts, stock adjustment log, in/out/damage tracking |
| **Banners** | Create/manage homepage banners with images, date scheduling |
| **Coupons** | % or fixed discounts, usage limits, expiry, min order, per-user limits |
| **CMS Pages** | Edit about, privacy, terms, shipping, custom pages |
| **Enquiries** | Manage bulk enquiries, status tracking, WhatsApp integration |
| **Reports** | Revenue charts, order volume, daily/weekly/monthly grouping, VAT breakdown |

---

## 🛒 Frontend Features

- **Homepage** — Dynamic banners, featured products, category grid, brands
- **Collections** — Real-time filters (category, brand, price, badge), sort, pagination
- **Product Detail** — Image gallery, specs, add to cart, wishlist, reviews
- **Cart** — localStorage persistence, qty update, coupon codes, delivery progress
- **Checkout** — UAE emirate-based shipping fees, 5% VAT, Stripe + COD
- **Auth** — Register, login, forgot/reset password, profile management
- **WhatsApp** — Floating chat button

---

## 💳 Payments

### Stripe (Card Payments)
1. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env`
2. Set up webhook in Stripe dashboard → `https://yourdomain.com/api/orders/webhook`
3. Add `STRIPE_WEBHOOK_SECRET` to `.env`

### Cash on Delivery
Works out of the box — no configuration needed.

---

## 🚢 UAE Shipping Zones

| Emirate | Fee |
|---------|-----|
| Dubai | AED 15 |
| Abu Dhabi | AED 25 |
| Sharjah | AED 20 |
| Ajman | AED 20 |
| RAK | AED 30 |
| Fujairah | AED 35 |
| UAQ | AED 25 |
| **Orders AED 300+** | **FREE** |

---

## 🌐 Deployment

### Frontend (Vercel — free)
```bash
vercel --prod
# Set env vars in Vercel dashboard
```

### Backend (Railway / Render — free tier)
```bash
# Set env vars in dashboard
# Start command: node server/server.js
```

### Database (MongoDB Atlas — free 512MB)
Update `MONGO_URI` in `.env`

---

## 📧 Email Setup (Gmail)
1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate password for "Mail"
4. Set `SMTP_USER=yourmail@gmail.com` and `SMTP_PASS=generated_app_password`
