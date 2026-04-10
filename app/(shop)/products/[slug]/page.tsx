'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCart, Heart, Star, ChevronRight, Truck, Shield, RefreshCw,
  Plus, Minus, CheckCircle, Share2, ZoomIn, Package, Tag,
} from 'lucide-react'
import AnnouncementBar from '@/components/shop/AnnouncementBar'
import Header from '@/components/shop/Header'
import Footer from '@/components/shop/Footer'
import WhatsAppButton from '@/components/shop/WhatsAppButton'
import { productAPI, authAPI } from '@/lib/api'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

const BADGE_COLOR: Record<string, string> = {
  new: 'bg-brand text-white', sale: 'bg-green-500 text-white',
  hot: 'bg-red-500 text-white', bestseller: 'bg-purple-600 text-white',
}

type Tab = 'description' | 'features' | 'specs' | 'reviews'

export default function ProductPage() {
  const { slug } = useParams() as { slug: string }
  const router = useRouter()
  const { addItem } = useCart()
  const { user } = useAuth()

  const [product, setProduct]   = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [related, setRelated]   = useState<any[]>([])
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty]           = useState(1)
  const [tab, setTab]           = useState<Tab>('description')
  const [added, setAdded]       = useState(false)
  const [wished, setWished]     = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [wishLoading, setWishLoading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    productAPI.bySlug(slug)
      .then((res: any) => {
        setProduct(res.product)
        // load related
        const cat = res.product.category?.name
        if (cat) {
          productAPI.list({ category: cat, limit: 4 }).then((r: any) => {
            setRelated((r.products || []).filter((p: any) => p._id !== res.product._id).slice(0, 4))
          }).catch(() => {})
        }
      })
      .catch(() => { toast.error('Product not found'); router.push('/collections') })
      .finally(() => setLoading(false))
  }, [slug])

  const handleAdd = () => {
    if (!product) return
    addItem({
      id: product._id, slug: product.slug, name: product.name,
      brand: product.brand?.name || '', price: product.price,
      img: product.images?.[0]?.url || '',
    })
    toast.success('Added to cart!')
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login to use wishlist'); router.push('/login'); return }
    setWishLoading(true)
    try {
      await authAPI.wishlist(product._id)
      setWished(w => !w)
      toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist!')
    } catch { toast.error('Failed to update wishlist') }
    finally { setWishLoading(false) }
  }

  const handleReview = async () => {
    if (!user) { toast.error('Please login to leave a review'); return }
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return }
    setSubmitting(true)
    try {
      await productAPI.addReview(product._id, reviewForm)
      toast.success('Review submitted for approval!')
      setReviewForm({ rating: 5, comment: '' })
      // Refresh product
      const res: any = await productAPI.bySlug(slug)
      setProduct(res.product)
    } catch (e: any) { toast.error(e.message) }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <main className="bg-white">
      <AnnouncementBar />
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-stone-100 rounded-2xl h-96 animate-pulse" />
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="bg-stone-100 rounded-xl h-8 animate-pulse" style={{width: `${90-i*10}%`}}/>)}
          </div>
        </div>
      </div>
    </main>
  )

  if (!product) return null

  const disc = product.comparePrice > 0
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const approvedReviews = (product.reviews || []).filter((r: any) => r.isApproved)
  const specs = product.specs ? Object.entries(product.specs) : []
  const images = product.images?.length ? product.images : [{ url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop' }]

  return (
    <main className="bg-white">
      <AnnouncementBar />
      <Header />

      {/* Breadcrumb */}
      <div className="bg-stone-50 border-b border-stone-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-3 flex items-center gap-1.5 text-xs text-stone-400">
          <Link href="/" className="hover:text-brand transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/collections" className="hover:text-brand transition-colors">Products</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/collections?category=${encodeURIComponent(product.category.name)}`} className="hover:text-brand transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-600 truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* Main product section */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 aspect-square max-h-[520px] group">
              <Image
                src={images[activeImg]?.url || images[0]?.url}
                alt={product.name}
                fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                priority unoptimized
              />
              {product.badge && (
                <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${BADGE_COLOR[product.badge] || 'bg-stone-200 text-stone-600'}`}>
                  {product.badge}{disc > 0 ? ` −${disc}%` : ''}
                </span>
              )}
              <button className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-stone-500" />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-brand shadow-md' : 'border-stone-200 hover:border-stone-300'}`}>
                    <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Brand + badge */}
            <div className="flex items-center gap-3 mb-3">
              <Link href={`/collections?brand=${encodeURIComponent(product.brand?.name || '')}`}
                    className="text-xs font-bold tracking-widest uppercase text-brand hover:underline">
                {product.brand?.name}
              </Link>
              {product.sku && <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-mono">SKU: {product.sku}</span>}
            </div>

            <h1 className="font-playfair text-2xl md:text-[32px] font-black text-stone-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {(product.numReviews || 0) > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-stone-200'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-stone-700">{product.rating?.toFixed(1)}</span>
                <button onClick={() => setTab('reviews')} className="text-sm text-stone-400 hover:text-brand transition-colors underline underline-offset-2">
                  ({product.numReviews} reviews)
                </button>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-6 pb-6 border-b border-stone-100">
              <span className="font-playfair text-4xl font-black text-stone-900">
                AED {product.price?.toLocaleString()}
              </span>
              {product.comparePrice > 0 && (
                <>
                  <span className="text-xl text-stone-400 line-through">AED {product.comparePrice?.toLocaleString()}</span>
                  <span className="bg-green-50 text-green-700 font-bold text-sm px-2.5 py-1 rounded-lg">Save {disc}%</span>
                </>
              )}
            </div>

            {/* Short desc */}
            {product.shortDesc && (
              <p className="text-stone-600 text-sm leading-relaxed mb-6">{product.shortDesc}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <span className={`flex items-center gap-1.5 text-sm font-semibold ${product.stock <= (product.lowStockAlert || 5) ? 'text-amber-600' : 'text-green-700'}`}>
                  <CheckCircle className="w-4 h-4" />
                  {product.stock <= (product.lowStockAlert || 5)
                    ? `Only ${product.stock} left in stock!`
                    : 'In Stock'}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-red-600">
                  <Package className="w-4 h-4" /> Out of Stock
                </span>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            {product.stock > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 w-fit">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-white rounded-xl transition-all">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-stone-900">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="w-11 h-11 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-white rounded-xl transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={handleAdd}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl font-bold text-sm transition-all ${added ? 'bg-green-500 text-white' : 'bg-brand hover:bg-[#C94508] text-white hover:-translate-y-0.5'}`}>
                  {added ? <CheckCircle className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {added ? 'Added to Cart!' : 'Add to Cart'}
                </button>
                <button onClick={handleWishlist} disabled={wishLoading}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all ${wished ? 'border-red-400 bg-red-50 text-red-500' : 'border-stone-200 hover:border-brand text-stone-400 hover:text-brand'}`}>
                  <Heart className={`w-5 h-5 ${wished ? 'fill-red-400' : ''}`} />
                </button>
              </div>
            )}

            {/* Buy now */}
            {product.stock > 0 && (
              <div className="flex gap-3 mb-8">
                <Link href="/checkout" onClick={handleAdd}
                  className="flex-1 btn-outline flex items-center justify-center gap-2 py-3">
                  Buy Now — Checkout
                </Link>
                <button className="w-12 h-12 border-2 border-stone-200 hover:border-stone-400 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Truck className="w-4 h-4 text-brand" />, label: 'Free Shipping', sub: 'Orders AED 300+' },
                { icon: <Shield className="w-4 h-4 text-brand" />, label: '100% Genuine', sub: 'Authorized seller' },
                { icon: <RefreshCw className="w-4 h-4 text-brand" />, label: '7-Day Returns', sub: 'Easy returns' },
              ].map(b => (
                <div key={b.label} className="bg-stone-50 border border-stone-100 rounded-xl p-3 text-center">
                  <div className="flex justify-center mb-1">{b.icon}</div>
                  <div className="text-xs font-bold text-stone-700">{b.label}</div>
                  <div className="text-[10px] text-stone-400">{b.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Features / Specs / Reviews */}
        <div className="mt-16">
          <div className="flex border-b border-stone-200 mb-8 overflow-x-auto scrollbar-hide">
            {([
              ['description', 'Description'],
              ['features', `Features${product.features?.length ? ` (${product.features.length})` : ''}`],
              ['specs', `Specifications${specs.length ? ` (${specs.length})` : ''}`],
              ['reviews', `Reviews (${approvedReviews.length})`],
            ] as [Tab, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all -mb-px ${tab === key ? 'border-brand text-brand' : 'border-transparent text-stone-500 hover:text-stone-800'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Description tab */}
          {tab === 'description' && (
            <div className="prose prose-stone max-w-none text-sm leading-relaxed text-stone-700">
              {product.description ? (
                <div className="whitespace-pre-wrap">{product.description}</div>
              ) : (
                <p className="text-stone-400">No description available.</p>
              )}
            </div>
          )}

          {/* Features tab */}
          {tab === 'features' && (
            <div>
              {product.features?.length ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">
                      <CheckCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                      <span className="text-sm text-stone-700">{f}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-400 text-sm">No features listed.</p>
              )}
            </div>
          )}

          {/* Specs tab */}
          {tab === 'specs' && (
            <div>
              {specs.length ? (
                <div className="overflow-hidden rounded-2xl border border-stone-200">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-stone-100">
                      {specs.map(([key, val]: [string, any], i: number) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-stone-50' : 'bg-white'}>
                          <td className="px-5 py-3 font-semibold text-stone-700 w-40 capitalize">
                            {String(key).replace(/_/g, ' ')}
                          </td>
                          <td className="px-5 py-3 text-stone-600">{String(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-stone-400 text-sm">No specifications available.</p>
              )}
            </div>
          )}

          {/* Reviews tab */}
          {tab === 'reviews' && (
            <div className="space-y-8">
              {/* Rating summary */}
              {approvedReviews.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-8 bg-stone-50 rounded-2xl p-6 border border-stone-100">
                  <div className="text-center">
                    <div className="font-playfair text-6xl font-black text-stone-900">{product.rating?.toFixed(1)}</div>
                    <div className="flex justify-center mt-2">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-5 h-5 ${i <= Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-stone-200'}`} />
                      ))}
                    </div>
                    <div className="text-sm text-stone-500 mt-1">{product.numReviews} reviews</div>
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    {[5,4,3,2,1].map(star => {
                      const count = approvedReviews.filter((r: any) => r.rating === star).length
                      const pct = approvedReviews.length ? (count / approvedReviews.length) * 100 : 0
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-stone-500 w-4">{star}</span>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 bg-stone-200 rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-stone-400 w-6">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Review list */}
              <div className="space-y-4">
                {approvedReviews.map((r: any) => (
                  <div key={r._id} className="border border-stone-100 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold text-sm">
                          {r.user?.name?.[0] || 'U'}
                        </div>
                        <span className="font-semibold text-stone-800 text-sm">{r.user?.name || 'Customer'}</span>
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
                {approvedReviews.length === 0 && (
                  <p className="text-stone-400 text-sm text-center py-8">No reviews yet. Be the first to review this product!</p>
                )}
              </div>

              {/* Write review form */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
                <h3 className="font-bold text-stone-900 mb-4">Write a Review</h3>
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <button key={i} onClick={() => setReviewForm(f => ({ ...f, rating: i }))}>
                      <Star className={`w-6 h-6 transition-colors ${i <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300 hover:text-yellow-300'}`} />
                    </button>
                  ))}
                  <span className="text-sm text-stone-500 ml-2">{reviewForm.rating}/5</span>
                </div>
                <textarea
                  rows={4}
                  className="input resize-none mb-3"
                  placeholder="Share your experience with this product..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                />
                <button onClick={handleReview} disabled={submitting}
                  className="btn-primary flex items-center gap-2">
                  {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  Submit Review
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="section-label">You May Also Like</p>
                <h2 className="font-playfair text-2xl font-black text-stone-900">Related Products</h2>
              </div>
              <Link href={`/collections?category=${encodeURIComponent(product.category?.name || '')}`}
                className="text-sm text-stone-400 hover:text-brand underline underline-offset-4 hidden sm:block">View All →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p: any) => {
                const d = p.comparePrice > 0 ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0
                return (
                  <Link key={p._id} href={`/products/${p.slug}`}
                    className="card card-hover group flex flex-col">
                    <div className="relative h-40 bg-stone-50 overflow-hidden rounded-t-2xl">
                      <Image src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop'} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                      {p.badge && <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${BADGE_COLOR[p.badge] || 'bg-stone-200 text-stone-600'}`}>{p.badge}</span>}
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] font-bold uppercase text-brand tracking-wide mb-1">{p.brand?.name}</div>
                      <p className="text-sm font-semibold text-stone-800 line-clamp-2 leading-snug mb-2">{p.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="font-black text-stone-900">AED {p.price?.toLocaleString()}</span>
                        {d > 0 && <span className="text-xs text-stone-400 line-through">AED {p.comparePrice}</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
