'use client'
import { useEffect, useState } from 'react'
import { couponAPI } from '@/lib/api'
import { Modal, Confirm, PageHeader, DataTable, Field } from '@/components/admin/AdminUI'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const empty = { code:'', type:'percentage', value:'', minOrderValue:'', maxDiscount:'', usageLimit:'', perUserLimit:'1', description:'', isActive:true, startsAt:'', expiresAt:'' }

export default function AdminCoupons() {
  const [coupons, setCoupons]   = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [delId, setDelId]       = useState<string|null>(null)
  const [saving, setSaving]     = useState(false)
  const [edit, setEdit]         = useState<any>(null)
  const [form, setForm]         = useState<any>(empty)

  const load = async () => {
    setLoading(true)
    try { const r: any = await couponAPI.list(); setCoupons(r.coupons) }
    catch { toast.error('Failed') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEdit(null); setForm(empty); setShowForm(true) }
  const openEdit = (c: any) => {
    setEdit(c)
    setForm({ code:c.code, type:c.type, value:c.value, minOrderValue:c.minOrderValue, maxDiscount:c.maxDiscount, usageLimit:c.usageLimit, perUserLimit:c.perUserLimit, description:c.description||'', isActive:c.isActive, startsAt:c.startsAt?.slice(0,10)||'', expiresAt:c.expiresAt?.slice(0,10)||'' })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.code || !form.value || !form.expiresAt) return toast.error('Code, value and expiry required')
    setSaving(true)
    try {
      if (edit) { await couponAPI.update(edit._id, form); toast.success('Coupon updated') }
      else      { await couponAPI.create(form); toast.success('Coupon created') }
      setShowForm(false); load()
    } catch (e:any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const cols = [
    { key:'code', label:'Code', render:(r:any) => <span className="font-mono font-bold text-brand bg-orange-50 px-2 py-1 rounded-lg text-sm">{r.code}</span> },
    { key:'type', label:'Type/Value', render:(r:any) => <span className="font-semibold">{r.type === 'percentage' ? `${r.value}%` : `AED ${r.value}`} off</span> },
    { key:'minOrderValue', label:'Min Order', render:(r:any) => r.minOrderValue > 0 ? `AED ${r.minOrderValue}` : '—' },
    { key:'usage', label:'Usage', render:(r:any) => `${r.usedCount}/${r.usageLimit || '∞'}` },
    { key:'expiresAt', label:'Expires', render:(r:any) => <span className="text-xs">{format(new Date(r.expiresAt),'dd MMM yyyy')}</span> },
    { key:'isActive', label:'Status', render:(r:any) => <span className={`badge ${r.isActive ? 'badge-green' : 'badge-gray'}`}>{r.isActive ? 'Active' : 'Inactive'}</span> },
    { key:'actions', label:'', render:(r:any) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="btn-ghost p-1.5 text-blue-600"><Pencil className="w-4 h-4"/></button>
        <button onClick={() => setDelId(r._id)} className="btn-ghost p-1.5 text-red-500"><Trash2 className="w-4 h-4"/></button>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Coupons & Discounts" count={coupons.length} onAdd={openAdd} addLabel="Create Coupon"/>
      <div className="admin-card overflow-hidden">
        <DataTable columns={cols} rows={coupons} loading={loading}/>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={edit ? 'Edit Coupon' : 'Create Coupon'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Code *"><input className="input uppercase" value={form.code} onChange={e => setForm((f:any)=>({...f,code:e.target.value.toUpperCase()}))} placeholder="SAVE10"/></Field>
            <Field label="Type">
              <select className="select" value={form.type} onChange={e => setForm((f:any)=>({...f,type:e.target.value}))}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (AED)</option>
              </select>
            </Field>
            <Field label="Value *"><input type="number" className="input" value={form.value} onChange={e => setForm((f:any)=>({...f,value:e.target.value}))} placeholder={form.type==='percentage' ? '10' : '50'}/></Field>
            <Field label="Min Order (AED)"><input type="number" className="input" value={form.minOrderValue} onChange={e => setForm((f:any)=>({...f,minOrderValue:e.target.value}))} placeholder="0"/></Field>
            <Field label="Max Discount (AED)"><input type="number" className="input" value={form.maxDiscount} onChange={e => setForm((f:any)=>({...f,maxDiscount:e.target.value}))} placeholder="0 = no cap"/></Field>
            <Field label="Usage Limit"><input type="number" className="input" value={form.usageLimit} onChange={e => setForm((f:any)=>({...f,usageLimit:e.target.value}))} placeholder="0 = unlimited"/></Field>
            <Field label="Starts"><input type="date" className="input" value={form.startsAt} onChange={e => setForm((f:any)=>({...f,startsAt:e.target.value}))}/></Field>
            <Field label="Expires *"><input type="date" className="input" value={form.expiresAt} onChange={e => setForm((f:any)=>({...f,expiresAt:e.target.value}))}/></Field>
          </div>
          <Field label="Description"><input className="input" value={form.description} onChange={e => setForm((f:any)=>({...f,description:e.target.value}))} placeholder="Internal note"/></Field>
          <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm((f:any)=>({...f,isActive:e.target.checked}))} className="w-4 h-4 accent-brand"/> Active</label>
          <div className="flex gap-3 pt-2 border-t border-stone-100">
            <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin"/>}{edit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={async () => { await couponAPI.delete(delId!); setDelId(null); load() }} loading={false}/>
    </div>
  )
}
