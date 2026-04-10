'use client'
import { useEffect, useState } from 'react'
import { cmsAPI } from '@/lib/api'
import { Modal, Confirm, PageHeader, DataTable, Field } from '@/components/admin/AdminUI'
import { Pencil, Trash2, Loader2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const empty = { title:'', slug:'', content:'', metaTitle:'', metaDesc:'', isActive:true }

export default function AdminCMS() {
  const [pages, setPages]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [delId, setDelId]       = useState<string|null>(null)
  const [saving, setSaving]     = useState(false)
  const [edit, setEdit]         = useState<any>(null)
  const [form, setForm]         = useState<any>(empty)

  const load = async () => {
    setLoading(true)
    try { const r: any = await cmsAPI.list(); setPages(r.pages) }
    catch { toast.error('Failed') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setEdit(null); setForm(empty); setShowForm(true) }
  const openEdit = (p: any) => { setEdit(p); setForm({ title:p.title, slug:p.slug, content:p.content, metaTitle:p.metaTitle||'', metaDesc:p.metaDesc||'', isActive:p.isActive }); setShowForm(true) }

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.content) return toast.error('Title, slug and content required')
    setSaving(true)
    try {
      if (edit) { await cmsAPI.update(edit._id, form); toast.success('Page updated') }
      else      { await cmsAPI.create(form); toast.success('Page created') }
      setShowForm(false); load()
    } catch (e:any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const cols = [
    { key:'title', label:'Page', render:(r:any) => (
      <div>
        <p className="font-semibold">{r.title}</p>
        <p className="text-xs text-stone-400">/{r.slug}</p>
      </div>
    )},
    { key:'isSystem', label:'Type', render:(r:any) => <span className={`badge ${r.isSystem ? 'badge-orange' : 'badge-gray'}`}>{r.isSystem ? 'System' : 'Custom'}</span> },
    { key:'isActive', label:'Status', render:(r:any) => <span className={`badge ${r.isActive ? 'badge-green' : 'badge-gray'}`}>{r.isActive ? 'Active' : 'Hidden'}</span> },
    { key:'updatedAt', label:'Last Updated', render:(r:any) => <span className="text-xs text-stone-400">{format(new Date(r.updatedAt),'dd MMM yy')}</span> },
    { key:'actions', label:'', render:(r:any) => (
      <div className="flex gap-1">
        <a href={`/pages/${r.slug}`} target="_blank" className="btn-ghost p-1.5"><Eye className="w-4 h-4"/></a>
        <button onClick={() => openEdit(r)} className="btn-ghost p-1.5 text-blue-600"><Pencil className="w-4 h-4"/></button>
        {!r.isSystem && <button onClick={() => setDelId(r._id)} className="btn-ghost p-1.5 text-red-500"><Trash2 className="w-4 h-4"/></button>}
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="CMS Pages" count={pages.length} onAdd={openAdd} addLabel="New Page"/>
      <div className="admin-card overflow-hidden">
        <DataTable columns={cols} rows={pages} loading={loading}/>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={edit ? 'Edit Page' : 'New Page'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Page Title *">
              <input className="input" value={form.title} onChange={e => { setForm((f:any)=>({ ...f, title:e.target.value, slug:!edit ? e.target.value.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') : f.slug })) }} placeholder="About Us"/>
            </Field>
            <Field label="Slug *">
              <input className="input font-mono text-sm" value={form.slug} onChange={e => setForm((f:any)=>({...f,slug:e.target.value}))} placeholder="about-us"/>
            </Field>
          </div>
          <Field label="Content (HTML supported) *">
            <textarea rows={12} className="input resize-y font-mono text-xs" value={form.content} onChange={e => setForm((f:any)=>({...f,content:e.target.value}))} placeholder="<h1>About Us</h1><p>Your content here...</p>"/>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SEO Title"><input className="input" value={form.metaTitle} onChange={e => setForm((f:any)=>({...f,metaTitle:e.target.value}))}/></Field>
            <Field label="SEO Description"><input className="input" value={form.metaDesc} onChange={e => setForm((f:any)=>({...f,metaDesc:e.target.value}))}/></Field>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm((f:any)=>({...f,isActive:e.target.checked}))} className="w-4 h-4 accent-brand"/> Published
          </label>
          <div className="flex gap-3 pt-2 border-t border-stone-100">
            <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin"/>}{edit ? 'Save Changes' : 'Create Page'}
            </button>
          </div>
        </div>
      </Modal>
      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={async () => { await cmsAPI.delete(delId!); setDelId(null); load() }} loading={false}/>
    </div>
  )
}
