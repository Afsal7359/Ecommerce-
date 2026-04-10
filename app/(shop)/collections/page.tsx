'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Star, SlidersHorizontal, ChevronDown, CheckCircle, X, Search, LayoutGrid, List } from 'lucide-react'
import { Header } from '@/components/shop/index'
import { AnnouncementBar } from '@/components/shop/index'
import { Footer } from '@/components/shop/index'
import { WhatsAppButton } from '@/components/shop/index'
import { productAPI, categoryAPI, brandAPI } from '@/lib/api'
import { useCart } from '@/lib/cart'
import toast from 'react-hot-toast'

const SORT_OPTIONS = [
  { label:'Featured',       value:'-soldCount' },
  { label:'Price: Low–High', value:'price' },
  { label:'Price: High–Low', value:'-price' },
  { label:'Best Rated',     value:'-rating' },
  { label:'Newest',         value:'-createdAt' },
]

function CollectionsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addItem } = useCart()

  const [products, setProducts]   = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands]       = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [pages, setPages]         = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [addedId, setAddedId]     = useState<string|null>(null)
  const [viewMode, setViewMode]   = useState<'grid'|'list'>('grid')

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    brand:    searchParams.get('brand')    || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '5000',
    sort:     searchParams.get('sort')     || '-soldCount',
    badge:    searchParams.get('badge')    || '',
  })

  // Sync filters when URL params change (e.g. clicking navbar category links)
  useEffect(() => {
    setFilters({
      search:   searchParams.get('search')   || '',
      category: searchParams.get('category') || '',
      brand:    searchParams.get('brand')    || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '5000',
      sort:     searchParams.get('sort')     || '-soldCount',
      badge:    searchParams.get('badge')    || '',
    })
  }, [searchParams])

  useEffect(() => {
    categoryAPI.list().then((r:any) => setCategories(r.categories || [])).catch(()=>{})
    brandAPI.list().then((r:any)    => setBrands(r.brands || [])).catch(()=>{})
  }, [])

  useEffect(() => {
    loadProducts(1)
  }, [filters])

  const loadProducts = async (p: number) => {
    setLoading(true)
    try {
      const params: any = { page: p, limit: 12, sort: filters.sort }
      if (filters.search)   params.search   = filters.search
      if (filters.category) params.category = filters.category
      if (filters.brand)    params.brand    = filters.brand
      if (filters.badge)    params.badge    = filters.badge
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice && filters.maxPrice !== '5000') params.maxPrice = filters.maxPrice
      const res: any = await productAPI.list(params)
      setProducts(res.products || []); setTotal(res.total || 0)
      setPage(p); setPages(res.pages || 1)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  const handleAdd = (p: any) => {
    addItem({ id: p._id, slug: p.slug, name: p.name, brand: p.brand?.name||'', price: p.price, img: p.images?.[0]?.url||'' })
    toast.success('Added to cart!')
    setAddedId(p._id); setTimeout(() => setAddedId(null), 1500)
  }

  const clearFilters = () => setFilters({ search:'', category:'', brand:'', minPrice:'', maxPrice:'5000', sort:'-soldCount', badge:'' })
  const hasFilters = filters.category || filters.brand || filters.badge || filters.search || filters.minPrice || (filters.maxPrice && filters.maxPrice !== '5000')

  const BADGE_STYLE: Record<string,string> = { new:'bg-brand text-white', sale:'bg-green-500 text-white', hot:'bg-red-500 text-white', bestseller:'bg-purple-500 text-white' }

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <p className="label">Search</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"/>
          <input value={filters.search} onChange={e => setFilters(f=>({...f,search:e.target.value}))}
                 placeholder="Search products…" className="input pl-9 text-sm"/>
        </div>
      </div>
      {/* Category */}
      <div>
        <p className="label">Category</p>
        <div className="space-y-1">
          <button onClick={() => setFilters(f=>({...f,category:''}))}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${!filters.category ? 'bg-orange-50 text-brand font-semibold' : 'text-stone-500 hover:bg-stone-50'}`}>
            All Categories
          </button>
          {categories.map((c:any) => (
            <button key={c._id} onClick={() => setFilters(f=>({...f,category:c.name}))}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${filters.category===c.name ? 'bg-orange-50 text-brand font-semibold' : 'text-stone-500 hover:bg-stone-50'}`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>
      {/* Brand */}
      <div>
        <p className="label">Brand</p>
        <div className="space-y-1">
          <button onClick={() => setFilters(f=>({...f,brand:''}))}
                  className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${!filters.brand ? 'bg-orange-50 text-brand font-semibold' : 'text-stone-500 hover:bg-stone-50'}`}>
            All Brands
          </button>
          {brands.slice(0,10).map((b:any) => (
            <button key={b._id} onClick={() => setFilters(f=>({...f,brand:b.name}))}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${filters.brand===b.name ? 'bg-orange-50 text-brand font-semibold' : 'text-stone-500 hover:bg-stone-50'}`}>
              {b.name}
            </button>
          ))}
        </div>
      </div>
      {/* Price */}
      <div>
        <p className="label">Price Range</p>
        <div className="space-y-2">
          <input type="range" min={0} max={5000} step={50} value={filters.maxPrice || 5000}
                 onChange={e => setFilters(f=>({...f,maxPrice:e.target.value}))}
                 className="w-full accent-brand"/>
          <div className="flex justify-between text-xs text-stone-400">
            <span>AED 0</span>
            <span className="font-semibold text-brand">AED {filters.maxPrice || 5000}</span>
          </div>
        </div>
      </div>
      {/* Badge */}
      <div>
        <p className="label">Filter by</p>
        <div className="flex flex-wrap gap-2">
          {['new','sale','hot','bestseller'].map(b => (
            <button key={b} onClick={() => setFilters(f=>({...f,badge:f.badge===b?'':b}))}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold capitalize border transition-colors
                                ${filters.badge===b ? 'bg-brand text-white border-brand' : 'border-stone-200 text-stone-500 hover:border-brand hover:text-brand'}`}>
              {b}
            </button>
          ))}
        </div>
      </div>
      {hasFilters && (
        <button onClick={clearFilters} className="w-full text-xs text-stone-400 hover:text-red-500 flex items-center justify-center gap-1 py-2">
          <X className="w-3 h-3"/> Clear all filters
        </button>
      )}
    </div>
  )

  return (
    <main>
      <AnnouncementBar/>
      <Header/>

      <div className="bg-white border-b border-stone-100">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-7">
          <nav className="flex items-center gap-2 text-xs text-stone-400 mb-3">
            <Link href="/" className="hover:text-brand">Home</Link> /
            <span className="text-stone-700 font-medium">Products</span>
          </nav>
          <h1 className="font-playfair text-3xl font-black text-stone-900 tracking-tight">
            {filters.category || filters.brand || 'All Products'}
          </h1>
          <p className="text-stone-400 text-sm mt-1">{total} products found</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-white border border-stone-100 rounded-2xl p-5 sticky top-24 shadow-sm">
              <h2 className="font-bold text-sm text-stone-800 mb-5">Filters</h2>
              <FilterPanel/>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3">
              <button onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center gap-2 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium hover:border-brand transition-colors">
                <SlidersHorizontal className="w-4 h-4"/> Filters {hasFilters && <span className="w-5 h-5 bg-brand rounded-full text-white text-xs flex items-center justify-center">!</span>}
              </button>

              {/* Active filter chips */}
              <div className="flex-1 flex gap-2 flex-wrap">
                {filters.category && <span className="flex items-center gap-1 bg-orange-50 text-brand text-xs font-semibold px-3 py-1.5 rounded-full">{filters.category}<button onClick={() => setFilters(f=>({...f,category:''}))}><X className="w-3 h-3"/></button></span>}
                {filters.brand && <span className="flex items-center gap-1 bg-orange-50 text-brand text-xs font-semibold px-3 py-1.5 rounded-full">{filters.brand}<button onClick={() => setFilters(f=>({...f,brand:''}))}><X className="w-3 h-3"/></button></span>}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-stone-400 hidden sm:block">Sort:</span>
                <div className="relative">
                  <select value={filters.sort} onChange={e => setFilters(f=>({...f,sort:e.target.value}))}
                          className="appearance-none bg-white border border-stone-200 rounded-xl px-4 py-2.5 pr-8 text-sm font-medium outline-none focus:border-brand cursor-pointer">
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"/>
                </div>
                <div className="hidden md:flex border border-stone-200 rounded-xl overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode==='grid' ? 'bg-brand text-white' : 'text-stone-400 hover:bg-stone-50'}`}>
                    <LayoutGrid className="w-4 h-4"/>
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2.5 transition-colors ${viewMode==='list' ? 'bg-brand text-white' : 'text-stone-400 hover:bg-stone-50'}`}>
                    <List className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="bg-white border border-stone-100 rounded-2xl h-72 animate-pulse"/>)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-playfair text-2xl font-black text-stone-900 mb-2">No products found</h3>
                <p className="text-stone-400 text-sm mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p: any) => {
                  const disc = p.comparePrice > 0 ? Math.round(((p.comparePrice-p.price)/p.comparePrice)*100) : 0
                  return (
                    <div key={p._id} className="card card-hover group flex flex-col relative overflow-hidden">
                      {p.badge && <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-sm ${BADGE_STYLE[p.badge]}`}>{p.badge}{disc>0?` −${disc}%`:''}</span>}
                      <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all border border-stone-100 hover:border-red-300">
                        <Heart className="w-3.5 h-3.5 text-stone-400"/>
                      </button>
                      <Link href={`/products/${p.slug}`} className="relative h-[165px] bg-stone-50 block overflow-hidden">
                        <Image src={p.images?.[0]?.url||'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop&auto=format'} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized/>
                      </Link>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-brand mb-1">{p.brand?.name}</div>
                        <Link href={`/products/${p.slug}`}><h3 className="text-[13px] font-semibold text-stone-800 leading-snug mb-2 line-clamp-2 hover:text-brand transition-colors">{p.name}</h3></Link>
                        <div className="flex items-center gap-1 mb-3">
                          <div className="flex">{[1,2,3,4,5].map(i=><Star key={i} className={`w-3 h-3 ${i<=Math.round(p.rating||0)?'fill-yellow-400 text-yellow-400':'text-stone-200'}`}/>)}</div>
                          <span className="text-[10px] text-stone-400">({p.numReviews||0})</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div>
                            <span className="font-playfair text-lg font-black text-stone-900">AED {p.price?.toLocaleString()}</span>
                            {p.comparePrice > 0 && <span className="text-xs text-stone-400 line-through ml-1.5">AED {p.comparePrice?.toLocaleString()}</span>}
                          </div>
                          <button onClick={() => handleAdd(p)}
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${addedId===p._id?'bg-green-500 scale-95':'bg-brand hover:bg-[#C94508] hover:scale-110'}`}>
                            {addedId===p._id ? <CheckCircle className="w-4 h-4 text-white"/> : <ShoppingCart className="w-4 h-4 text-white"/>}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* List view */
              <div className="space-y-3">
                {products.map((p: any) => {
                  const disc = p.comparePrice > 0 ? Math.round(((p.comparePrice-p.price)/p.comparePrice)*100) : 0
                  return (
                    <div key={p._id} className="card card-hover group flex gap-4 p-4">
                      <Link href={`/products/${p.slug}`} className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-stone-50">
                        <Image src={p.images?.[0]?.url||'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=200&h=200&fit=crop'} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-400" unoptimized/>
                        {p.badge && <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${BADGE_STYLE[p.badge]}`}>{p.badge}</span>}
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="text-[10px] font-bold tracking-widest uppercase text-brand mb-0.5">{p.brand?.name}</div>
                        <Link href={`/products/${p.slug}`}><h3 className="text-sm font-semibold text-stone-800 hover:text-brand transition-colors line-clamp-2 leading-snug mb-1">{p.name}</h3></Link>
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">{[1,2,3,4,5].map(i=><Star key={i} className={`w-3 h-3 ${i<=Math.round(p.rating||0)?'fill-yellow-400 text-yellow-400':'text-stone-200'}`}/>)}</div>
                          <span className="text-[10px] text-stone-400">({p.numReviews||0})</span>
                        </div>
                        {p.shortDesc && <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed hidden sm:block">{p.shortDesc}</p>}
                      </div>
                      <div className="flex flex-col items-end justify-between shrink-0">
                        <div className="text-right">
                          <div className="font-playfair text-xl font-black text-stone-900">AED {p.price?.toLocaleString()}</div>
                          {p.comparePrice > 0 && <div className="text-xs text-stone-400 line-through">AED {p.comparePrice?.toLocaleString()}</div>}
                          {disc > 0 && <div className="text-xs text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-lg mt-0.5">Save {disc}%</div>}
                        </div>
                        <button onClick={() => handleAdd(p)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${addedId===p._id?'bg-green-500 text-white':'bg-brand hover:bg-[#C94508] text-white'}`}>
                          {addedId===p._id ? <CheckCircle className="w-4 h-4"/> : <ShoppingCart className="w-4 h-4"/>}
                          {addedId===p._id ? 'Added!' : 'Add'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {page > 1 && <button onClick={() => loadProducts(page-1)} className="px-4 py-2 border border-stone-200 rounded-xl text-sm hover:bg-stone-50">← Prev</button>}
                {Array.from({length: Math.min(pages,5)}, (_,i) => i+1).map(p => (
                  <button key={p} onClick={() => loadProducts(p)}
                          className={`w-9 h-9 rounded-xl text-sm font-medium ${p===page?'bg-brand text-white':'border border-stone-200 hover:bg-stone-50'}`}>{p}</button>
                ))}
                {page < pages && <button onClick={() => loadProducts(page+1)} className="px-4 py-2 border border-stone-200 rounded-xl text-sm hover:bg-stone-50">Next →</button>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-white h-full overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-stone-900">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-1.5 rounded-lg hover:bg-stone-100"><X className="w-4 h-4"/></button>
            </div>
            <FilterPanel/>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setShowFilters(false)}/>
        </div>
      )}

      <Footer/>
      <WhatsAppButton/>
    </main>
  )
}

export default function CollectionsPage() {
  return <Suspense><CollectionsContent/></Suspense>
}
