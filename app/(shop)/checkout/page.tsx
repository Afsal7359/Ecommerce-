'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CreditCard, Truck, ShieldCheck, Tag, Loader2, CheckCircle, User, Eye, EyeOff, MapPin } from 'lucide-react'
import { Header } from '@/components/shop/index'
import { AnnouncementBar } from '@/components/shop/index'
import { Footer } from '@/components/shop/index'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { orderAPI, couponAPI, authAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const EMIRATES = ['Dubai','Abu Dhabi','Sharjah','Ajman','RAK','Fujairah','UAQ']
const ZONE_FEES: Record<string,number> = { Dubai:15,'Abu Dhabi':25,Sharjah:20,Ajman:20,RAK:30,Fujairah:35,UAQ:25 }

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user, register }          = useAuth()
  const router = useRouter()

  const [step, setStep]             = useState<'address'|'payment'|'done'>('address')
  const [placing, setPlacing]       = useState(false)
  const [couponCode, setCoupon]     = useState('')
  const [discount, setDiscount]     = useState(0)
  const [couponLoading, setCL]      = useState(false)
  const [paymentMethod, setPM]      = useState<'stripe'|'cod'>('cod')
  const [orderNumber, setOrderNumber] = useState('')
  const [saveAddress, setSaveAddress] = useState(false)

  // Guest info (shown when not logged in)
  const [guestEmail, setGuestEmail]     = useState('')
  const [guestPassword, setGuestPw]     = useState('')
  const [showPw, setShowPw]             = useState(false)

  const [shipping, setShipping] = useState({
    name: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    line1: '', line2: '', city: 'Dubai', emirate: 'Dubai', country: 'UAE',
  })

  const fee       = total - discount >= 300 ? 0 : (ZONE_FEES[shipping.emirate] || 25)
  const vat       = parseFloat(((total - discount + fee) * 0.05).toFixed(2))
  const grandTotal = parseFloat((total - discount + fee + vat).toFixed(2))
  const remaining  = Math.max(0, 300 - (total - discount))

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCL(true)
    try {
      const res: any = await couponAPI.validate({ code: couponCode, subtotal: total })
      setDiscount(res.discount)
      toast.success(`Coupon applied! You save AED ${res.discount}`)
    } catch (e: any) { toast.error(e.message) }
    finally { setCL(false) }
  }

  const placeOrder = async () => {
    if (!shipping.name || !shipping.phone || !shipping.line1 || !shipping.city) {
      return toast.error('Please fill in all required shipping fields')
    }
    if (items.length === 0) return toast.error('Your cart is empty')

    // Guest validation
    if (!user) {
      if (!guestEmail.trim()) return toast.error('Please enter your email address')
      if (!guestPassword || guestPassword.length < 6) return toast.error('Password must be at least 6 characters')
    }

    setPlacing(true)
    try {
      // Auto-create account for guest
      if (!user) {
        await register({
          name:     shipping.name,
          email:    guestEmail,
          phone:    shipping.phone,
          password: guestPassword,
        })
        toast.success('Account created! You are now logged in.')
      }

      // Place the order (token is now set in localStorage from register/login)
      const res: any = await orderAPI.create({
        items:         items.map(i => ({ product: i.id, quantity: i.quantity })),
        shipping,
        paymentMethod,
        couponCode:    couponCode || undefined,
        notes:         '',
      })

      // Save address to account if requested
      if (saveAddress) {
        try {
          await authAPI.updateProfile({
            newAddress: {
              label:    'Home',
              line1:    shipping.line1,
              line2:    shipping.line2,
              city:     shipping.city,
              emirate:  shipping.emirate,
              country:  shipping.country,
              isDefault: true,
            }
          })
        } catch (_) { /* non-critical */ }
      }

      if (paymentMethod === 'stripe' && res.clientSecret) {
        toast.success('Redirecting to payment…')
        router.push(`/account/orders?new=${res.order._id}`)
      } else {
        setOrderNumber(res.order.orderNumber)
        clearCart()
        setStep('done')
      }
    } catch (e: any) { toast.error(e.message) }
    finally { setPlacing(false) }
  }

  if (items.length === 0 && step !== 'done') return (
    <main>
      <AnnouncementBar/><Header/>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🛒</div>
        <h2 className="font-playfair text-2xl font-black">Your cart is empty</h2>
        <Link href="/collections" className="btn-primary">Start Shopping</Link>
      </div>
      <Footer/>
    </main>
  )

  if (step === 'done') return (
    <main>
      <AnnouncementBar/><Header/>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500"/>
        </div>
        <h1 className="font-playfair text-3xl font-black text-stone-900 mb-2">Order Placed!</h1>
        <p className="text-stone-500 text-sm mb-1">Order #{orderNumber}</p>
        <p className="text-stone-400 text-sm max-w-sm mb-8">
          Thank you! We've sent a confirmation to your email. Your order will be dispatched shortly.
        </p>
        {!user && (
          <div className="bg-brand/10 border border-brand/20 rounded-2xl px-6 py-4 mb-6 text-sm text-brand font-medium max-w-sm">
            Your account has been created. <Link href="/account" className="underline font-bold">Visit your account</Link> to track this order.
          </div>
        )}
        <div className="flex gap-3">
          <Link href="/account" className="btn-primary">Track Order</Link>
          <Link href="/collections" className="btn-outline">Continue Shopping</Link>
        </div>
        <div className="mt-8 p-4 bg-green-50 rounded-2xl text-sm text-green-700 font-medium">
          Questions? <a href="https://wa.me/971502165805" className="underline">Chat on WhatsApp</a>
        </div>
      </div>
      <Footer/>
    </main>
  )

  return (
    <main>
      <AnnouncementBar/><Header/>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-xs text-stone-400 mb-3">
            <Link href="/" className="hover:text-brand">Home</Link> /
            <Link href="/cart" className="hover:text-brand">Cart</Link> /
            <span className="text-stone-700">Checkout</span>
          </nav>
          <h1 className="font-playfair text-3xl font-black text-stone-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left: forms */}
          <div className="space-y-5">

            {/* Guest info — shown only for non-logged-in users */}
            {!user && (
              <div className="bg-white border border-stone-100 rounded-2xl p-6">
                <h2 className="font-bold text-base text-stone-900 mb-1 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand"/> Account Details
                </h2>
                <p className="text-xs text-stone-400 mb-4">
                  We'll automatically create an account so you can track your order.
                  Already have an account? <Link href="/login?redirect=/checkout" className="text-brand hover:underline font-semibold">Sign in</Link>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Email Address *</label>
                    <input type="email" required value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                      className="input" placeholder="you@company.com"/>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Create Password *</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} required value={guestPassword}
                        onChange={e => setGuestPw(e.target.value)}
                        className="input pr-10" placeholder="At least 6 characters"/>
                      <button type="button" onClick={() => setShowPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                        {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery address */}
            <div className="bg-white border border-stone-100 rounded-2xl p-6">
              <h2 className="font-bold text-base text-stone-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand"/> Delivery Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input required value={shipping.name} onChange={e=>setShipping(s=>({...s,name:e.target.value}))} className="input" placeholder="John Smith"/>
                </div>
                <div>
                  <label className="label">Phone / WhatsApp *</label>
                  <input required value={shipping.phone} onChange={e=>setShipping(s=>({...s,phone:e.target.value}))} className="input" placeholder="+971 50 000 0000"/>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address Line 1 *</label>
                  <input required value={shipping.line1} onChange={e=>setShipping(s=>({...s,line1:e.target.value}))} className="input" placeholder="Building, Street name"/>
                </div>
                <div>
                  <label className="label">Address Line 2</label>
                  <input value={shipping.line2} onChange={e=>setShipping(s=>({...s,line2:e.target.value}))} className="input" placeholder="Apt / Floor (optional)"/>
                </div>
                <div>
                  <label className="label">City *</label>
                  <input required value={shipping.city} onChange={e=>setShipping(s=>({...s,city:e.target.value}))} className="input" placeholder="Dubai"/>
                </div>
                <div>
                  <label className="label">Emirate *</label>
                  <select value={shipping.emirate} onChange={e=>setShipping(s=>({...s,emirate:e.target.value}))} className="input appearance-none">
                    {EMIRATES.map(e=><option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              {/* Save address option */}
              <label className="flex items-center gap-2.5 mt-4 cursor-pointer group w-fit">
                <input type="checkbox" className="sr-only" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)}/>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 pointer-events-none ${saveAddress ? 'bg-brand border-brand' : 'border-stone-300 group-hover:border-brand'}`}>
                  {saveAddress && <CheckCircle className="w-3 h-3 text-white fill-white"/>}
                </div>
                <span className="text-sm text-stone-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand shrink-0"/>
                  Save this address to my account
                </span>
              </label>
            </div>

            {/* Payment method */}
            <div className="bg-white border border-stone-100 rounded-2xl p-6">
              <h2 className="font-bold text-base text-stone-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand"/> Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id:'cod',    label:'Cash on Delivery', icon:'💵', desc:'Pay when your order arrives' },
                  { id:'stripe', label:'Credit / Debit Card', icon:'💳', desc:'Visa, Mastercard — powered by Stripe' },
                ].map(pm => (
                  <label key={pm.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${paymentMethod===pm.id ? 'border-brand bg-orange-50' : 'border-stone-100 hover:border-stone-300'}`}>
                    <input type="radio" name="payment" value={pm.id} checked={paymentMethod===pm.id}
                      onChange={() => setPM(pm.id as any)} className="mt-0.5 accent-brand"/>
                    <div>
                      <div className="font-semibold text-sm text-stone-900">{pm.icon} {pm.label}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{pm.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              {paymentMethod === 'stripe' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                  <p className="font-semibold mb-1">🔒 Secure Stripe Payment</p>
                  <p className="text-xs text-blue-600">You'll enter card details securely after placing the order.</p>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[['🔒','Secure Checkout'],['✅','100% Genuine'],['🚚','Free on AED 300+']].map(([i,t])=>(
                <div key={t} className="bg-stone-50 rounded-xl p-3 text-center"><div className="text-lg mb-1">{i}</div><p className="text-[11px] font-semibold text-stone-500">{t}</p></div>
              ))}
            </div>
          </div>

          {/* Right: order summary */}
          <div>
            <div className="bg-white border border-stone-100 rounded-2xl p-5 sticky top-24">
              <h2 className="font-bold text-sm text-stone-900 mb-4">Order Summary ({items.length} items)</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-50 shrink-0 border border-stone-100">
                      {item.img && <Image src={item.img} alt={item.name} fill className="object-cover" unoptimized/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-800 line-clamp-2 leading-tight">{item.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-stone-900 shrink-0">AED {(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400"/>
                  <input value={couponCode} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code"
                    className="input input-sm pl-8 text-xs"/>
                </div>
                <button onClick={applyCoupon} disabled={couponLoading}
                  className="bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-stone-700 transition-colors flex items-center gap-1.5">
                  {couponLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : null} Apply
                </button>
              </div>

              {/* Free delivery progress */}
              {remaining > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-amber-700">Add AED {remaining.toFixed(0)} more for free delivery!</p>
                  <div className="w-full bg-amber-100 rounded-full h-1.5 mt-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width:`${Math.min(100,((total-discount)/300)*100)}%`}}/>
                  </div>
                </div>
              )}
              {remaining === 0 && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 text-xs font-semibold text-green-700">
                  You qualify for free delivery!
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 mb-4 pb-4 border-b border-stone-100">
                <div className="flex justify-between text-sm text-stone-500"><span>Subtotal</span><span>AED {total.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm text-green-600 font-semibold"><span>Discount ({couponCode})</span><span>−AED {discount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-sm text-stone-500"><span>Delivery ({shipping.emirate})</span><span className={fee===0?'text-green-600 font-semibold':''}>{fee===0?'FREE':`AED ${fee}`}</span></div>
                <div className="flex justify-between text-sm text-stone-500"><span>VAT (5%)</span><span>AED {vat.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between items-baseline mb-5">
                <span className="font-bold text-stone-900">Total</span>
                <span className="font-playfair text-2xl font-black text-stone-900">AED {grandTotal.toFixed(2)}</span>
              </div>

              <button onClick={placeOrder} disabled={placing}
                className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-4 rounded-xl transition-all hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {placing
                  ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing…</>
                  : <><ShieldCheck className="w-4 h-4"/> {paymentMethod==='cod'?'Place Order (COD)':'Pay with Stripe'}</>}
              </button>
              <p className="text-center text-xs text-stone-400 mt-3">🔒 256-bit SSL encryption · Your data is safe</p>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </main>
  )
}
