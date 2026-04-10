'use client'
import { useEffect, useState } from 'react'
import { analyticsAPI } from '@/lib/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, ShoppingBag, Users, Package, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const STATUS_BADGE: Record<string, string> = {
  pending:'badge-yellow', confirmed:'badge-blue', processing:'badge-blue',
  shipped:'badge-orange', out_for_delivery:'badge-orange',
  delivered:'badge-green', cancelled:'badge-red',
}

export default function AdminDashboard() {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoad]  = useState(true)

  useEffect(() => {
    analyticsAPI.dashboard()
      .then((res: any) => setData(res))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoad(false))
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="stat-card h-28 animate-pulse bg-stone-100"/>)}
      </div>
    </div>
  )

  const s = data?.stats || {}

  const statCards = [
    { label:'Total Revenue',  value:`AED ${s.totalRevenue?.toLocaleString()}`,  sub:`Month: AED ${s.monthRevenue?.toLocaleString()}`, icon:<TrendingUp className="w-5 h-5"/>, color:'text-green-600', bg:'bg-green-50', trend: s.revenueGrowth },
    { label:'Total Orders',   value:s.totalOrders,  sub:`Today: ${s.todayOrders}`,  icon:<ShoppingBag className="w-5 h-5"/>, color:'text-blue-600',  bg:'bg-blue-50' },
    { label:'Products',       value:s.totalProducts, sub:`Low stock: ${s.lowStockProducts}`, icon:<Package className="w-5 h-5"/>, color:'text-brand',  bg:'bg-orange-50' },
    { label:'Customers',      value:s.totalUsers,    sub:`Pending orders: ${s.pendingOrders}`, icon:<Users className="w-5 h-5"/>, color:'text-purple-600', bg:'bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-stone-400 mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <Link href="/admin/reports" className="btn-primary btn-sm hidden sm:flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5"/> Full Report
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${c.bg} ${c.color} rounded-xl flex items-center justify-center`}>
                {c.icon}
              </div>
              {c.trend !== undefined && (
                <span className={`flex items-center gap-0.5 text-xs font-bold ${Number(c.trend) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {Number(c.trend) >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                  {Math.abs(Number(c.trend))}%
                </span>
              )}
            </div>
            <div className="font-playfair text-2xl font-black text-stone-900">{c.value}</div>
            <div className="text-xs text-stone-400 mt-0.5">{c.sub}</div>
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mt-2">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="admin-card lg:col-span-2">
          <h2 className="font-bold text-sm text-stone-700 mb-4">Revenue — Last 30 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.salesChart || []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#E8540A" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#E8540A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="_id" tick={{ fontSize:11 }} tickLine={false} axisLine={false}
                     tickFormatter={(v) => v?.slice(5)}/>
              <YAxis tick={{ fontSize:11 }} tickLine={false} axisLine={false}
                     tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(v: any) => [`AED ${Number(v).toLocaleString()}`, 'Revenue']}
                       contentStyle={{ borderRadius:12, border:'1px solid #e7e5e4', fontSize:12 }}/>
              <Area type="monotone" dataKey="revenue" stroke="#E8540A" strokeWidth={2}
                    fill="url(#rev)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status donut */}
        <div className="admin-card">
          <h2 className="font-bold text-sm text-stone-700 mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.ordersByStatus || []} layout="vertical">
              <XAxis type="number" tick={{ fontSize:11 }} tickLine={false} axisLine={false}/>
              <YAxis dataKey="_id" type="category" tick={{ fontSize:11 }} tickLine={false} axisLine={false}
                     tickFormatter={(v) => v.replace(/_/g,' ')} width={90}/>
              <Tooltip contentStyle={{ borderRadius:12, fontSize:12 }}/>
              <Bar dataKey="count" fill="#E8540A" radius={[0,6,6,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent orders */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-stone-700">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-brand hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>
                <th className="table-th">Order</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Status</th>
              </tr></thead>
              <tbody>
                {(data?.recentOrders || []).map((o: any) => (
                  <tr key={o._id} className="hover:bg-stone-50">
                    <td className="table-td font-mono text-xs font-semibold text-brand">
                      <Link href={`/admin/orders?id=${o._id}`}>#{o.orderNumber}</Link>
                    </td>
                    <td className="table-td">{o.user?.name || o.shipping?.name || '—'}</td>
                    <td className="table-td font-semibold">AED {o.total?.toFixed(0)}</td>
                    <td className="table-td">
                      <span className={STATUS_BADGE[o.orderStatus] || 'badge-gray'}>
                        {o.orderStatus?.replace(/_/g,' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-stone-700">Top Selling Products</h2>
            <Link href="/admin/products" className="text-xs text-brand hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(data?.topProducts || []).map((p: any, i: number) => (
              <div key={p._id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-400 shrink-0">
                  {i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{p.name}</p>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 mt-1">
                    <div className="bg-brand h-1.5 rounded-full" style={{ width:`${Math.min(100,(p.sold/(data.topProducts[0]?.sold||1))*100)}%` }}/>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-stone-800">{p.sold} sold</div>
                  <div className="text-xs text-stone-400">AED {p.revenue?.toFixed(0)}</div>
                </div>
              </div>
            ))}
            {!data?.topProducts?.length && <p className="text-sm text-stone-400 text-center py-6">No data yet</p>}
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {s.lowStockProducts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0"/>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{s.lowStockProducts} products are running low on stock</p>
            <p className="text-xs text-amber-600">Review inventory to avoid stockouts</p>
          </div>
          <Link href="/admin/inventory" className="text-sm font-bold text-amber-700 hover:underline whitespace-nowrap">
            View Inventory →
          </Link>
        </div>
      )}
    </div>
  )
}
