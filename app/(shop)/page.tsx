import AnnouncementBar  from '@/components/shop/AnnouncementBar'
import Header           from '@/components/shop/Header'
import HeroSection      from '@/components/shop/HeroSection'
import CategoryStrip    from '@/components/shop/CategoryStrip'
import FeaturedProducts from '@/components/shop/FeaturedProducts'
import MarketingCards   from '@/components/shop/MarketingCards'
import BrandsSection    from '@/components/shop/BrandsSection'
import PromoBanners     from '@/components/shop/PromoBanners'
import WhyUs            from '@/components/shop/WhyUs'
import Newsletter       from '@/components/shop/Newsletter'
import Footer           from '@/components/shop/Footer'
import WhatsAppButton   from '@/components/shop/WhatsAppButton'

export const dynamic = 'force-dynamic'
export const revalidate = 60

async function getData() {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  const get  = (url: string) => fetch(url, { next:{ revalidate:60 } }).then(r=>r.json()).catch(()=>null)
  const [productsRes, categoriesRes, brandsRes, bannersRes, marketingRes, promoRes] = await Promise.all([
    get(`${base}/products?limit=8&sort=-soldCount`),
    get(`${base}/categories`),
    get(`${base}/brands?featured=true`),
    get(`${base}/banners?position=hero`),
    get(`${base}/banners?position=marketing`),
    get(`${base}/banners?position=promo`),
  ])
  return {
    products:       productsRes?.products    || [],
    categories:     categoriesRes?.categories || [],
    brands:         brandsRes?.brands        || [],
    banners:        bannersRes?.banners      || [],
    marketingCards: marketingRes?.banners    || [],
    promoBanners:   promoRes?.banners        || [],
  }
}

export default async function HomePage() {
  const { products, categories, brands, banners, marketingCards, promoBanners } = await getData()
  return (
    <main className="bg-white">
      <AnnouncementBar/>
      <Header/>
      <HeroSection banners={banners}/>
      <CategoryStrip categories={categories}/>
      <PromoBanners banners={promoBanners}/>
      <FeaturedProducts products={products}/>
      <MarketingCards cards={marketingCards}/>
      <BrandsSection brands={brands}/>
      <WhyUs/>
      <Newsletter/>
      <Footer/>
      <WhatsAppButton/>
    </main>
  )
}
