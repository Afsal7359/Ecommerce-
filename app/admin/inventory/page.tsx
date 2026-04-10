'use client'
import { useEffect, useState } from 'react'
import { inventoryAPI } from '@/lib/api'
import { Modal, PageHeader, DataTable, Pagination, Field } from '@/components/admin/AdminUI'
import { AlertTriangle, Loader2, Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminInventory() {
  const [lowStock, setLowStock] = useState<any[]>([])
  const [logs, setLogs]         = useState<any[]>([])
  const [loadLS, setLoadLS]     = useState(true)
  const [loadLogs, setLoadLogs] = useState(true)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [showAdj, setShowAdj]   = useState(false)
  const [adjForm, setAdjForm]   = useState({ productId:'', type:'in', quantity:'', note:'', reference:'' })
  const [saving, setSaving]     = useState(false)

  const loadLS_ = async () => {
    setLoadLS(true)
    try { const r: any = await inventoryAPI.lowStock(); setLowStock(r.products) }
    catch { toast.error('Failed') }
    finally { setLoadLS(false) }
  }
  const loadLogs_ = async (p=1) => {
    setLoadLogs(true)
    try {
      const r: any = await inventoryAPI.logs({ page:p, limit:15 })
      setLogs(r.logs); setPages(r.pages)
    } catch { toast.error('Failed') }
    finally { setLoadLogs(false) }
  }

  useEffect(() => { loadLS_(); loadLogs_() }, [])

  const handleAdjust = async () => {
    if (!adjForm.productId || !adjForm.quantity) return toast.error('Product and quantity required')
    setSaving(true)
    try {
      await inventoryAPI.adjust(adjForm)
      toast.success('Stock adjusted'); setShowAdj(false); loadLS_(); loadLogs_()
    } catch (e:any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const lsCols = [
    { key:'name', label:'Product', render:(r:any) => <div><p className="font-semibold text-sm">{r.name}</p><p className="text-xs text-stone-400">{r.sku || r.brand?.name}</p></div> },
    { key:'stock', label:'Current Stock', render:(r:any) => (
      <span className={`font-bold text-lg ${r.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>{r.stock}</span>
    )},
    { key:'lowStockAlert', label:'Alert At', render:(r:any) => <span className="text-stone-500">{r.lowStockAlert}</span> },
    { key:'category', label:'Category', render:(r:any) => r.category?.name },
    { key:'adj', label:'', render:(r:any) => (
      <button onClick={() => { setAdjForm(f=>({...f,productId:r._id})); setShowAdj(true) }}
              className="btn-primary btn-sm">Adjust Stock</button>
    )},
  ]

  const logCols = [
    { key:'product', label:'Product', render:(r:any) => <span className="text-sm font-medium">{r.product?.name}</span> },
    { key:'type', label:'Type', render:(r:any) => (
      <span className={`badge ${r.type==='in'||r.type==='return' ? 'badge-green' : r.type==='out' ? 'badge-red' : 'badge-yellow'}`}>{r.type}</span>
    )},
    { key:'quantity', label:'Qty', render:(r:any) => <span className="font-bold">{r.quantity}</span> },
    { key:'stock', label:'Stock After', render:(r:any) => <span className="text-stone-500">{r.prevStock} → <strong>{r.newStock}</strong></span> },
    { key:'note', label:'Note' },
    { key:'doneBy', label:'By', render:(r:any) => <span className="text-xs text-stone-400">{r.doneBy?.name || 'System'}</span> },
    { key:'createdAt', label:'Date', render:(r:any) => <span className="text-xs text-stone-400">{format(new Date(r.createdAt),'dd MMM HH:mm')}</span> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" onAdd={() => setShowAdj(true)} addLabel="Adjust Stock"/>

      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"/>
          <div>
            <p className="font-semibold text-amber-800">{lowStock.length} products need restocking</p>
            <p className="text-sm text-amber-600 mt-1">Review items below and adjust stock levels</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-bold text-stone-700 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500"/> Low Stock Items
        </h2>
        <div className="admin-card overflow-hidden">
          <DataTable columns={lsCols} rows={lowStock} loading={loadLS} emptyMsg="All products are well stocked ✓"/>
        </div>
      </div>

      <div>
        <h2 className="font-bold text-stone-700 mb-3">Stock Movement Log</h2>
        <div className="admin-card overflow-hidden">
          <DataTable columns={logCols} rows={logs} loading={loadLogs}/>
          <div className="px-4 pb-4 pt-2">
            {/* Pagination */}
          </div>
        </div>
      </div>

      <Modal open={showAdj} onClose={() => setShowAdj(false)} title="Adjust Stock" size="sm">
        <div className="space-y-4">
          <Field label="Product ID (copy from product list)">
            <input className="input font-mono" value={adjForm.productId} onChange={e => setAdjForm(f=>({...f,productId:e.target.value}))} placeholder="MongoDB ObjectId"/>
          </Field>
          <Field label="Adjustment Type">
            <div className="flex gap-2">
              {['in','out','adjustment','damage'].map(t => (
                <button key={t} onClick={() => setAdjForm(f=>({...f,type:t}))}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border capitalize transition-colors
                                    ${adjForm.type===t ? 'bg-brand text-white border-brand' : 'border-stone-200 hover:bg-stone-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Quantity">
            <input type="number" className="input" value={adjForm.quantity} onChange={e => setAdjForm(f=>({...f,quantity:e.target.value}))} placeholder="Units"/>
          </Field>
          <Field label="Reference (PO / Order number)">
            <input className="input" value={adjForm.reference} onChange={e => setAdjForm(f=>({...f,reference:e.target.value}))} placeholder="PO-001"/>
          </Field>
          <Field label="Note">
            <input className="input" value={adjForm.note} onChange={e => setAdjForm(f=>({...f,note:e.target.value}))} placeholder="Reason for adjustment"/>
          </Field>
          <div className="flex gap-3 pt-2 border-t border-stone-100">
            <button onClick={() => setShowAdj(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleAdjust} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin"/>} Apply Adjustment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
