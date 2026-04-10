'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  User, Package, Heart, MapPin, Lock, LogOut,
  Edit2, Save, X, CheckCircle, ChevronRight, Star,
  ArrowLeft, Truck, Clock, RotateCcw, XCircle,
} from 'lucide-react'
import AnnouncementBar from '@/components/shop/AnnouncementBar'
import Header from '@/components/shop/Header'
import Footer from '@/components/shop/Footer'
import WhatsAppButton from '@/components/shop/WhatsAppButton'
import { useAuth } from '@/lib/auth'
import { authAPI, orderAPI, productAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_STEPS = [
  { key: 'pending',          label: 'Order Placed',      icon: Package },
  { key: 'confirmed',        label: 'Confirmed',         icon: CheckCircle },
  { key: 'processing',       label: 'Processing',        icon: RotateCcw },
  { key: 'shipped',          label: 'Shipped',           icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery',  icon: Truck },
  { key: 'delivered',        label: 'Delivered',         icon: CheckCircle },
]
const STATUS_INDEX: Record<string, number> = Object.fromEntries(STATUS_STEPS.map((s, i) => [s.key, i]))

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: 'badge-yellow', confirmed: 'badge-blue', processing: 'badge-blue',
  shipped: 'badge-orange', out_for_delivery: 'badge-orange',
  delivered: 'badge-green', cancelled: 'badge-red',
}

type Section = 'profile' | 'orders' | 'wishlist' | 'addresses' | 'security'

export default function AccountPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [section, setSection]   = useState<Section>('profile')
  const [orders, setOrders]     = useState<any[]>([])
  const [ordersLoading, setOL]  = useState(false)
  const [wishlist, setWishlist] = useState<any[]>([])
  const [wishLoading, setWL]    = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderDetailLoading, setODL] = useState(false)

  // Profile edit
  const [editMode, setEditMode] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [saving, setSaving] = useState(false)

  // Password change
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please login to access your account')
      router.push('/login?redirect=/account')
    }
    if (user) setProfileForm({ name: user.name || '', phone: user.phone || '' })
  }, [user, loading])

  useEffect(() => {
    if (section === 'orders' && user) {
      setOL(true)
      orderAPI.myOrders({ limit: 20 })
        .then((res: any) => setOrders(res.orders || []))
        .catch(() => toast.error('Failed to load orders'))
        .finally(() => setOL(false))
    }
    if (section === 'wishlist' && user) {
      setWL(true)
      authAPI.me().then(async (res: any) => {
        const ids: string[] = res.user?.wishlist || []
        setWishlist(ids.map(id => ({ _id: id })))
      }).catch(() => {}).finally(() => setWL(false))
    }
  }, [section, user])

  const openOrderDetail = async (order: any) => {
    setSelectedOrder(order)
    if (!order.items?.[0]?.name) {
      setODL(true)
      try {
        const res: any = await orderAPI.myOrder(order._id)
        setSelectedOrder(res.order || res)
      } catch (_) {}
      finally { setODL(false) }
    }
  }

  const saveProfile = async () => {
    if (!profileForm.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      await authAPI.updateProfile(profileForm)
      toast.success('Profile updated!')
      setEditMode(false)
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) { toast.error('Fill all fields'); return }
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.next.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setPwSaving(true)
    try {
      await authAPI.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next })
      toast.success('Password changed successfully!')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (e: any) { toast.error(e.message) }
    finally { setPwSaving(false) }
  }

  if (loading) return (
    <main className="bg-stone-50 min-h-screen">
      <AnnouncementBar />
      <Header />
      <div className="max-w-[1200px] mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    </main>
  )

  if (!user) return null

  const navItems: { key: Section; label: string; icon: any }[] = [
    { key: 'profile',   label: 'My Profile',   icon: User },
    { key: 'orders',    label: 'My Orders',    icon: Package },
    { key: 'wishlist',  label: 'Wishlist',     icon: Heart },
    { key: 'addresses', label: 'Addresses',    icon: MapPin },
    { key: 'security',  label: 'Security',     icon: Lock },
  ]

  // ── Order Detail Panel ────────────────────────────────────────────────────────
  if (selectedOrder && section === 'orders') {
    const o = selectedOrder
    const statusIdx = STATUS_INDEX[o.orderStatus] ?? 0
    const isCancelled = o.orderStatus === 'cancelled'

    return (
      <main className="bg-stone-50 min-h-screen">
        <AnnouncementBar />
        <Header />
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10">
          <button onClick={() => setSelectedOrder(null)}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-brand mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </button>

          {orderDetailLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
              {/* Left column */}
              <div className="space-y-5">
                {/* Header card */}
                <div className="bg-white border border-stone-100 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-stone-400 mb-1">Order Number</p>
                      <h2 className="font-mono font-black text-brand text-xl">#{o.orderNumber}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`badge ${ORDER_STATUS_COLOR[o.orderStatus] || 'badge-gray'} text-sm px-3 py-1.5`}>
                        {o.orderStatus?.replace(/_/g, ' ')}
                      </span>
                      <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'} text-sm px-3 py-1.5`}>
                        {o.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                    <span><Clock className="inline w-3.5 h-3.5 mr-1"/>
                      {o.createdAt ? format(new Date(o.createdAt), 'dd MMM yyyy, hh:mm a') : '—'}
                    </span>
                    <span>Payment: <span className="font-semibold text-stone-700 uppercase">{o.paymentMethod}</span></span>
                    {o.items?.length && <span>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</span>}
                  </div>
                </div>

                {/* Order tracking timeline */}
                {!isCancelled && (
                  <div className="bg-white border border-stone-100 rounded-2xl p-6">
                    <h3 className="font-bold text-stone-900 mb-6">Order Tracking</h3>
                    <div className="relative">
                      {/* Progress bar */}
                      <div className="absolute top-5 left-5 right-5 h-0.5 bg-stone-100 z-0">
                        <div className="h-full bg-brand transition-all duration-700"
                          style={{ width: `${(statusIdx / (STATUS_STEPS.length - 1)) * 100}%` }}/>
                      </div>
                      <div className="flex justify-between relative z-10">
                        {STATUS_STEPS.map((step, i) => {
                          const done = i <= statusIdx
                          const active = i === statusIdx
                          const Icon = step.icon
                          return (
                            <div key={step.key} className="flex flex-col items-center gap-2 w-14 md:w-auto">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                                ${done ? 'bg-brand border-brand text-white' : 'bg-white border-stone-200 text-stone-300'}
                                ${active ? 'ring-4 ring-brand/20 scale-110' : ''}`}>
                                <Icon className="w-4 h-4"/>
                              </div>
                              <p className={`text-[10px] md:text-xs font-semibold text-center leading-tight
                                ${done ? 'text-brand' : 'text-stone-400'}`}>
                                {step.label}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Tracking number */}
                    {o.trackingNumber && (
                      <div className="mt-6 pt-4 border-t border-stone-100">
                        <p className="text-xs text-stone-400 mb-1">Tracking Number</p>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-stone-900 text-sm bg-stone-50 px-3 py-2 rounded-lg border border-stone-200">
                            {o.trackingNumber}
                          </span>
                          {o.courierName && (
                            <span className="text-xs text-stone-500">via <span className="font-semibold">{o.courierName}</span></span>
                          )}
                          {o.trackingUrl && (
                            <a href={o.trackingUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-brand hover:underline font-semibold">
                              Track on courier →
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Estimated delivery */}
                    {o.estimatedDelivery && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-stone-600">
                        <Truck className="w-4 h-4 text-brand"/>
                        Estimated delivery: <span className="font-semibold">{format(new Date(o.estimatedDelivery), 'dd MMM yyyy')}</span>
                      </div>
                    )}
                    {!o.trackingNumber && o.orderStatus === 'shipped' && (
                      <div className="mt-4 text-sm text-stone-400">
                        Tracking details will be available shortly. You'll receive an SMS/email update.
                      </div>
                    )}
                  </div>
                )}

                {isCancelled && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5"/>
                    <div>
                      <p className="font-semibold text-red-700">This order was cancelled</p>
                      {o.cancelReason && <p className="text-sm text-red-500 mt-1">{o.cancelReason}</p>}
                    </div>
                  </div>
                )}

                {/* Items list */}
                <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-stone-100">
                    <h3 className="font-bold text-stone-900">Order Items</h3>
                  </div>
                  <div className="divide-y divide-stone-50">
                    {(o.items || []).map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 p-5">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-50 border border-stone-100 shrink-0">
                          <img
                            src={item.image || item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=100&h=100&fit=crop'}
                            alt={item.name || item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-800 text-sm line-clamp-2 leading-snug">
                            {item.name || item.product?.name}
                          </p>
                          {item.product?.brand?.name && (
                            <p className="text-xs text-stone-400 mt-0.5">{item.product.brand.name}</p>
                          )}
                          <p className="text-xs text-stone-500 mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-stone-900 text-sm">AED {(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-xs text-stone-400 mt-0.5">AED {item.price?.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                {/* Order totals */}
                <div className="bg-white border border-stone-100 rounded-2xl p-5">
                  <h3 className="font-bold text-stone-900 mb-4">Order Total</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>Subtotal</span>
                      <span>AED {o.subtotal?.toFixed(2) || o.total?.toFixed(2)}</span>
                    </div>
                    {o.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-semibold">
                        <span>Discount</span>
                        <span>−AED {o.discount?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>Delivery</span>
                      <span>{o.shippingFee === 0 ? 'FREE' : `AED ${o.shippingFee?.toFixed(2)}`}</span>
                    </div>
                    {o.tax > 0 && (
                      <div className="flex justify-between text-sm text-stone-500">
                        <span>VAT (5%)</span>
                        <span>AED {o.tax?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-stone-900 text-base pt-3 border-t border-stone-100">
                      <span>Total</span>
                      <span className="font-playfair text-xl">AED {o.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping address */}
                {o.shipping && (
                  <div className="bg-white border border-stone-100 rounded-2xl p-5">
                    <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand"/> Shipping Address
                    </h3>
                    <div className="text-sm text-stone-600 space-y-0.5">
                      <p className="font-semibold text-stone-800">{o.shipping.name}</p>
                      {o.shipping.phone && <p>{o.shipping.phone}</p>}
                      <p>{o.shipping.line1}</p>
                      {o.shipping.line2 && <p>{o.shipping.line2}</p>}
                      <p>{o.shipping.city}, {o.shipping.emirate}</p>
                      <p>{o.shipping.country || 'UAE'}</p>
                    </div>
                  </div>
                )}

                {/* Need help */}
                <div className="bg-stone-50 rounded-2xl p-5 text-center">
                  <p className="text-sm font-semibold text-stone-700 mb-1">Need help with this order?</p>
                  <p className="text-xs text-stone-400 mb-3">Our team is available 9am – 6pm, Mon–Sat</p>
                  <a href="https://wa.me/971502165805"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                    WhatsApp Support
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="bg-stone-50 min-h-screen">
      <AnnouncementBar />
      <Header />

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl md:text-4xl font-black text-stone-900">My Account</h1>
          <p className="text-stone-500 text-sm mt-1">Welcome back, {user.name?.split(' ')[0]}!</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-white font-black text-lg shrink-0">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wide text-brand bg-white/10 px-2 py-0.5 rounded-full capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
              <nav className="p-2">
                {navItems.map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => { setSection(key); setSelectedOrder(null) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${section === key ? 'bg-orange-50 text-brand' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                    {section === key && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                ))}
                <button onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-1 border-t border-stone-100 pt-3">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">

            {/* Profile section */}
            {section === 'profile' && (
              <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-stone-900 text-lg">Personal Information</h2>
                  {!editMode ? (
                    <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 text-sm text-brand hover:underline">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  ) : (
                    <button onClick={() => setEditMode(false)} className="text-stone-400 hover:text-stone-700">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editMode ? (
                  <div className="space-y-4 max-w-lg">
                    <div>
                      <label className="label">Full Name</label>
                      <input className="input" value={profileForm.name}
                        onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Phone Number</label>
                      <input className="input" value={profileForm.phone} placeholder="+971 50 000 0000"
                        onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2">
                      {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { label: 'Full Name', value: user.name },
                      { label: 'Email Address', value: user.email },
                      { label: 'Phone', value: user.phone || '—' },
                      { label: 'Account Type', value: user.role, capitalize: true },
                      { label: 'Verified', value: user.isVerified ? 'Yes' : 'No' },
                    ].map(({ label, value, capitalize }) => (
                      <div key={label}>
                        <p className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1">{label}</p>
                        <p className={`text-stone-900 font-medium ${capitalize ? 'capitalize' : ''}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-stone-100">
                  {[
                    { label: 'Total Orders', value: user.totalOrders || 0 },
                    { label: 'Total Spent', value: `AED ${(user.totalSpent || 0).toFixed(0)}` },
                    { label: 'Wishlist Items', value: user.wishlist?.length || 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center bg-stone-50 rounded-xl p-4">
                      <div className="font-playfair text-2xl font-black text-stone-900">{value}</div>
                      <div className="text-xs text-stone-400 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders section */}
            {section === 'orders' && (
              <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100">
                  <h2 className="font-bold text-stone-900 text-lg">Order History</h2>
                  <p className="text-sm text-stone-400 mt-0.5">All your past and ongoing orders</p>
                </div>
                {ordersLoading ? (
                  <div className="p-12 flex justify-center">
                    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-12 h-12 text-stone-200 mx-auto mb-3" />
                    <p className="font-semibold text-stone-700">No orders yet</p>
                    <p className="text-sm text-stone-400 mb-5">Start shopping to see your orders here</p>
                    <Link href="/collections" className="btn-primary btn-sm">Shop Now</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-50">
                    {orders.map((o: any) => (
                      <div key={o._id} className="p-5 hover:bg-stone-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-mono font-bold text-brand text-sm">#{o.orderNumber}</span>
                              <span className={`badge ${ORDER_STATUS_COLOR[o.orderStatus] || 'badge-gray'}`}>
                                {o.orderStatus?.replace(/_/g, ' ')}
                              </span>
                              <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
                                {o.paymentStatus}
                              </span>
                            </div>
                            <p className="text-xs text-stone-400">
                              {o.createdAt ? format(new Date(o.createdAt), 'dd MMM yyyy, hh:mm a') : '—'}
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {o.items?.length} item{o.items?.length !== 1 ? 's' : ''} · AED {o.total?.toFixed(2)} · {o.paymentMethod?.toUpperCase()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-black text-stone-900 text-lg hidden sm:block">AED {o.total?.toFixed(2)}</span>
                            <button onClick={() => openOrderDetail(o)}
                              className="btn-outline btn-sm text-xs flex items-center gap-1.5">
                              View Details <ChevronRight className="w-3.5 h-3.5"/>
                            </button>
                          </div>
                        </div>

                        {/* Items preview */}
                        {o.items?.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                            {o.items.slice(0, 5).map((item: any, i: number) => (
                              <div key={i} className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-stone-100 bg-stone-50">
                                <img src={item.image || 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=100&h=100&fit=crop'} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {o.items.length > 5 && (
                              <div className="w-12 h-12 shrink-0 rounded-lg border border-stone-100 bg-stone-50 flex items-center justify-center text-xs font-bold text-stone-400">
                                +{o.items.length - 5}
                              </div>
                            )}
                          </div>
                        )}
                        {o.trackingNumber && (
                          <div className="mt-2 text-xs text-stone-500">
                            Tracking: <span className="font-mono font-semibold text-stone-700">{o.trackingNumber}</span>
                            {o.courierName && <span className="ml-1">via {o.courierName}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist section */}
            {section === 'wishlist' && (
              <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-6">My Wishlist</h2>
                {wishLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-stone-200 mx-auto mb-3" />
                    <p className="font-semibold text-stone-700">Your wishlist is empty</p>
                    <p className="text-sm text-stone-400 mb-5">Save products you love for later</p>
                    <Link href="/collections" className="btn-primary btn-sm">Browse Products</Link>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-red-200 mx-auto mb-3 fill-red-100" />
                    <p className="font-semibold text-stone-700">{wishlist.length} items in your wishlist</p>
                    <p className="text-sm text-stone-400 mb-5">Browse your saved products</p>
                    <Link href="/collections" className="btn-primary btn-sm">Shop Wishlist</Link>
                  </div>
                )}
              </div>
            )}

            {/* Addresses section */}
            {section === 'addresses' && (
              <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-stone-900 text-lg">Saved Addresses</h2>
                </div>
                {(user.addresses || []).length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-stone-200 mx-auto mb-3" />
                    <p className="font-semibold text-stone-700">No saved addresses</p>
                    <p className="text-sm text-stone-400">Tick "Save this address" at checkout to save addresses here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(user.addresses || []).map((addr: any, i: number) => (
                      <div key={i} className={`border-2 rounded-2xl p-4 ${addr.isDefault ? 'border-brand bg-orange-50' : 'border-stone-200'}`}>
                        {addr.isDefault && (
                          <span className="inline-block bg-brand text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-2">Default</span>
                        )}
                        <p className="font-semibold text-stone-900 text-sm">{addr.label || 'Address'}</p>
                        <p className="text-sm text-stone-600 mt-1">{addr.line1}</p>
                        {addr.line2 && <p className="text-sm text-stone-500">{addr.line2}</p>}
                        <p className="text-sm text-stone-500">{addr.city}, {addr.emirate}, {addr.country}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security section */}
            {section === 'security' && (
              <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-stone-900 text-lg mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="label">Current Password</label>
                    <input type="password" className="input" value={pwForm.current}
                      onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="label">New Password</label>
                    <input type="password" className="input" value={pwForm.next}
                      onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} placeholder="At least 6 characters" />
                  </div>
                  <div>
                    <label className="label">Confirm New Password</label>
                    <input type="password" className="input" value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Re-enter new password" />
                  </div>
                  <button onClick={changePassword} disabled={pwSaving} className="btn-primary flex items-center gap-2">
                    {pwSaving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
