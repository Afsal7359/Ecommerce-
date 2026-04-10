'use client'
import { useEffect, useState } from 'react'
import { userAPI } from '@/lib/api'
import { Modal, Confirm, PageHeader, DataTable, Pagination, Field, StatusBadge } from '@/components/admin/AdminUI'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminUsers() {
  const [users, setUsers]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [total, setTotal]       = useState(0)
  const [search, setSearch]     = useState('')
  const [edit, setEdit]         = useState<any>(null)
  const [delId, setDelId]       = useState<string|null>(null)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState({ role:'customer', isActive:true })

  const load = async (p=1) => {
    setLoading(true)
    try {
      const r: any = await userAPI.list({ page:p, limit:15, search })
      setUsers(r.users); setPages(r.pages); setTotal(r.total)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { setPage(1); load(1) }, [search])

  const handleUpdate = async () => {
    if (!edit) return; setSaving(true)
    try {
      await userAPI.update(edit._id, form)
      toast.success('User updated'); setEdit(null); load(page)
    } catch (e:any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const cols = [
    { key:'name', label:'User', render:(r:any) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand text-sm font-bold shrink-0">
          {r.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm">{r.name}</p>
          <p className="text-xs text-stone-400">{r.email}</p>
        </div>
      </div>
    )},
    { key:'phone', label:'Phone' },
    { key:'role', label:'Role', render:(r:any) => <span className={`badge ${r.role==='admin'||r.role==='superadmin' ? 'badge-orange' : 'badge-gray'}`}>{r.role}</span> },
    { key:'totalOrders', label:'Orders', render:(r:any) => <span className="font-semibold">{r.totalOrders || 0}</span> },
    { key:'totalSpent', label:'Spent', render:(r:any) => <span className="font-semibold">AED {(r.totalSpent||0).toFixed(0)}</span> },
    { key:'isActive', label:'Status', render:(r:any) => <StatusBadge status={r.isActive ? 'confirmed' : 'cancelled'}/> },
    { key:'createdAt', label:'Joined', render:(r:any) => <span className="text-xs text-stone-400">{format(new Date(r.createdAt),'dd MMM yy')}</span> },
    { key:'actions', label:'', render:(r:any) => (
      <div className="flex gap-1">
        <button onClick={() => { setEdit(r); setForm({ role:r.role, isActive:r.isActive }) }} className="btn-ghost p-1.5 text-blue-600"><Pencil className="w-4 h-4"/></button>
        <button onClick={() => setDelId(r._id)} className="btn-ghost p-1.5 text-red-500"><Trash2 className="w-4 h-4"/></button>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Users" count={total} search={search} onSearch={setSearch}/>
      <div className="admin-card overflow-hidden">
        <DataTable columns={cols} rows={users} loading={loading}/>
        <div className="px-4 pb-4 pt-2">
          <Pagination page={page} pages={pages} onPage={(p) => { setPage(p); load(p) }}/>
        </div>
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit User" size="sm">
        <div className="space-y-4">
          <div className="text-center p-4 bg-stone-50 rounded-xl mb-2">
            <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xl font-bold mx-auto mb-2">
              {edit?.name?.[0]?.toUpperCase()}
            </div>
            <p className="font-semibold">{edit?.name}</p>
            <p className="text-sm text-stone-400">{edit?.email}</p>
          </div>
          <Field label="Role">
            <select className="select" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f=>({...f,isActive:e.target.checked}))} className="w-4 h-4 accent-brand"/> Active Account
          </label>
          <div className="flex gap-3 pt-2 border-t border-stone-100">
            <button onClick={() => setEdit(null)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleUpdate} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin"/>} Update User
            </button>
          </div>
        </div>
      </Modal>
      <Confirm open={!!delId} onClose={() => setDelId(null)}
        onConfirm={async () => { await userAPI.delete(delId!); setDelId(null); load(page) }}
        loading={false} message="This will permanently delete the user account."/>
    </div>
  )
}
