'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart, Heart, User, Menu, X, Search, Star,
  ChevronDown, ArrowRight, Truck, CheckCircle, RefreshCw,
  MessageCircle, Phone, Mail, MapPin,
  Linkedin, Zap,
} from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

// ── Announcement Bar ──────────────────────────────────────────────────────────
export function AnnouncementBar() {
  const items = [
    '🚚 Free Shipping on orders over AED 300',
    '⚡ Same Day Dispatch on in-stock items',
    '✅ 100% Genuine Products — Authorized Seller',
    '💬 WhatsApp Support: +971 50 216 5805',
  ]
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 3500)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="bg-stone-900 py-2.5 px-4">
      <div className="hidden md:flex items-center justify-center gap-8 flex-wrap max-w-[1400px] mx-auto">
        {items.map((t, i) => (
          <span key={i} className="text-white/70 text-xs font-medium">{t}</span>
        ))}
      </div>
      <div className="md:hidden text-center text-white/80 text-xs font-medium">{items[idx]}</div>
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────
export function Header() {
  const { count } = useCart()
  const { user, isAdmin, logout } = useAuth()
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/collections?search=${encodeURIComponent(query)}`)
  }

  const NAV_LINKS = [
    ['All Products',    '/collections'],
    ['Power Tools',     '/collections?category=Power+Tools'],
    ['Paints',          '/collections?category=Paints+%26+Painting+Tools'],
    ['Plumbing',        '/collections?category=Plumbing'],
    ['Chemicals',       '/collections?category=Construction+Chemicals'],
    ['Wood & Timber',   '/collections?category=Wood+%26+Timber'],
    ['Fasteners',       '/collections?category=Fasteners+%26+Joining'],
    ['Electrical',      '/collections?category=Electrical'],
    ['Bulk Enquiries',  '/bulk-enquiries'],
  ]

  return (
    <>
      <header className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-stone-100'}`}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center gap-4 h-[68px]">
          <Link href="/" className="font-playfair text-2xl md:text-[28px] font-black text-stone-900 tracking-tight shrink-0">
            Iron<span className="text-brand">Forge</span>
          </Link>
          <form onSubmit={onSearch} className="flex-1 max-w-xl relative hidden sm:block">
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search tools, paints, plumbing supplies…"
              className="w-full border border-stone-200 rounded-xl pl-4 pr-11 py-2.5 text-sm bg-stone-50 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 outline-none transition-all" />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-brand transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center gap-2 ml-auto">
            {user ? (
              <div className="relative group hidden lg:block">
                <button className="flex items-center gap-1.5 border border-stone-200 hover:border-brand text-stone-600 hover:text-brand px-3 py-2 rounded-xl text-sm font-medium transition-all">
                  <User className="w-4 h-4" /> {user.name.split(' ')[0]}
                </button>
                <div className="absolute right-0 top-full pt-1 w-48 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden">
                    <Link href="/account" className="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 hover:text-brand transition-colors">
                      <User className="w-3.5 h-3.5" /> My Account
                    </Link>
                    <Link href="/account" className="flex items-center gap-2.5 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 hover:text-brand transition-colors">
                      <ShoppingCart className="w-3.5 h-3.5" /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-brand hover:bg-orange-50 transition-colors border-t border-stone-50">
                        ⚡ Admin Panel
                      </Link>
                    )}
                    <button onClick={logout} className="w-full text-left flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-stone-50">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden lg:flex items-center gap-1.5 border border-stone-200 hover:border-brand text-stone-600 hover:text-brand px-3 py-2 rounded-xl text-sm font-medium transition-all">
                <User className="w-4 h-4" /> Login
              </Link>
            )}
            <Link href="/account" className="hidden lg:flex items-center gap-1.5 border border-stone-200 hover:border-brand text-stone-600 hover:text-brand px-3 py-2 rounded-xl text-sm font-medium transition-all">
              <Heart className="w-4 h-4" /> Wishlist
            </Link>
            <Link href="/cart" className="flex items-center gap-2 bg-brand hover:bg-[#C94508] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-orange-200">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="bg-white text-brand rounded-full w-5 h-5 flex items-center justify-center text-xs font-black">{count}</span>
              )}
            </Link>
            <button onClick={() => setOpen(!open)} className="lg:hidden border border-stone-200 p-2.5 rounded-xl">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <nav className="hidden md:block border-t border-stone-100 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 flex overflow-x-auto scrollbar-hide">
            {NAV_LINKS.map(([label, href]) => (
              <Link key={href} href={href}
                className="px-4 py-3 text-[13px] font-medium text-stone-500 whitespace-nowrap border-b-2 border-transparent hover:text-brand hover:border-brand transition-all first:pl-0">
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-[68px] overflow-y-auto">
          <div className="p-4 border-b border-stone-100">
            <form onSubmit={onSearch} className="relative">
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products…" className="input w-full pl-4 pr-10" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"><Search className="w-4 h-4" /></button>
            </form>
          </div>
          {NAV_LINKS.slice(0, 6).map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="flex items-center justify-between px-5 py-4 border-b border-stone-50 text-sm font-medium text-stone-600 hover:text-brand hover:bg-orange-50 transition-colors">
              {label}<ChevronDown className="w-4 h-4 -rotate-90 opacity-30" />
            </Link>
          ))}
          {user ? (
            <div className="p-4 border-t border-stone-100 space-y-1">
              <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2.5 px-2 text-sm text-stone-600 hover:text-brand">
                <User className="w-4 h-4" /> My Account
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 py-2.5 px-2 text-sm text-brand font-semibold">
                  ⚡ Admin Panel
                </Link>
              )}
              <button onClick={logout} className="flex items-center gap-2 py-2.5 px-2 text-sm text-red-500 w-full">Logout</button>
            </div>
          ) : (
            <div className="p-4 border-t border-stone-100">
              <Link href="/login" onClick={() => setOpen(false)} className="btn-primary w-full flex items-center justify-center">Login / Register</Link>
            </div>
          )}
        </div>
      )}
    </>
  )
}

