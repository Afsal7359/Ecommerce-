'use client'
import { useEffect, useState } from 'react'
import { enquiryAPI } from '@/lib/api'
import { Modal, PageHeader, DataTable, Pagination, Field, StatusBadge } from '@/components/admin/AdminUI'
import { Eye, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUSES = ['new','contacted','quoted','won','lost']

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [pages, setPages]         = useState(1)
  const [total, setTotal]         = useState(0)
  const [statusFilter, setFilter] = useState('')
  const [selected, setSelected]   = useState<any>(null)
  const [saving, setSaving]       = useState(false)
  const [updForm, setUpdForm]     = useState({ status:'', notes:'', quotedAmt:'' })

  const load = async (p=1) => {
    setLoading(true)
    try {
      const r: any = await enquiryAPI.list({ page:p, limit:15, status:statusFilter })
      setEnquiries(r.enquiries); setPages(r.pages); setTotal(r.total)
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }
  useEffect(() => { setPage(1); load(1) }, [statusFilter])

  const openEnquiry = (e: any) => {
    setSelected(e)
    setUpdForm({ status: e.status, notes: e.notes||'', quotedAmt: e.quotedAmt||'' })
  }

  const handleUpdate = async () => {
    if (!selected) return; setSaving(true)
    try {
      await enquiryAPI.update(selected._id, updForm)
      toast.success('Enquiry updated'); setSelected(null); load(page)
    } catch (e:any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const cols = [
    { key:'name', label:'Contact', render:(r:any) => (
      <div>
        <p className="font-semibold text-sm">{r.name}</p>
        <p className="text-xs text-stone-400">{r.company || r.email}</p>
      </div>
    )},
    { key:'phone', label:'Phone' },
    { key:'products', label:'Products Needed', render:(r:any) => (
      <p className="text-sm text-stone-600 max-w-xs truncate">{r.products}</p>
    )},
    { key:'orderValue', label:'Value' },
    { key:'status', label:'Status', render:(r:any) => <StatusBadge status={r.status}/> },
    { key:'createdAt', label:'Date', render:(r:any) => (
      <span className="text-xs text-stone-400">{format(new Date(r.createdAt),'dd MMM yy')}</span>
    )},
    { key:'actions', label:'', render:(r:any) => (
      <button onClick={() => openEnquiry(r)} className="btn-ghost p-1.5 text-blue-600"><Eye className="w-4 h-4"/></button>
    )},
  ]

  return (
    <div>
      <PageHeader title="Bulk Enquiries" count={total}>
        <select value={statusFilter} onChange={e => setFilter(e.target.value)} className="select input-sm w-36">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </PageHeader>
      <div className="admin-card overflow-hidden">
        <DataTable columns={cols} rows={enquiries} loading={loading}/>
        <div className="px-4 pb-4 pt-2">
          <Pagination page={page} pages={pages} onPage={(p)=>{setPage(p);load(p)}}/>
        </div>
      </div>

      {selected && (
        <Modal open title="Enquiry Details" onClose={() => setSelected(null)} size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Contact Info</h3>
              {[
                ['Name', selected.name], ['Company', selected.company||'—'],
                ['Email', selected.email], ['Phone', selected.phone],
              ].map(([k,v]) => (
                <div key={k} className="flex gap-2 text-sm">
                  <span className="text-stone-400 w-20 shrink-0">{k}:</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-stone-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Requirements</h3>
                <p className="text-sm text-stone-700 bg-stone-50 p-3 rounded-xl">{selected.products}</p>
                {selected.quantity && <p className="text-sm mt-2 text-stone-500">Qty: {selected.quantity} · Order Value: {selected.orderValue}</p>}
                {selected.message && <p className="text-sm mt-2 text-stone-500 italic">"{selected.message}"</p>}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Update Enquiry</h3>
              <Field label="Status">
                <select className="select" value={updForm.status} onChange={e => setUpdForm(f=>({...f,status:e.target.value}))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Quoted Amount (AED)">
                <input type="number" className="input" value={updForm.quotedAmt} onChange={e => setUpdForm(f=>({...f,quotedAmt:e.target.value}))} placeholder="0.00"/>
              </Field>
              <Field label="Internal Notes">
                <textarea rows={4} className="input resize-none" value={updForm.notes} onChange={e => setUpdForm(f=>({...f,notes:e.target.value}))} placeholder="Notes for team..."/>
              </Field>
              <div className="flex gap-3">
                <a href={`https://wa.me/${selected.phone?.replace(/\D/g,'')}`} target="_blank"
                   className="btn-outline flex-1 flex items-center justify-center gap-2 text-green-700 border-green-200 hover:bg-green-50">
                  💬 WhatsApp
                </a>
                <button onClick={handleUpdate} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin"/>} Update
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
