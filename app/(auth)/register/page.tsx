'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const perks = ['Free shipping on AED 300+', 'Order tracking', 'Exclusive member deals', 'Wishlist & order history']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      toast.success('Account created! Welcome to IronForge 🎉')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <div className="hidden lg:flex w-1/2 bg-stone-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)' }}/>
        <Link href="/" className="relative z-10 font-playfair text-3xl font-black text-white">
          Iron<span className="text-brand">Forge</span>
        </Link>
        <div className="relative z-10 space-y-6">
          <h2 className="font-playfair text-2xl font-black text-white">Join 10,000+ builders & contractors in UAE</h2>
          <div className="space-y-3">
            {perks.map(p => (
              <div key={p} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-brand shrink-0"/>
                <span className="text-stone-300 text-sm">{p}</span>
              </div>
            ))}
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-white font-bold text-sm mb-1">🎁 New Member Offer</p>
            <p className="text-stone-300 text-xs">Use code <strong className="text-brand">WELCOME10</strong> for 10% off your first order</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="font-playfair text-3xl font-black text-stone-900">Iron<span className="text-brand">Forge</span></Link>
          </div>

          <h1 className="font-playfair text-3xl font-black text-stone-900 mb-1">Create account</h1>
          <p className="text-stone-400 text-sm mb-8">Start shopping Dubai's best hardware store</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input" placeholder="John Smith"/>
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" required value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="input" placeholder="you@company.com"/>
            </div>
            <div>
              <label className="label">Phone / WhatsApp</label>
              <input type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="input" placeholder="+971 50 000 0000"/>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} required value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} className="input pr-10" placeholder="At least 6 characters"/>
                <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                  {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" required value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))} className="input" placeholder="Repeat password"/>
            </div>
            <p className="text-xs text-stone-400">By creating an account you agree to our <Link href="/pages/terms" className="text-brand">Terms</Link> and <Link href="/pages/privacy" className="text-brand">Privacy Policy</Link>.</p>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {loading && <Loader2 className="w-4 h-4 animate-spin"/>} Create Account
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