// ── Hero Section ──────────────────────────────────────────────────────────────
export function HeroSection({ banners }: { banners: any[] }) {
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Build slides from DB banners only
  const slides = banners.length
    ? banners.map((b: any) => {
        // Split title at last space to separate main title and accent word(s)
        const words = (b.title || 'Build With Confidence.').split(' ')
        const accent = words.pop() || ''
        const title  = words.join(' ')
        return {
          image:  b.image?.url || '',
          tag:    b.subtitle || "Dubai's No.1 Hardware Store",
          title,
          accent,
          desc:   'Premium tools, paints, construction materials & plumbing solutions from the world\'s most trusted brands — delivered across the UAE.',
          cta1:   { label: b.ctaText || 'Shop Now', href: b.ctaLink || '/collections' },
          cta2:   { label: 'Get Bulk Quote',         href: '/bulk-enquiries' },
        }
      })
    : [{
        image:  '',
        tag:    "Dubai's No.1 Hardware Store",
        title:  'Build With',
        accent: 'Confidence.',
        desc:   'Premium tools, power equipment & construction materials from world-trusted brands — delivered across the UAE.',
        cta1:   { label: 'Shop Products', href: '/collections' },
        cta2:   { label: 'Get Bulk Quote', href: '/bulk-enquiries' },
      }]

  const goTo = (idx: number) => {
    if (animating) return
    setAnimating(true)
    setActive(idx)
    setTimeout(() => setAnimating(false), 600)
  }

  const prev = () => goTo((active - 1 + slides.length) % slides.length)
  const next = () => goTo((active + 1) % slides.length)

  // Auto-advance
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % slides.length)
    }, 5500)
  }
  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [slides.length])

  // Touch swipe
  const touchStartX = useRef(0)
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); startTimer() }
  }

  const slide = slides[active]

  return (
    <section
      className="relative bg-stone-950 overflow-hidden min-h-[560px] lg:min-h-[640px] select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background images — cross-fade */}
      {slides.map((s, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}>
          {s.image ? (
            <Image src={s.image} alt={s.title} fill className="object-cover" priority={i === 0} unoptimized />
          ) : (
            <div className="absolute inset-0 bg-stone-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/70 to-stone-950/20" />
        </div>
      ))}

      {/* Content */}
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-28 flex flex-col justify-center min-h-[560px] lg:min-h-[640px]">
        <div className="max-w-2xl">
          <div key={`tag-${active}`}
            className="inline-flex items-center gap-2 bg-brand/20 border border-brand/40 text-orange-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 w-fit"
            style={{ animation: 'slideUp 0.5s ease-out both' }}>
            <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
            {slide.tag}
          </div>

          <h1 key={`h1-${active}`} className="font-playfair text-[46px] md:text-[68px] font-black leading-[1.02] text-white tracking-tight mb-5"
            style={{ animation: 'slideUp 0.5s 0.1s ease-out both' }}>
            {slide.title}
            <span className="text-brand block mt-1">{slide.accent}</span>
          </h1>

          <p key={`desc-${active}`} className="text-white/55 text-base md:text-lg leading-relaxed max-w-lg mb-9"
            style={{ animation: 'slideUp 0.5s 0.2s ease-out both' }}>
            {slide.desc}
          </p>

          <div key={`cta-${active}`} className="flex flex-wrap gap-3 mb-12"
            style={{ animation: 'slideUp 0.5s 0.3s ease-out both' }}>
            <Link href={slide.cta1.href}
              className="bg-brand hover:bg-[#C94508] text-white font-bold px-7 py-3.5 rounded-xl text-base flex items-center gap-2 transition-all hover:shadow-xl hover:shadow-brand/30">
              {slide.cta1.label} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={slide.cta2.href}
              className="border-2 border-white/25 text-white hover:border-white/60 hover:bg-white/10 px-7 py-3.5 rounded-xl text-base font-semibold transition-all">
              {slide.cta2.label}
            </Link>
          </div>

          <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10">
            {[['5000+','Products'],['50+','Brands'],['24hr','Delivery'],['10k+','Customers']].map(([v, l]) => (
              <div key={l}>
                <div className="font-playfair text-3xl font-black text-brand">{v}</div>
                <div className="text-[11px] text-white/35 uppercase tracking-widest font-semibold mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Left / Right arrows */}
      <button onClick={() => { prev(); startTimer() }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm z-20 hidden md:flex">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button onClick={() => { next(); startTimer() }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 border border-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm z-20 hidden md:flex">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
      </button>

      {/* Floating badges */}
      <div className="absolute bottom-16 right-6 md:right-14 flex-col gap-3 hidden md:flex">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-brand" />
          </div>
          <div>
            <div className="font-bold text-sm text-stone-900">Same Day Dispatch</div>
            <div className="text-xs text-stone-500">Order before 2 PM</div>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-2 shadow-lg self-end">
          <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}</div>
          <span className="text-xs font-bold text-stone-900">4.9 · 2,000+ reviews</span>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => { goTo(i); startTimer() }}
            className={`rounded-full transition-all duration-300 ${i === active ? 'w-8 h-2.5 bg-brand' : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'}`} />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-5 right-5 md:right-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-white/70 text-xs font-bold z-20">
        {active + 1} / {slides.length}
      </div>
    </section>
  )
}

// ── Category image helper — matches by keyword so DB categories get correct photos ──
function getCategoryImage(name: string, existing?: string): string {
  if (existing) return existing
  const n = name.toLowerCase()
  if (n.includes('power tool') || n.includes('drill') || n.includes('grinder') || n.includes('saw'))
    return 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=400&fit=crop&auto=format'
  if (n.includes('paint'))
    return 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop&auto=format'
  if (n.includes('plumb'))
    return 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop&auto=format'
  if (n.includes('chemical') || n.includes('adhesive') || n.includes('sealant'))
    return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop&auto=format'
  if (n.includes('construct') || n.includes('cement') || n.includes('concrete'))
    return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop&auto=format'
  if (n.includes('wood') || n.includes('timber') || n.includes('mdf') || n.includes('lumber'))
    return 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=400&h=400&fit=crop&auto=format'
  if (n.includes('electr'))
    return 'https://images.unsplash.com/photo-1558002038-bb4237bb4100?w=400&h=400&fit=crop&auto=format'
  if (n.includes('measur') || n.includes('test') || n.includes('level'))
    return 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop&auto=format'
  if (n.includes('fasten') || n.includes('bolt') || n.includes('screw') || n.includes('join') || n.includes('nail'))
    return 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=400&fit=crop&auto=format'
  if (n.includes('water'))
    return 'https://images.unsplash.com/photo-1520923642038-b4259acecbd7?w=400&h=400&fit=crop&auto=format'
  if (n.includes('gypsum') || n.includes('drywall') || n.includes('plaster'))
    return 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop&auto=format'
  if (n.includes('hand tool') || n.includes('hammer') || n.includes('wrench'))
    return 'https://images.unsplash.com/photo-1581147036324-c47a03a81d48?w=400&h=400&fit=crop&auto=format'
  if (n.includes('safety') || n.includes('ppe') || n.includes('protect'))
    return 'https://images.unsplash.com/photo-1578496781985-452d4a934d50?w=400&h=400&fit=crop&auto=format'
  return 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop&auto=format'
}

// ── Category Strip ────────────────────────────────────────────────────────────
export function CategoryStrip({ categories }: { categories: any[] }) {
  const fallback = [
    { name:'Power Tools',          slug:'power-tools',         image:{ url:'' } },
    { name:'Paints & Painting',    slug:'paints',              image:{ url:'' } },
    { name:'Plumbing',             slug:'plumbing',            image:{ url:'' } },
    { name:'Construction Chemicals', slug:'construction',      image:{ url:'' } },
    { name:'Wood & Timber',        slug:'wood-timber',         image:{ url:'' } },
    { name:'Electrical',           slug:'electrical',          image:{ url:'' } },
    { name:'Measuring & Testing',  slug:'measuring',           image:{ url:'' } },
    { name:'Fasteners & Joining',  slug:'fasteners',           image:{ url:'' } },
    { name:'Waterproofing',        slug:'waterproofing',       image:{ url:'' } },
    { name:'Gypsum & Drywalls',    slug:'gypsum',              image:{ url:'' } },
  ]
  const items = categories.length ? categories : fallback
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on mobile every 2.5s
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const cardW = 176 + 12 // min-w + gap
    const tick = () => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10
      if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
      else       el.scrollBy({ left: cardW, behavior: 'smooth' })
    }
    const timer = setInterval(tick, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-stone-50 border-y border-stone-100">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-0.5">Browse</p>
            <h2 className="font-playfair text-2xl md:text-3xl font-black text-stone-900">Shop by Category</h2>
          </div>
          <Link href="/collections" className="text-sm text-stone-400 hover:text-brand transition-colors underline underline-offset-4 hidden sm:block">
            All Products →
          </Link>
        </div>
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4
                     md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible md:gap-5
                     pb-2 md:pb-0"
        >
          {items.map((c: any) => (
            <Link
              key={c.slug || c.name}
              href={`/collections?category=${encodeURIComponent(c.name)}`}
              className="flex flex-col min-w-[168px] md:min-w-0 shrink-0 snap-center rounded-2xl overflow-hidden
                         bg-white border-2 border-stone-100
                         hover:border-brand hover:shadow-[0_8px_32px_rgba(232,84,10,0.18)]
                         hover:-translate-y-1.5 transition-all duration-300 group"
            >
              <div className="relative h-40 md:h-44 overflow-hidden bg-stone-100">
                <Image
                  src={getCategoryImage(c.name, c.image?.url)}
                  alt={c.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
              </div>
              <div className="px-3 py-3.5 text-center">
                <span className="text-sm md:text-base font-bold text-stone-800 group-hover:text-brand transition-colors leading-snug block">
                  {c.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Promo Banners ─────────────────────────────────────────────────────────────
export function PromoBanners({ banners: dbBanners }: { banners?: any[] }) {
  const fallback = [
    { tag:'Up to 15% Off', title:'Bosch Power Tools', sub:'Drills, grinders & saws', href:'/collections?brand=Bosch', img:'https://images.unsplash.com/photo-1581147036324-c47a03a81d48?w=800&h=360&fit=crop&auto=format' },
    { tag:'New Arrivals',  title:'Premium Paints & Coatings', sub:'Jotun, National & MAS', href:'/collections?category=Paints+%26+Painting+Tools', img:'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=360&fit=crop&auto=format' },
  ]
  const items = (dbBanners && dbBanners.length)
    ? dbBanners.slice(0, 2).map((b: any) => ({
        tag:   b.subtitle || 'Featured',
        title: b.title,
        sub:   b.description || '',
        href:  b.ctaLink || '/collections',
        img:   b.image?.url || '',
      }))
    : fallback

  return (
    <section className="bg-stone-50 py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((b, i) => (
            <Link key={i} href={b.href} className="relative rounded-2xl overflow-hidden min-h-[210px] group block">
              {b.img
                ? <Image src={b.img} alt={b.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                : <div className="absolute inset-0 bg-stone-800"/>
              }
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="relative z-10 p-7 flex flex-col h-full justify-center">
                <span className="inline-block bg-brand text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-3 w-fit">{b.tag}</span>
                <h3 className="font-playfair text-2xl md:text-3xl font-black text-white mb-1.5 leading-tight">{b.title}</h3>
                {b.sub && <p className="text-white/70 text-sm mb-5">{b.sub}</p>}
                <span className="inline-flex items-center gap-2 bg-white text-stone-900 font-bold text-sm px-5 py-2.5 rounded-xl group-hover:bg-brand group-hover:text-white transition-colors w-fit">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Featured Products ─────────────────────────────────────────────────────────
export function FeaturedProducts({ products }: { products: any[] }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState<string | null>(null)

  const handleAdd = (p: any) => {
    addItem({ id: p._id, slug: p.slug, name: p.name, brand: p.brand?.name || '', price: p.price, img: p.images?.[0]?.url || '' })
    toast.success('Added to cart!')
    setAdded(p._id)
    setTimeout(() => setAdded(null), 1500)
  }

  const BADGE: Record<string, string> = {
    new: 'bg-brand text-white', sale: 'bg-green-500 text-white',
    hot: 'bg-red-500 text-white', bestseller: 'bg-purple-600 text-white',
  }

  const fallback = [
    { _id:'1', slug:'bosch-hammer',   name:'Rotary Hammer Drill 800W GBH 2-26',   brand:{name:'Bosch'},  price:950,  badge:'new',  rating:4.9, numReviews:128, images:[{url:'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&h=400&fit=crop'}] },
    { _id:'2', slug:'dewalt-saw',     name:'Circular Saw 1350W 185mm DWE560',     brand:{name:'Dewalt'}, price:530,  comparePrice:595, badge:'sale', rating:4.8, numReviews:94, images:[{url:'https://images.unsplash.com/photo-1609205807936-7b2bb7bce547?w=500&h=400&fit=crop'}] },
    { _id:'3', slug:'bosch-grinder',  name:'Angle Grinder 900W 115mm GWS 9-115', brand:{name:'Bosch'},  price:335,  rating:4.7, numReviews:211, images:[{url:'https://images.unsplash.com/photo-1581147036324-c47a03a81d48?w=500&h=400&fit=crop'}] },
    { _id:'4', slug:'dewalt-recip',   name:'Reciprocating Saw 701W DWE305',       brand:{name:'Dewalt'}, price:710,  comparePrice:795, badge:'sale', rating:4.8, numReviews:67, images:[{url:'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&h=400&fit=crop'}] },
    { _id:'5', slug:'grohe-mixer',    name:'Kitchen Sink Mixer Eurosmart Chrome', brand:{name:'Grohe'},  price:360,  rating:4.9, numReviews:82, images:[{url:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=400&fit=crop'}] },
    { _id:'6', slug:'meranti-wood',   name:'Red Meranti Wood Lumbar Grade A 3m',  brand:{name:'GPlex'},  price:90,   rating:4.6, numReviews:45, images:[{url:'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=500&h=400&fit=crop'}] },
    { _id:'7', slug:'bosch-cordless', name:'Cordless Impact Drill 18V 4.0Ah Set', brand:{name:'Bosch'},  price:1735, badge:'hot', rating:4.9, numReviews:156, images:[{url:'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&h=400&fit=crop'}] },
    { _id:'8', slug:'mdf-sheet',      name:'MDF White Melamine Sheet 1.2×2.4m',  brand:{name:'GPlex'},  price:140,  rating:4.7, numReviews:38, images:[{url:'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=400&fit=crop'}] },
  ]
  const items = products.length ? products : fallback

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-label">Top Picks</p>
            <h2 className="section-title">Fast Selling Products</h2>
          </div>
          <Link href="/collections" className="text-sm text-stone-400 underline underline-offset-4 hover:text-brand hidden sm:block">View All →</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p: any) => {
            const disc = p.comparePrice > 0 ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0
            return (
              <div key={p._id} className="card card-hover group flex flex-col relative overflow-hidden">
                {p.badge && (
                  <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-sm ${BADGE[p.badge] || 'bg-stone-200 text-stone-600'}`}>
                    {p.badge}{disc > 0 && p.badge === 'sale' ? ` −${disc}%` : ''}
                  </span>
                )}
                <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all border border-stone-100 hover:border-red-300">
                  <Heart className="w-3.5 h-3.5 text-stone-400" />
                </button>
                <Link href={`/products/${p.slug}`} className="relative h-[170px] bg-stone-50 block overflow-hidden">
                  <Image src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop'} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <div className="text-[10px] font-bold tracking-widest uppercase text-brand mb-1">{p.brand?.name}</div>
                  <Link href={`/products/${p.slug}`}>
                    <h3 className="text-[13px] font-semibold text-stone-800 leading-snug mb-2 line-clamp-2 hover:text-brand transition-colors">{p.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= Math.round(p.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-stone-200'}`} />)}</div>
                    <span className="text-[10px] text-stone-400">({p.numReviews || 0})</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <span className="font-playfair text-lg font-black text-stone-900">AED {p.price?.toLocaleString()}</span>
                      {p.comparePrice > 0 && <span className="text-xs text-stone-400 line-through ml-1.5">AED {p.comparePrice?.toLocaleString()}</span>}
                    </div>
                    <button onClick={() => handleAdd(p)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${added === p._id ? 'bg-green-500 scale-95' : 'bg-brand hover:bg-[#C94508] hover:scale-110'}`}>
                      {added === p._id ? <CheckCircle className="w-4 h-4 text-white" /> : <ShoppingCart className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/collections" className="btn-outline inline-flex items-center gap-2">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Marketing Cards ───────────────────────────────────────────────────────────
export function MarketingCards({ cards }: { cards?: any[] }) {
  const fallback = [
    {
      tag: 'Professional Grade',
      title: 'Built for Builders.',
      desc: 'From foundation to finish — IronForge stocks every material, tool and fitting for any scale of project across UAE.',
      ctaLabel: 'Shop All Categories',
      ctaHref: '/collections',
      img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=640&fit=crop&auto=format',
    },
    {
      tag: 'B2B & Bulk Orders',
      title: 'Volume Pricing for Contractors.',
      desc: 'Get competitive quotes on bulk orders for construction materials, paints, electrical & more. Trusted by 500+ UAE contractors.',
      ctaLabel: 'Request Bulk Quote',
      ctaHref: '/bulk-enquiries',
      img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&h=640&fit=crop&auto=format',
    },
  ]
  const items = (cards && cards.length) ? cards.slice(0, 2) : fallback

  return (
    <section className="bg-stone-50 py-14 md:py-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((c: any, i: number) => (
            <div key={i} className="relative rounded-3xl overflow-hidden min-h-[300px] md:min-h-[380px] flex flex-col justify-end group">
              <Image
                src={c.img || c.image?.url || fallback[i % 2].img}
                alt={c.title || c.name || 'Marketing'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/45 to-stone-950/5" />
              <div className="relative z-10 p-7 md:p-10">
                {(c.tag || c.subtitle) && (
                  <span className="inline-block bg-brand text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-3">
                    {c.tag || c.subtitle}
                  </span>
                )}
                <h3 className="font-playfair text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                  {c.title}
                </h3>
                <p className="text-white/70 text-sm mb-6 max-w-sm leading-relaxed">
                  {c.desc || c.description}
                </p>
                <Link
                  href={c.ctaHref || c.ctaLink || '/collections'}
                  className="inline-flex items-center gap-2 bg-white text-stone-900 font-bold text-sm px-5 py-2.5 rounded-xl group-hover:bg-brand group-hover:text-white transition-colors"
                >
                  {c.ctaLabel || c.ctaText || 'Shop Now'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Brands ────────────────────────────────────────────────────────────────────
export function BrandsSection({ brands }: { brands: any[] }) {
  const fallbackNames = ['BOSCH','DEWALT','GROHE','JOTUN','FISCHER','WEBER','MAPEI','DR. FIXIT','MAKITA','STANLEY']
  const items = brands.length ? brands : fallbackNames.map(n => ({ name: n, slug: n.toLowerCase().replace(/\W/g, '-') }))

  return (
    <section className="bg-white py-14 md:py-18 border-y border-stone-100">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-label">Trusted Partners</p>
            <h2 className="section-title">Shop By Brand</h2>
          </div>
          <Link href="/collections" className="text-sm text-stone-400 underline underline-offset-4 hover:text-brand hidden sm:block">All Brands →</Link>
        </div>
        <div className="grid grid-cols-5 md:grid-cols-10 border border-stone-100 rounded-2xl overflow-hidden bg-white shadow-sm">
          {items.map((b: any) => (
            <Link key={b._id || b.name} href={`/collections?brand=${encodeURIComponent(b.name)}`}
              className="flex items-center justify-center py-6 px-3 border-r border-b border-stone-100 hover:bg-orange-50 text-stone-400 hover:text-brand transition-all group">
              {b.logo?.url ? (
                <div className="relative w-20 h-8">
                  <Image src={b.logo.url} alt={b.name} fill className="object-contain filter grayscale group-hover:grayscale-0 transition-all" unoptimized />
                </div>
              ) : (
                <span className="font-black text-xs md:text-sm uppercase tracking-tight">{b.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Why Us ────────────────────────────────────────────────────────────────────
export function WhyUs() {
  const perks = [
    { icon:<Truck className="w-6 h-6"/>, title:'Free Delivery', desc:'Free shipping on all orders over AED 300. Same-day dispatch for in-stock items across the UAE.', color:'text-blue-600', bg:'bg-blue-50' },
    { icon:<CheckCircle className="w-6 h-6"/>, title:'100% Genuine', desc:'Every product is authentic, sourced directly from authorized distributors and brand partners.', color:'text-green-600', bg:'bg-green-50' },
    { icon:<MessageCircle className="w-6 h-6"/>, title:'Expert Support', desc:'Our team is available via WhatsApp & phone to help you choose the right product for your project.', color:'text-brand', bg:'bg-orange-50' },
    { icon:<RefreshCw className="w-6 h-6"/>, title:'Easy Returns', desc:'Return or exchange within 7 days — no questions asked, completely hassle-free.', color:'text-purple-600', bg:'bg-purple-50' },
  ]
  return (
    <section className="bg-stone-50 py-16 md:py-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="mb-12">
          <p className="section-label">Our Promise</p>
          <h2 className="section-title">Why Choose IronForge?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {perks.map(p => (
            <div key={p.title} className="bg-white border-2 border-stone-100 rounded-2xl p-6 hover:border-brand hover:shadow-[0_8px_32px_rgba(232,84,10,0.10)] transition-all group relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-brand opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
              <div className={`w-12 h-12 ${p.bg} ${p.color} rounded-2xl flex items-center justify-center mb-5`}>{p.icon}</div>
              <h3 className="font-bold text-base text-stone-900 mb-2">{p.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Newsletter ────────────────────────────────────────────────────────────────
export function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone]   = useState(false)
  return (
    <section className="relative bg-stone-900 py-20 px-4 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="relative max-w-2xl mx-auto text-center">
        <span className="inline-block bg-brand/20 border border-brand/30 text-brand px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6">Newsletter</span>
        <h2 className="font-playfair text-[40px] md:text-[52px] font-black text-white mb-4 leading-tight">Get 10% Off Your First Order</h2>
        <p className="text-white/50 text-sm mb-10">Subscribe for exclusive deals, new arrivals & pro tips from the IronForge team.</p>
        {done ? (
          <div className="bg-white/10 border border-white/20 text-white rounded-2xl py-5 px-6 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="font-semibold">You&apos;re in! Check your inbox for your discount code.</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address…"
              className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 px-5 py-4 rounded-xl text-sm outline-none focus:border-brand focus:bg-white/15 transition-all" />
            <button onClick={() => email && setDone(true)}
              className="bg-brand hover:bg-[#C94508] text-white font-bold px-7 py-4 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand/30 whitespace-nowrap">
              Subscribe
            </button>
          </div>
        )}
        <p className="text-white/25 text-xs mt-4">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function Footer() {
  const links = [
    { title:'Categories', items:[['Power Tools','/collections?category=Power+Tools'],['Paints & Coatings','/collections?category=Paints'],['Plumbing Materials','/collections?category=Plumbing'],['Construction Chemicals','/collections?category=Construction'],['Wood & Timber','/collections?category=Wood'],['Fasteners & Anchors','/collections?category=Fasteners']] },
    { title:'Company',    items:[['About Us','/pages/about'],['Bulk Enquiries','/bulk-enquiries'],['Contact Us','/contact'],['Track Order','/account'],['Careers','/pages/careers']] },
    { title:'Support',    items:[['Shipping Policy','/pages/shipping'],['Return & Refund','/pages/returns'],['Terms & Conditions','/pages/terms'],['Privacy Policy','/pages/privacy'],['FAQ','/pages/faq']] },
  ]
  return (
    <footer className="bg-stone-950 pt-16 pb-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          <div>
            <div className="font-playfair text-2xl font-black text-white mb-4">Iron<span className="text-brand">Forge</span></div>
            <p className="text-sm text-white/35 leading-relaxed mb-6 max-w-xs">
              A 100% UAE-based hardware & construction materials company. Premium tools, paints & building solutions since 2019.
            </p>
            <div className="space-y-2 text-sm text-white/40">
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-brand" /> +971 50 216 5805</div>
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-brand" /> hello@ironforge.ae</div>
              <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-brand mt-0.5 shrink-0" /> Dubai Industrial Area, UAE</div>
            </div>
            <div className="flex gap-2 mt-6">
              {(['f','in','ig','yt'] as const).map(s => (
                <button key={s} className="w-9 h-9 border border-white/10 rounded-xl flex items-center justify-center text-white/30 hover:border-brand hover:text-brand hover:bg-brand/10 transition-all text-xs font-bold uppercase">
                  {s === 'in' ? <Linkedin className="w-4 h-4" /> : s}
                </button>
              ))}
            </div>
          </div>
          {links.map(col => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold tracking-[0.12em] uppercase text-white mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.items.map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-sm text-white/40 hover:text-brand transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">© {new Date().getFullYear()} IronForge Hardware LLC. All rights reserved. Dubai, UAE.</p>
          <div className="flex gap-2">{['VISA','MASTERCARD','COD','STRIPE'].map(p => <span key={p} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white/25 tracking-wide">{p}</span>)}</div>
        </div>
      </div>
    </footer>
  )
}

// ── WhatsApp Button ───────────────────────────────────────────────────────────
export function WhatsAppButton() {
  const [shown, setShown] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShown(true), 1500); return () => clearTimeout(t) }, [])
  return (
    <a href="https://wa.me/971502165805?text=Hi%20IronForge!%20I%20need%20help%20with%20an%20order."
      target="_blank" rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 group ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <MessageCircle className="w-6 h-6 text-white fill-white" />
      <span className="absolute right-16 bg-stone-900 text-white text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        Chat on WhatsApp
      </span>
      <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />
    </a>
  )
}
