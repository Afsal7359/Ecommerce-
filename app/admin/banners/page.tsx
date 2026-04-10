'use client'
import { useEffect, useState, useRef } from 'react'
import { bannerAPI } from '@/lib/api'
import { Modal, Confirm, PageHeader, DataTable, Field } from '@/components/admin/AdminUI'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const POSITIONS = ['all','hero','promo','marketing','sidebar','popup'] as const
type Pos = typeof POSITIONS[number]

const POS_LABEL: Record<string, string> = {
  all: 'All Banners', hero: 'Hero Slides', promo: 'Promo Banners',
  marketing: 'Marketing Cards', sidebar: 'Sidebar', popup: 'Popup',
}
const POS_HINT: Record<string, string> = {
  hero:      'Full-width hero slider on the homepage',
  promo:     'Two mid-page promotional banners (after categories)',
  marketing: 'Two large cards at the bottom of the homepage',
  sidebar:   'Sidebar ads',
  popup:     'Popup overlays',
}

const empty = { title:'', subtitle:'', description:'', ctaText:'Shop Now', ctaLink:'/collections', position:'hero', isActive:true, sortOrder:'0', startsAt:'', endsAt:'', imageUrl:'' }

export default function AdminBanners() {
  const [allBanners, setAllBanners] = useState<any[]>([])
  const [tab, setTab]               = useState<Pos>('all')
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [delId, setDelId]           = useState<string|null>(null)
  const [saving, setSaving]         = useState(false)
  const [edit, setEdit]             = useState<any>(null)
  const [preview, setPreview]       = useState('')
  const [form, setForm]             = useState<any>(empty)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try { const r: any = await bannerAPI.adminList(); setAllBanners(r.banners) }
    catch { toast.error('Failed') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const banners = tab === 'all' ? allBanners : allBanners.filter(b => b.position === tab)

  const openAdd = (pos?: string) => {
    setEdit(null)
    setForm({ ...empty, position: pos || (tab !== 'all' ? tab : 'hero') })
    setPreview(''); setShowForm(true)
  }
  const openEdit = (b: any) => {
    setEdit(b)
    const imgUrl = b.image?.url || ''
    setForm({ title:b.title, subtitle:b.subtitle||'', description:b.description||'', ctaText:b.ctaText||'', ctaLink:b.ctaLink||'', position:b.position, isActive:b.isActive, sortOrder:String(b.sortOrder??0), startsAt:b.startsAt?.slice(0,10)||'', endsAt:b.endsAt?.slice(0,10)||'', imageUrl:imgUrl })
    setPreview(imgUrl); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title) return toast.error('Title required')
    setSaving(true)
    try {
      const fd = new FormData()
      const { imageUrl, ...rest } = form
      Object.entries(rest).forEach(([k,v]) => fd.append(k, String(v)))
      if (fileRef.current?.files?.[0]) {
        fd.append('image', fileRef.current.files[0])
      } else if (imageUrl) {
        fd.append('imageUrl', imageUrl)
      }
      if (edit) { await bannerAPI.update(edit._id, fd); toast.success('Banner updated') }
      else      { await bannerAPI.create(fd); toast.success('Banner created') }
      setShowForm(false); load()
    } catch (e:any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const cols = [
    { key:'image', label:'', render:(r:any) => r.image?.url
      ? <img src={r.image.url} className="w-24 h-14 object-cover rounded-xl border border-stone-100"/>
      : <div className="w-24 h-14 bg-stone-100 rounded-xl flex items-center justify-center text-xs text-stone-400">No image</div>
    },
    { key:'title', label:'Title', render:(r:any) => (
      <div>
        <p className="font-semibold text-sm">{r.title}</p>
        {r.subtitle && <p className="text-xs text-stone-400">{r.subtitle}</p>}
        {r.description && <p className="text-xs text-stone-300 mt-0.5 truncate max-w-xs">{r.description}</p>}
      </div>
    )},
    { key:'position', label:'Position', render:(r:any) => (
      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full
        ${r.position==='hero'?'bg-blue-100 text-blue-700':
          r.position==='marketing'?'bg-purple-100 text-purple-700':
          r.position==='promo'?'bg-orange-100 text-orange-700':
          'bg-stone-100 text-stone-600'}`}>
        {r.position}
      </span>
    )},
    { key:'cta', label:'CTA', render:(r:any) => <span className="text-xs text-stone-500 truncate max-w-[120px] block">{r.ctaLink}</span> },
    { key:'sortOrder', label:'Order', render:(r:any) => <span className="text-sm text-stone-500">{r.sortOrder}</span> },
    { key:'isActive', label:'Status', render:(r:any) => (
      <span className={`badge ${r.isActive ? 'badge-green' : 'badge-gray'}`}>{r.isActive ? 'Active' : 'Hidden'}</span>
    )},
    { key:'actions', label:'', render:(r:any) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="btn-ghost p-1.5 text-blue-600"><Pencil className="w-4 h-4"/></button>
        <button onClick={() => setDelId(r._id)} className="btn-ghost p-1.5 text-red-500"><Trash2 className="w-4 h-4"/></button>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader
        title={POS_LABEL[tab]}
        count={banners.length}
        onAdd={() => openAdd()}
        addLabel={tab === 'all' ? 'Add Banner' : `Add ${POS_LABEL[tab].replace(' Banners','').replace(' Cards','').replace(' Slides','')}`}
      />

      {/* Position tabs */}
      <div className="flex gap-1 mb-4 bg-white border border-stone-100 rounded-2xl p-1 overflow-x-auto scrollbar-hide">
        {POSITIONS.map(p => (
          <button key={p} onClick={() => setTab(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
              ${tab===p ? 'bg-brand text-white shadow-sm' : 'text-stone-500 hover:bg-stone-50'}`}>
            {POS_LABEL[p]}
            <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full
              ${tab===p ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-400'}`}>
              {p === 'all' ? allBanners.length : allBanners.filter(b=>b.position===p).length}
            </span>
          </button>
        ))}
      </div>

      {/* Position hint */}
      {tab !== 'all' && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs text-blue-700 mb-4 flex items-center gap-2">
          <span className="font-bold">ℹ</span> {POS_HINT[tab]}
          {(tab === 'promo' || tab === 'marketing') && (
            <span className="ml-1 text-blue-500">— max 2 shown on homepage</span>
          )}
        </div>
      )}

      <div className="admin-card overflow-hidden">
        <DataTable columns={cols} rows={banners} loading={loading} emptyMsg={`No ${POS_LABEL[tab].toLowerCase()} yet. Click "Add" to create one.`}/>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={edit ? 'Edit Banner' : 'Add Banner'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Title *">
              <input className="input" value={form.title} onChange={e => setForm((f:any)=>({...f,title:e.target.value}))} placeholder="e.g. Bosch Power Tools"/>
            </Field>
            <Field label="Position">
              <select className="select" value={form.position} onChange={e => setForm((f:any)=>({...f,position:e.target.value}))}>
                {['hero','promo','marketing','sidebar','popup'].map(p => (
                  <option key={p} value={p}>{POS_LABEL[p]}</option>
                ))}
              </select>
            </Field>
          </div>
          {form.position && POS_HINT[form.position] && (
            <p className="text-xs text-stone-400 -mt-2 ml-1">📍 {POS_HINT[form.position]}</p>
          )}
          <Field label="Subtitle / Tag Label">
            <input className="input" value={form.subtitle} onChange={e => setForm((f:any)=>({...f,subtitle:e.target.value}))}
              placeholder={form.position==='hero' ? "e.g. Dubai's No.1 Hardware Store" : "e.g. Up to 15% Off"}/>
          </Field>
          <Field label="Description">
            <textarea rows={2} className="input resize-none" value={form.description}
              onChange={e => setForm((f:any)=>({...f,description:e.target.value}))}
              placeholder="Short body text shown below the title (promo & marketing cards)"/>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CTA Button Text">
              <input className="input" value={form.ctaText} onChange={e => setForm((f:any)=>({...f,ctaText:e.target.value}))} placeholder="Shop Now"/>
            </Field>
            <Field label="CTA Link">
              <input className="input" value={form.ctaLink} onChange={e => setForm((f:any)=>({...f,ctaLink:e.target.value}))} placeholder="/collections"/>
            </Field>
            <Field label="Start Date">
              <input type="date" className="input" value={form.startsAt} onChange={e => setForm((f:any)=>({...f,startsAt:e.target.value}))}/>
            </Field>
            <Field label="End Date">
              <input type="date" className="input" value={form.endsAt} onChange={e => setForm((f:any)=>({...f,endsAt:e.target.value}))}/>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sort Order">
              <input type="number" className="input" value={form.sortOrder} onChange={e => setForm((f:any)=>({...f,sortOrder:e.target.value}))} placeholder="0"/>
            </Field>
            <label className="flex items-center gap-2 cursor-pointer text-sm pt-6">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm((f:any)=>({...f,isActive:e.target.checked}))} className="w-4 h-4 accent-brand"/> Active
            </label>
          </div>
          <Field label="Banner Image">
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-stone-200 rounded-xl p-4 text-center cursor-pointer hover:border-brand mb-2 transition-colors">
              {preview
                ? <img src={preview} className="max-h-40 mx-auto object-contain rounded-xl"/>
                : <p className="text-sm text-stone-400 py-8">Click to upload image</p>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) { setPreview(URL.createObjectURL(f)); setForm((fm:any)=>({...fm,imageUrl:''})) }
              }}/>
            <p className="text-xs text-stone-400 text-center mb-2">— or paste an image URL —</p>
            <input className="input text-sm" value={form.imageUrl}
              onChange={e => { setForm((f:any)=>({...f,imageUrl:e.target.value})); setPreview(e.target.value) }}
              placeholder="https://images.unsplash.com/photo-..."/>
          </Field>
          <div className="flex gap-3 pt-2 border-t border-stone-100">
            <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin"/>}
              {edit ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </div>
      </Modal>

      <Confirm open={!!delId} onClose={() => setDelId(null)}
        onConfirm={async () => { await bannerAPI.delete(delId!); setDelId(null); load() }}
        loading={false} message="Delete this banner permanently?"/>
    </div>
  )
}
