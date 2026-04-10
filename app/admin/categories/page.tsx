'use client'
import { useEffect, useState, useRef } from 'react'
import { categoryAPI } from '@/lib/api'
import { Modal, Confirm, PageHeader, DataTable, Field, ImagePreview } from '@/components/admin/AdminUI'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const [cats, setCats]         = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [delId, setDelId]       = useState<string|null>(null)
  const [saving, setSaving]     = useState(false)
  const [delLoad, setDL]        = useState(false)
  const [edit, setEdit]         = useState<any>(null)
  const [preview, setPreview]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ name:'', description:'', sortOrder:'0', isActive:true, metaTitle:'', metaDesc:'', imageUrl:'' })

  const load = async () => {
    setLoading(true)
    try { const r: any = await categoryAPI.all(); setCats(r.categories) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEdit(null); setForm({ name:'', description:'', sortOrder:'0', isActive:true, metaTitle:'', metaDesc:'', imageUrl:'' }); setPreview(''); setShowForm(true) }
  const openEdit = (c: any) => {
    const imgUrl = c.image?.url || ''
    setEdit(c); setForm({ name:c.name, description:c.description||'', sortOrder:String(c.sortOrder??0), isActive:c.isActive, metaTitle:c.metaTitle||'', metaDesc:c.metaDesc||'', imageUrl:imgUrl }); setPreview(imgUrl); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name) return toast.error('Name required')
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
      if (edit) { await categoryAPI.update(edit._id, fd); toast.success('Category updated') }
      else      { await categoryAPI.create(fd); toast.success('Category created') }
      setShowForm(false); load()
    } catch (e:any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!delId) return; setDL(true)
    try { await categoryAPI.delete(delId); toast.success('Deleted'); setDelId(null); load() }
    catch (e:any) { toast.error(e.message) }
    finally { setDL(false) }
  }

  const cols = [
    { key:'image', label:'', render:(r:any) => <ImagePreview src={r.image?.url} className="w-12 h-12"/> },
    { key:'name', label:'Name', render:(r:any) => <div><p className="font-semibold">{r.name}</p><p className="text-xs text-stone-400">/categories/{r.slug}</p></div> },
    { key:'isActive', label:'Active', render:(r:any) => <span className={`badge ${r.isActive ? 'badge-green' : 'badge-gray'}`}>{r.isActive ? 'Active' : 'Hidden'}</span> },
    { key:'actions', label:'', render:(r:any) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="btn-ghost p-1.5 text-blue-600"><Pencil className="w-4 h-4"/></button>
        <button onClick={() => setDelId(r._id)} className="btn-ghost p-1.5 text-red-500"><Trash2 className="w-4 h-4"/></button>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Categories" count={cats.length} onAdd={openAdd}/>
      <div className="admin-card overflow-hidden">
        <DataTable columns={cols} rows={cats} loading={loading}/>
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={edit ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <Field label="Name *"><input className="input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Category name"/></Field>
          <Field label="Description"><textarea rows={2} className="input resize-none" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}/></Field>
          <Field label="Sort Order"><input type="number" className="input" value={form.sortOrder} onChange={e => setForm(f=>({...f,sortOrder:e.target.value}))}/></Field>
          <Field label="Image">
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-stone-200 rounded-xl p-4 text-center cursor-pointer hover:border-brand mb-2">
              {preview ? <img src={preview} className="h-24 mx-auto object-contain rounded-xl"/> : <p className="text-sm text-stone-400 py-4">Click to upload</p>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f=e.target.files?.[0]; if(f){ setPreview(URL.createObjectURL(f)); setForm(fm=>({...fm,imageUrl:''})) }}}/>
            <p className="text-xs text-stone-400 text-center mb-2">— or paste an image URL —</p>
            <input className="input text-sm" value={form.imageUrl} onChange={e => { setForm(f=>({...f,imageUrl:e.target.value})); setPreview(e.target.value) }} placeholder="https://images.unsplash.com/..."/>
          </Field>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f=>({...f,isActive:e.target.checked}))} className="w-4 h-4 accent-brand"/> Active
          </label>
          <div className="flex gap-3 pt-2 border-t border-stone-100">
            <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin"/>}{edit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete} loading={delLoad}/>
    </div>
  )
}
