'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, Tag, Award, ShoppingBag, Users,
  Boxes, Image, Ticket, FileText, MessageSquare, BarChart2,
  LogOut, Menu, X, Bell, ChevronRight, Settings, TrendingUp,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

const NAV = [
  { label:'Dashboard',      href:'/admin',             icon: LayoutDashboard },
  { label:'Products',       href:'/admin/products',    icon: Package },
  { label:'Categories',     href:'/admin/categories',  icon: Tag },
  { label:'Brands',         href:'/admin/brands',      icon: Award },
  { label:'Orders',         href:'/admin/orders',      icon: ShoppingBag },
  { label:'Users',          href:'/admin/users',       icon: Users },
  { label:'Inventory',      href:'/admin/inventory',   icon: Boxes },
  { label:'Banners',        href:'/admin/banners',     icon: Image },
  { label:'Coupons',        href:'/admin/coupons',     icon: Ticket },
  { label:'CMS Pages',      href:'/admin/cms',         icon: FileText },
  { label:'Bulk Enquiries', href:'/admin/enquiries',   icon: MessageSquare },
  { label:'Sales Reports',  href:'/admin/reports',     icon: TrendingUp },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth()
  const pathname = usePathname()
  const router   = useRouter()
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Admin access required')
      router.push('/login?redirect=/admin')
    }
  }, [loading, isAdmin, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!isAdmin) return null

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <>
        {/* Mobile overlay */}
        {sideOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSideOpen(false)}/>}

        <aside className={`fixed top-0 left-0 h-full w-64 bg-stone-900 z-40 flex flex-col
                           transition-transform duration-300
                           ${sideOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          {/* Logo */}
          <div className="p-5 border-b border-white/10">
            <Link href="/admin" className="font-playfair text-xl font-black text-white">
              Iron<span className="text-brand">Forge</span>
              <span className="ml-2 text-[10px] font-bold tracking-widest uppercase text-stone-400 bg-stone-800 px-2 py-0.5 rounded">Admin</span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-hide">
            {NAV.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSideOpen(false)}
                className={`sidebar-link ${isActive(href) ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0"/>
                {label}
                {isActive(href) && <ChevronRight className="w-3 h-3 ml-auto opacity-60"/>}
              </Link>
            ))}
          </nav>

          {/* User + logout */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-stone-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <Link href="/" className="sidebar-link">
              <Settings className="w-4 h-4"/> View Store
            </Link>
            <button onClick={logout} className="sidebar-link w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4"/> Logout
            </button>
          </div>
        </aside>
      </>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-stone-100 px-4 md:px-6 h-14 flex items-center gap-4 shadow-sm">
          <button onClick={() => setSideOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-stone-100">
            <Menu className="w-5 h-5"/>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-stone-400 min-w-0">
            <Link href="/admin" className="hover:text-stone-700 shrink-0">Admin</Link>
            {pathname !== '/admin' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 shrink-0"/>
                <span className="text-stone-700 font-medium capitalize truncate">
                  {pathname.split('/').pop()?.replace(/-/g,' ')}
                </span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-stone-100 relative">
              <Bell className="w-4 h-4 text-stone-400"/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full"/>
            </button>
            <Link href="/" target="_blank"
                  className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800
                             border border-stone-200 px-3 py-1.5 rounded-lg transition-colors">
              View Store ↗
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
