'use client'
import { useEffect, useState } from 'react'
import { analyticsAPI } from '@/lib/api'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminReports() {
  const [report, setReport]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [groupBy, setGroupBy] = useState('day')
  const [from, setFrom]       = useState(() => {
    const d = new Date(); d.setDate(d.getDate()-30); return d.toISOString().slice(0,10)
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0,10))

  const load = async () => {
    setLoading(true)
    try {
      const r: any = await analyticsAPI.salesReport({ from, to, groupBy })
      setReport(r.report)
    } catch { toast.error('Failed to load report') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [from, to, groupBy])

  const totalRevenue = report.reduce((s,r) => s+r.revenue,0)
  const totalOrders  = report.reduce((s,r) => s+r.orders,0)
  const totalVat     = report.reduce((s,r) => s+r.vat,0)
  const avgOrder     = totalOrders > 0 ? totalRevenue/totalOrders : 0

  const kpis = [
    { label:'Total Revenue', value:`AED ${totalRevenue.toLocaleString(undefined,{maximumFractionDigits:0})}`, icon:'💰', color:'text-green-700 bg-green-50' },
    { label:'Total Orders',  value:totalOrders, icon:'📦', color:'text-blue-700 bg-blue-50' },
    { label:'Avg Order Value', value:`AED ${avgOrder.toFixed(0)}`, icon:'📊', color:'text-purple-700 bg-purple-50' },
    { label:'Total VAT Collected', value:`AED ${totalVat.toFixed(0)}`, icon:'🏛️', color:'text-orange-700 bg-orange-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Sales Reports</h1>
          <p className="text-sm text-stone-400">Revenue, orders, and performance analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input input-sm w-36"/>
          <span className="text-stone-400 text-sm">to</span>
          <input type="date" value={to}   onChange={e => setTo(e.target.value)}   className="input input-sm w-36"/>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="select input-sm w-28">
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${k.color}`}>{k.icon}</div>
            <div className="font-playfair text-2xl font-black text-stone-900">{k.value}</div>
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wide mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="admin-card">
        <h2 className="font-bold text-sm text-stone-700 mb-4">Revenue Trend</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={report}>
              <defs>
                <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8540A" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#E8540A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8"/>
              <XAxis dataKey="_id" tick={{ fontSize:11 }} tickLine={false}/>
              <YAxis tick={{ fontSize:11 }} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(v:any,n:any) => [n==='revenue'?`AED ${Number(v).toLocaleString()}`:v, n.charAt(0).toUpperCase()+n.slice(1)]}
                       contentStyle={{ borderRadius:12, fontSize:12 }}/>
              <Legend/>
              <Area type="monotone" dataKey="revenue" stroke="#E8540A" strokeWidth={2} fill="url(#rev2)" name="Revenue (AED)"/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Orders chart */}
      <div className="admin-card">
        <h2 className="font-bold text-sm text-stone-700 mb-4">Order Volume</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={report}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8"/>
            <XAxis dataKey="_id" tick={{ fontSize:11 }} tickLine={false}/>
            <YAxis tick={{ fontSize:11 }} tickLine={false}/>
            <Tooltip contentStyle={{ borderRadius:12, fontSize:12 }}/>
            <Bar dataKey="orders" fill="#E8540A" radius={[6,6,0,0]} name="Orders"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Raw data table */}
      <div className="admin-card overflow-hidden">
        <h2 className="font-bold text-sm text-stone-700 p-5 border-b border-stone-100">Detailed Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                {['Period','Orders','Revenue (AED)','Avg Order (AED)','Discount (AED)','VAT (AED)'].map(h=>(
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.map(r => (
                <tr key={r._id} className="hover:bg-stone-50/50">
                  <td className="table-td font-mono text-xs font-semibold">{r._id}</td>
                  <td className="table-td font-semibold">{r.orders}</td>
                  <td className="table-td font-bold text-green-700">{r.revenue?.toFixed(2)}</td>
                  <td className="table-td">{r.avgOrder?.toFixed(2)}</td>
                  <td className="table-td text-red-600">{r.discount?.toFixed(2)}</td>
                  <td className="table-td text-stone-500">{r.vat?.toFixed(2)}</td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr><td colSpan={6} className="table-td text-center py-10 text-stone-400">No data for selected period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
