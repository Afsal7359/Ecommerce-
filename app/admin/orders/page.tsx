'use client'
import { useEffect, useState } from 'react'
import { orderAPI } from '@/lib/api'
import { Modal, PageHeader, DataTable, Pagination, Field, StatusBadge } from '@/components/admin/AdminUI'
import { Eye, Loader2, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const ORDER_STATUSES = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned']
const PAY_STATUSES   = ['pending','paid','failed','refunded']

export default function AdminOrders() {
  const [orders, setOrders]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [total, setTotal]     = useState(0)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelected]    = useState<any>(null)
  const [updating, setUpdating] = useState(false)
  const [statusForm, setStatusForm] = useState({ status:'', note:'', trackingNumber:'', courierName:'' })

  const load = async (p=1) => {
    setLoading(true)
    try {
      const res: any = await orderAPI.all({ page:p, limit:15, search, status:statusFilter })
      setOrders(res.orders); setPages(res.pages); setTotal(res.total)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  useEffect(() => { setPage(1); load(1) }, [search, statusFilter])

  const openOrder = async (id: string) => {
    try {
      const res: any = await orderAPI.byId(id)
      setSelected(res.order)
      setStatusForm({ status: res.order.orderStatus, note:'', trackingNumber: res.order.trackingNumber||'', courierName: res.order.courierName||'' })
    } catch { toast.error('Failed to load order') }
  }

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return; setUpdating(true)
    try {
      await orderAPI.updateStatus(selectedOrder._id, statusForm)
      toast.success('Order updated'); setSelected(null); load(page)
    } catch (e:any) { toast.error(e.message) }
    finally { setUpdating(false) }
  }

  const handlePayUpdate = async (status: string) => {
    if (!selectedOrder) return
    try {
      await orderAPI.updatePayment(selectedOrder._id, status)
      toast.success('Payment status updated'); setSelected(null); load(page)
    } catch (e:any) { toast.error(e.message) }
  }

  const cols = [
    { key:'orderNumber', label:'Order', render:(r:any) => (
      <span className="font-mono text-xs font-bold text-brand">#{r.orderNumber}</span>
    )},
    { key:'customer', label:'Customer', render:(r:any) => (
      <div>
        <p className="text-sm font-medium">{r.user?.name || r.shipping?.name}</p>
        <p className="text-xs text-stone-400">{r.user?.email || r.guestEmail}</p>
      </div>
    )},
    { key:'shipping', label:'Emirate', render:(r:any) => (
      <span className="text-sm">{r.shipping?.emirate}</span>
    )},
    { key:'total', label:'Total', render:(r:any) => (
      <div>
        <div className="font-bold text-sm">AED {r.total?.toFixed(2)}</div>
        <div className="text-xs text-stone-400 capitalize">{r.paymentMethod}</div>
      </div>
    )},
    { key:'paymentStatus', label:'Payment', render:(r:any) => <StatusBadge status={r.paymentStatus}/> },
    { key:'orderStatus', label:'Status',  render:(r:any) => <StatusBadge status={r.orderStatus}/> },
    { key:'createdAt', label:'Date', render:(r:any) => (
      <span className="text-xs text-stone-400">{format(new Date(r.createdAt),'dd MMM yy')}</span>
    )},
    { key:'actions', label:'', render:(r:any) => (
      <button onClick={() => openOrder(r._id)} className="btn-ghost p-1.5 text-blue-600">
        <Eye className="w-4 h-4"/>
      </button>
    )},
  ]

  return (
    <div>
      <PageHeader title="Orders" count={total} search={search} onSearch={setSearch}>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select input-sm pr-8 w-40">
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none"/>
        </div>
      </PageHeader>

      <div className="admin-card overflow-hidden">
        <DataTable columns={cols} rows={orders} loading={loading}/>
        <div className="px-4 pb-4 pt-2">
          <Pagination page={page} pages={pages} onPage={(p) => { setPage(p); load(p) }}/>
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <Modal open title={`Order #${selectedOrder.orderNumber}`} onClose={() => setSelected(null)} size="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: items + shipping */}
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item._id} className="flex gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-stone-100 shrink-0"/>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
                        <p className="text-xs text-stone-400">{item.brand} · Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-bold text-stone-900 shrink-0">AED {(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-stone-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>AED {selectedOrder.subtotal?.toFixed(2)}</span></div>
                {selectedOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({selectedOrder.coupon})</span><span>−AED {selectedOrder.discount?.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span className="text-stone-500">Shipping</span><span>{selectedOrder.shippingFee === 0 ? 'Free' : `AED ${selectedOrder.shippingFee}`}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">VAT (5%)</span><span>AED {selectedOrder.vat?.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base border-t border-stone-200 pt-2"><span>Total</span><span>AED {selectedOrder.total?.toFixed(2)}</span></div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Shipping Address</h3>
                <div className="text-sm text-stone-700 space-y-0.5">
                  <p className="font-semibold">{selectedOrder.shipping?.name}</p>
                  <p>{selectedOrder.shipping?.line1}{selectedOrder.shipping?.line2 ? ', '+selectedOrder.shipping.line2 : ''}</p>
                  <p>{selectedOrder.shipping?.city}, {selectedOrder.shipping?.emirate}</p>
                  <p>📞 {selectedOrder.shipping?.phone}</p>
                </div>
              </div>
            </div>

            {/* Right: status update */}
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Update Status</h3>
                <div className="space-y-3">
                  <Field label="Order Status">
                    <select className="select" value={statusForm.status} onChange={e => setStatusForm(f=>({...f,status:e.target.value}))}>
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    </select>
                  </Field>
                  <Field label="Tracking Number">
                    <input className="input" value={statusForm.trackingNumber} onChange={e => setStatusForm(f=>({...f,trackingNumber:e.target.value}))} placeholder="e.g. DHL1234567"/>
                  </Field>
                  <Field label="Courier">
                    <input className="input" value={statusForm.courierName} onChange={e => setStatusForm(f=>({...f,courierName:e.target.value}))} placeholder="e.g. Aramex, DHL"/>
                  </Field>
                  <Field label="Note (shown to customer)">
                    <input className="input" value={statusForm.note} onChange={e => setStatusForm(f=>({...f,note:e.target.value}))} placeholder="Optional note"/>
                  </Field>
                  <button onClick={handleStatusUpdate} disabled={updating}
                          className="btn-primary w-full flex items-center justify-center gap-2">
                    {updating && <Loader2 className="w-4 h-4 animate-spin"/>} Update Order
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Payment Status</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={selectedOrder.paymentStatus}/>
                  {PAY_STATUSES.filter(s => s !== selectedOrder.paymentStatus).map(s => (
                    <button key={s} onClick={() => handlePayUpdate(s)}
                            className="text-xs border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-50 capitalize">
                      Mark {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Status History</h3>
                <div className="space-y-2">
                  {selectedOrder.statusHistory?.map((h: any, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand mt-1.5 shrink-0"/>
                      <div>
                        <p className="text-xs font-semibold capitalize text-stone-700">{h.status?.replace(/_/g,' ')}</p>
                        {h.note && <p className="text-xs text-stone-400">{h.note}</p>}
                        <p className="text-[10px] text-stone-300">{h.updatedBy} · {h.at ? format(new Date(h.at),'dd MMM yy HH:mm') : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
