'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const router     = useRouter()
  const params     = useSearchParams()
  const redirect   = params.get('redirect') || '/'
  const [form, setForm]       = useState({ email:'', password:'' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      router.push(redirect)
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-stone-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)' }}/>
        <div className="relative z-10">
          <Link href="/" className="font-playfair text-3xl font-black text-white">
            Iron<span className="text-brand">Forge</span>
          </Link>
          <p className="text-stone-400 text-sm mt-2">Dubai's #1 Hardware Store</p>
        </div>
        <div className="relative z-10">
          <blockquote className="text-white text-2xl font-playfair font-bold leading-snug mb-4">
            "Build something<br/>extraordinary today."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold">IF</div>
            <div>
              <p className="text-white text-sm font-semibold">IronForge Hardware</p>
              <p className="text-stone-400 text-xs">5,000+ products · Free delivery AED 300+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="font-playfair text-3xl font-black text-stone-900">
              Iron<span className="text-brand">Forge</span>
            </Link>
          </div>

          <h1 className="font-playfair text-3xl font-black text-stone-900 mb-1">Welcome back</h1>
          <p className="text-stone-400 text-sm mb-8">Sign in to your IronForge account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" required value={form.email}
                     onChange={e => setForm(f=>({...f,email:e.target.value}))}
                     className="input" placeholder="you@company.com"/>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} required value={form.password}
                       onChange={e => setForm(f=>({...f,password:e.target.value}))}
                       className="input pr-10" placeholder="••••••••"/>
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                  {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link href="/forgot-password" className="text-xs text-brand hover:underline">Forgot password?</Link>
              </div>
            </div>
            <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {loading && <Loader2 className="w-4 h-4 animate-spin"/>}
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand font-semibold hover:underline">Create one</Link>
          </p>

          {/* Admin shortcut hint */}
          <div className="mt-8 p-4 bg-stone-100 rounded-xl text-center">
            <p className="text-xs text-stone-400">Admin access?{' '}
              <Link href="/admin" className="text-brand font-semibold">Go to Admin Panel →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
