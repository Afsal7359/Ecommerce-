'use client'
import { useEffect, useState, useRef } from 'react'
import { brandAPI } from '@/lib/api'
import { Modal, Confirm, PageHeader, DataTable, Field } from '@/components/admin/AdminUI'
import { Pencil, Trash2, Loader2, Upload, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const empty = { name: '', description: '', website: '', isFeatured: false, isActive: true }

export default function AdminBrands() {
  const [brands, setBrands]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [delId, setDelId]       = useState<string | null>(null)
  const [delLoad, setDL]        = useState(false)
  const [saving, setSaving]     = useState(false)
  const [edit, setEdit]         = useState<any>(null)
  const [preview, setPreview]   = useState('')
  const [form, setForm]         = useState<any>(empty)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      const r: any = await brandAPI.all()
      setBrands(r.brands || [])
    } catch { toast.error('Failed to load brands') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEdit(null)
    setForm(empty)
    setPreview('')
    setShowForm(true)
  }

  const openEdit = (b: any) => {
    setEdit(b)
    setForm({
      name: b.name, description: b.description || '',
      website: b.website || '',
      isFeatured: b.isFeatured || false, isActive: b.isActive !== false,
    })
    setPreview(b.logo?.url || '')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Brand name is required')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      if (fileRef.current?.files?.[0]) fd.append('logo', fileRef.current.files[0])
      if (edit) { await brandAPI.update(edit._id, fd); toast.success('Brand updated') }
      else      { await brandAPI.create(fd); toast.success('Brand created') }
      setShowForm(false); load()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!delId) return
    setDL(true)
    try { await brandAPI.delete(delId); toast.success('Brand deleted'); setDelId(null); load() }
    catch (e: any) { toast.error(e.message) }
    finally { setDL(false) }
  }

  const cols = [
    {
      key: 'logo', label: '',
      render: (r: any) => (
        <div className="w-14 h-14 bg-stone-50 border border-stone-100 rounded-xl flex items-center justify-center overflow-hidden">
          {r.logo?.url
            ? <img src={r.logo.url} alt={r.name} className="w-full h-full object-contain p-1" />
            : <span className="text-xs font-black text-stone-300 uppercase tracking-tight">{r.name?.slice(0,3)}</span>}
        </div>
      ),
    },
    {
      key: 'name', label: 'Brand',
      render: (r: any) => (
        <div>
          <p className="font-semibold text-stone-800">{r.name}</p>
          <p className="text-xs text-stone-400 mt-0.5">/brands/{r.slug}</p>
          {r.website && <p className="text-xs text-brand mt-0.5 truncate max-w-[180px]">{r.website}</p>}
        </div>
      ),
    },
    {
      key: 'isFeatured', label: 'Featured',
      render: (r: any) => (
        r.isFeatured
          ? <span className="flex items-center gap-1 text-xs font-bold text-yellow-600"><Star className="w-3 h-3 fill-yellow-400" /> Featured</span>
          : <span className="text-xs text-stone-400">—</span>
      ),
    },
    {
      key: 'isActive', label: 'Status',
      render: (r: any) => (
        <span className={`badge ${r.isActive !== false ? 'badge-green' : 'badge-gray'}`}>
          {r.isActive !== false ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'actions', label: '',
      render: (r: any) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(r)} className="btn-ghost p-1.5 text-blue-600"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDelId(r._id)} className="btn-ghost p-1.5 text-red-500"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Brands" count={brands.length} onAdd={openAdd} />

      <div className="admin-card overflow-hidden">
        <DataTable columns={cols} rows={brands} loading={loading} emptyMsg="No brands found. Add your first brand." />
      </div>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={edit ? 'Edit Brand' : 'Add Brand'} size="md">
        <div className="space-y-4">
          <Field label="Brand Name *">
            <input className="input" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Bosch, Dewalt, Grohe" />
          </Field>

          <Field label="Description">
            <textarea rows={2} className="input resize-none" value={form.description}
              onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))}
              placeholder="Short description of the brand" />
          </Field>

          <Field label="Website URL">
            <input className="input" value={form.website}
              onChange={e => setForm((f: any) => ({ ...f, website: e.target.value }))}
              placeholder="https://www.bosch.com" />
          </Field>

          <Field label="Logo">
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-stone-200 rounded-xl p-5 text-center cursor-pointer hover:border-brand hover:bg-orange-50 transition-colors">
              {preview ? (
                <img src={preview} className="h-20 mx-auto object-contain" alt="Logo preview" />
              ) : (
                <div className="py-4">
                  <Upload className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm text-stone-400">Click to upload logo</p>
                  <p className="text-xs text-stone-300 mt-1">PNG, SVG, WebP up to 2MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)) }} />
          </Field>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.isActive}
                onChange={e => setForm((f: any) => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-brand" />
              Active
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.isFeatured}
                onChange={e => setForm((f: any) => ({ ...f, isFeatured: e.target.checked }))}
                className="w-4 h-4 accent-brand" />
              Featured on homepage
            </label>
          </div>

          <div className="flex gap-3 pt-2 border-t border-stone-100 mt-4">
            <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {edit ? 'Update Brand' : 'Create Brand'}
            </button>
          </div>
        </div>
      </Modal>

      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete}
        loading={delLoad} message="This will permanently delete the brand." />
    </div>
  )
}
