'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Building2, Package, Phone, Mail, User, MessageSquare,
  CheckCircle, ArrowRight, Truck, Clock, Shield, BarChart2,
} from 'lucide-react'
import AnnouncementBar from '@/components/shop/AnnouncementBar'
import Header from '@/components/shop/Header'
import Footer from '@/components/shop/Footer'
import { WhatsAppButton } from '@/components/shop/index'
import toast from 'react-hot-toast'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function BulkEnquiriesPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    products: '', quantity: '', orderValue: '', message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.products) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: form.quantity ? Number(form.quantity) : undefined,
          orderValue: form.orderValue ? Number(form.orderValue) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit')
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit enquiry. Please try WhatsApp instead.')
    } finally {
      setLoading(false)
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const benefits = [
    { icon: <BarChart2 className="w-5 h-5" />, title: 'Volume Discounts', desc: 'Get exclusive pricing on bulk orders — up to 25% off standard rates.' },
    { icon: <Truck className="w-5 h-5" />, title: 'Priority Delivery', desc: 'Dedicated logistics support with guaranteed delivery windows.' },
    { icon: <Clock className="w-5 h-5" />, title: 'Quick Quotation', desc: 'Receive a detailed quote within 4–6 business hours.' },
    { icon: <Shield className="w-5 h-5" />, title: 'Account Manager', desc: 'A dedicated account manager for all your procurement needs.' },
  ]

  return (
    <main className="bg-white">
      <AnnouncementBar />
      <Header />

      {/* Hero */}
      <section className="relative bg-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1400&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-[1200px] mx-auto px-4 md:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5">
              <Building2 className="w-3.5 h-3.5" /> B2B & Bulk Supply
            </div>
            <h1 className="font-playfair text-[48px] md:text-[64px] font-black text-white leading-[1.05] mb-5">
              Build More.<br />
              <span className="text-brand">Pay Less.</span>
            </h1>
            <p className="text-white/60 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              Competitive bulk pricing for contractors, developers, facility managers and procurement teams across the UAE.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              {['AED 5,000+ order value', 'Volume discounts up to 25%', 'Dedicated account manager'].map(t => (
                <div key={t} className="flex items-center gap-1.5 text-white/70">
                  <CheckCircle className="w-4 h-4 text-brand" />{t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-stone-50 border-b border-stone-100">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map(b => (
              <div key={b.title} className="bg-white rounded-2xl p-5 border border-stone-100 hover:border-brand hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-orange-50 text-brand rounded-xl flex items-center justify-center mb-3 group-hover:bg-brand group-hover:text-white transition-colors">
                  {b.icon}
                </div>
                <h3 className="font-bold text-stone-900 text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <p className="section-label">Get a Quote</p>
              <h2 className="section-title">Submit Bulk Enquiry</h2>
              <p className="text-stone-500 text-sm mt-2">Fill in the form and our B2B team will get back to you within 6 hours.</p>
            </div>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-xl text-green-900 mb-2">Enquiry Received!</h3>
                <p className="text-green-700 text-sm mb-6 max-w-md mx-auto">
                  Thank you! Our B2B team will review your requirements and send a detailed quote to <strong>{form.email}</strong> within 6 business hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/collections" className="btn-primary flex items-center gap-2 justify-center">
                    Continue Shopping <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button onClick={() => { setSubmitted(false); setForm({ name:'',company:'',email:'',phone:'',products:'',quantity:'',orderValue:'',message:'' }) }}
                    className="btn-outline">Submit Another</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input required className="input pl-10" placeholder="Ahmad Al Mansoori"
                        value={form.name} onChange={set('name')} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input className="input pl-10" placeholder="Al Mansoori Contracting LLC"
                        value={form.company} onChange={set('company')} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input required type="email" className="input pl-10" placeholder="ahmad@company.ae"
                        value={form.email} onChange={set('email')} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Phone / WhatsApp *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input required type="tel" className="input pl-10" placeholder="+971 50 000 0000"
                        value={form.phone} onChange={set('phone')} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">Products Required *</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                    <textarea required rows={3} className="input pl-10 resize-none"
                      placeholder="e.g. Bosch rotary hammers (model GBH 2-26), Jotun Jotashield paint (20L buckets), PVC pipes 2 inch…"
                      value={form.products} onChange={set('products')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Quantity / Units</label>
                    <input type="number" className="input" placeholder="e.g. 50 units"
                      value={form.quantity} onChange={set('quantity')} />
                  </div>
                  <div>
                    <label className="label">Estimated Order Value (AED)</label>
                    <input type="number" className="input" placeholder="e.g. 25000"
                      value={form.orderValue} onChange={set('orderValue')} />
                  </div>
                </div>

                <div>
                  <label className="label">Additional Notes</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-stone-400" />
                    <textarea rows={3} className="input pl-10 resize-none"
                      placeholder="Delivery timeline, location, special requirements, credit terms…"
                      value={form.message} onChange={set('message')} />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                  {loading ? 'Submitting…' : 'Submit Enquiry'}
                </button>

                <p className="text-xs text-stone-400 text-center">
                  Or reach us directly:{' '}
                  <a href="https://wa.me/971502165805" target="_blank" rel="noopener noreferrer"
                    className="text-brand hover:underline font-semibold">WhatsApp +971 50 216 5805</a>
                </p>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Process steps */}
            <div className="bg-stone-50 border border-stone-100 rounded-2xl p-6">
              <h3 className="font-bold text-stone-900 mb-5">How It Works</h3>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Submit Enquiry', desc: 'Fill the form with your product requirements and contact details.' },
                  { step: '02', title: 'Receive Quotation', desc: 'Our team reviews and sends a detailed quotation within 6 hours.' },
                  { step: '03', title: 'Confirm Order', desc: 'Approve the quote and confirm your order with payment details.' },
                  { step: '04', title: 'Delivery', desc: 'We arrange fast, reliable delivery to your site or warehouse.' },
                ].map(s => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-8 h-8 bg-brand text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 text-sm">{s.title}</p>
                      <p className="text-xs text-stone-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular categories */}
            <div className="bg-white border border-stone-100 rounded-2xl p-6">
              <h3 className="font-bold text-stone-900 mb-4">Popular Bulk Categories</h3>
              <div className="space-y-2">
                {[
                  ['Power Tools',               '500+ products',               'Power Tools'],
                  ['Paints & Coatings',         'All major brands',            'Paints & Painting Tools'],
                  ['Plumbing',                  'PVC, UPVC, CPVC',             'Plumbing'],
                  ['Construction Chemicals',    'Waterproofing, adhesives',    'Construction Chemicals'],
                  ['Fasteners & Joining',       'Bulk packs available',        'Fasteners & Joining'],
                  ['Electrical',                'Complete ranges',             'Electrical'],
                ].map(([label, sub, cat]) => (
                  <Link key={cat} href={`/collections?category=${encodeURIComponent(cat)}`}
                    className="flex items-center justify-between py-2.5 border-b border-stone-50 hover:text-brand transition-colors group">
                    <div>
                      <p className="text-sm font-medium text-stone-800 group-hover:text-brand transition-colors">{label}</p>
                      <p className="text-xs text-stone-400">{sub}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-brand transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact card */}
            <div className="bg-stone-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-2">Prefer to call?</h3>
              <p className="text-white/60 text-sm mb-4">Speak directly with our B2B sales team:</p>
              <a href="tel:+971502165805" className="block font-playfair text-2xl font-black text-brand mb-1">
                +971 50 216 5805
              </a>
              <p className="text-white/40 text-xs">Mon–Sat, 8AM–7PM UAE Time</p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
