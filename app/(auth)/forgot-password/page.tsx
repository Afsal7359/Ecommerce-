'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { authAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Enter your email address')
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-stone-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)' }} />
        <div className="relative z-10">
          <Link href="/" className="font-playfair text-3xl font-black text-white">
            Iron<span className="text-[#E8540A]">Forge</span>
          </Link>
          <p className="text-stone-400 text-sm mt-2">Dubai&apos;s #1 Hardware Store</p>
        </div>
        <div className="relative z-10">
          <blockquote className="text-white text-2xl font-playfair font-bold leading-snug mb-4">
            &quot;Your account,<br />your projects, secured.&quot;
          </blockquote>
          <p className="text-stone-400 text-sm">We&apos;ll send you a secure reset link within minutes.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="font-playfair text-3xl font-black text-stone-900">
              Iron<span className="text-[#E8540A]">Forge</span>
            </Link>
          </div>

          <Link href="/login" className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 mb-8 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="font-playfair text-3xl font-black text-stone-900 mb-2">Check your inbox</h1>
              <p className="text-stone-400 text-sm mb-6">
                We sent a password reset link to <strong className="text-stone-700">{email}</strong>.
                It will expire in 1 hour.
              </p>
              <p className="text-xs text-stone-400 mb-6">
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="text-[#E8540A] hover:underline font-semibold">
                  try again
                </button>.
              </p>
              <Link href="/login" className="btn-primary inline-flex items-center gap-2">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-playfair text-3xl font-black text-stone-900 mb-1">Forgot password?</h1>
              <p className="text-stone-400 text-sm mb-8">
                No worries — enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="email" required value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full border border-stone-200 rounded-xl pl-10 pr-4 py-3 text-sm bg-white outline-none focus:border-[#E8540A] focus:ring-2 focus:ring-[#E8540A]/10 transition-all"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="bg-[#E8540A] hover:bg-[#C94508] text-white font-bold w-full py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-sm text-stone-400 mt-6">
                Remembered your password?{' '}
                <Link href="/login" className="text-[#E8540A] font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
