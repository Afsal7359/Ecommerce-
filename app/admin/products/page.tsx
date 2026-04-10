'use client'
import { useEffect, useState, useRef } from 'react'
import { productAPI, categoryAPI, brandAPI } from '@/lib/api'
import { Modal, Confirm, PageHeader, DataTable, Pagination, Field, StatusBadge, ImagePreview, Toggle } from '@/components/admin/AdminUI'
import { Pencil, Trash2, Eye, Upload, Loader2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const BADGES = ['','new','sale','hot','bestseller']

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [cats, setCats]         = useState<any[]>([])
  const [brands, setBrands]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [total, setTotal]       = useState(0)
  const [search, setSearch]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [delId, setDelId]       = useState<string|null>(null)
  const [delLoading, setDL]     = useState(false)
  const [saving, setSaving]     = useState(false)
  const [editProd, setEditProd] = useState<any>(null)
  const [existingImgs, setExistingImgs] = useState<string[]>([])  // server URLs to keep
  const [newFiles, setNewFiles]         = useState<File[]>([])     // new files pending upload
  const [urlInput, setUrlInput]         = useState('')             // paste-a-URL input
  const fileRef = useRef<HTMLInputElement>(null)

  const emptyForm = { name:'', sku:'', description:'', shortDesc:'', category:'', brand:'', price:'', comparePrice:'', costPrice:'', stock:'', lowStockAlert:'5', badge:'', isFeatured:false, isActive:true, features:'', tags:'', metaTitle:'', metaDesc:'' }
  const [form, setForm] = useState(emptyForm)

  const load = async (p=page, s=search) => {
    setLoading(true)
    try {
      const res: any = await productAPI.adminList({ page:p, limit:15, search:s })
      setProducts(res.products); setPages(res.pages); setTotal(res.total)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  useEffect(() => { load(1, search) }, [search])
  useEffect(() => { categoryAPI.list().then((r:any) => setCats(r.categories)) }, [])
  useEffect(() => { brandAPI.list().then((r:any)   => setBrands(r.brands))    }, [])

  const openAdd  = () => { setEditProd(null); setForm(emptyForm); setExistingImgs([]); setNewFiles([]); setUrlInput(''); setShowForm(true) }
  const openEdit = (p: any) => {
    setEditProd(p)
    setForm({ name:p.name, sku:p.sku||'', description:p.description, shortDesc:p.shortDesc||'', category:p.category?._id||'', brand:p.brand?._id||'', price:p.price, comparePrice:p.comparePrice||'', costPrice:p.costPrice||'', stock:p.stock, lowStockAlert:p.lowStockAlert||5, badge:p.badge||'', isFeatured:p.isFeatured, isActive:p.isActive, features:(p.features||[]).join('\n'), tags:(p.tags||[]).join(', '), metaTitle:p.metaTitle||'', metaDesc:p.metaDesc||'' } as any)
    setExistingImgs(p.images?.map((i:any) => i.url) || [])
    setNewFiles([]); setUrlInput('')
    setShowForm(true)
  }

  const addImageUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    setExistingImgs(prev => [...prev, url])
    setUrlInput('')
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return
    const arr = Array.from(files)          // capture immediately — before input clears
    setNewFiles(prev => [...prev, ...arr])
  }

  const removeImage = (idx: number) => {
    if (idx < existingImgs.length) {
      setExistingImgs(prev => prev.filter((_,j) => j !== idx))
    } else {
      const ni = idx - existingImgs.length
      setNewFiles(prev => prev.filter((_,j) => j !== ni))
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.category || !form.brand || !form.price) return toast.error('Fill required fields')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => {
        if (k === 'features') fd.append(k, JSON.stringify(String(v).split('\n').filter(Boolean)))
        else if (k === 'tags') fd.append(k, JSON.stringify(String(v).split(',').map(t=>t.trim()).filter(Boolean)))
        else fd.append(k, String(v))
      })
      // Tell backend which images to keep (existing saved + URL-added ones)
      fd.append('keepImages', JSON.stringify(existingImgs))
      // Append new file uploads
      newFiles.forEach(f => fd.append('images', f))
      if (editProd) { await productAPI.update(editProd._id, fd); toast.success('Product updated') }
      else          { await productAPI.create(fd); toast.success('Product created') }
      setShowForm(false); load(1, search)
    } catch (e:any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!delId) return; setDL(true)
    try {
      await productAPI.delete(delId); toast.success('Product deleted')
      setDelId(null); load(1, search)
    } catch (e:any) { toast.error(e.message) }
    finally { setDL(false) }
  }

  const cols = [
    { key:'img', label:'', render:(r:any) => (
      <div className="relative w-12 h-12 shrink-0">
        <ImagePreview src={r.images?.[0]?.url} alt={r.name} className="w-12 h-12"/>
      </div>
    )},
    { key:'name', label:'Product', render:(r:any) => (
      <div>
        <p className="font-semibold text-stone-800 text-sm leading-tight max-w-xs truncate">{r.name}</p>
        <p className="text-xs text-stone-400 mt-0.5">{r.sku || '—'} · {r.category?.name}</p>
      </div>
    )},
    { key:'brand', label:'Brand', render:(r:any) => <span className="text-xs font-semibold text-stone-600">{r.brand?.name}</span> },
    { key:'price', label:'Price', render:(r:any) => (
      <div>
        <div className="font-bold text-stone-900">AED {r.price}</div>
        {r.comparePrice > 0 && <div className="text-xs text-stone-400 line-through">AED {r.comparePrice}</div>}
      </div>
    )},
    { key:'stock', label:'Stock', render:(r:any) => (
      <span className={`font-bold text-sm ${r.stock <= r.lowStockAlert ? 'text-red-600' : 'text-green-700'}`}>
        {r.stock} {r.stock <= r.lowStockAlert && r.stock > 0 ? '⚠' : r.stock === 0 ? '✗' : ''}
      </span>
    )},
    { key:'rating', label:'Rating', render:(r:any) => (
      <div className="flex items-center gap-1 text-xs">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400"/>
        <span>{r.rating?.toFixed(1) || '—'}</span>
        <span className="text-stone-400">({r.numReviews})</span>
      </div>
    )},
    { key:'isActive', label:'Status', render:(r:any) => (
      <StatusBadge status={r.isActive ? 'confirmed' : 'cancelled'}/>
    )},
    { key:'actions', label:'', render:(r:any) => (
      <div className="flex items-center gap-1">
        <Link href={`/products/${r.slug}`} target="_blank" className="btn-ghost p-1.5"><Eye className="w-4 h-4"/></Link>
        <button onClick={() => openEdit(r)} className="btn-ghost p-1.5 text-blue-600"><Pencil className="w-4 h-4"/></button>
        <button onClick={() => setDelId(r._id)} className="btn-ghost p-1.5 text-red-500"><Trash2 className="w-4 h-4"/></button>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader title="Products" count={total} onAdd={openAdd} search={search} onSearch={setSearch}/>

      <div className="admin-card overflow-hidden">
        <DataTable columns={cols} rows={products} loading={loading} emptyMsg="No products found."/>
        <div className="px-4 pb-4 pt-2">
          <Pagination page={page} pages={pages} onPage={(p) => { setPage(p); load(p, search) }}/>
        </div>
      </div>

      {/* Product form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editProd ? 'Edit Product' : 'Add Product'} size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Product Name *">
            <input className="input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Product name"/>
          </Field>
          <Field label="SKU">
            <input className="input" value={form.sku} onChange={e => setForm(f=>({...f,sku:e.target.value}))} placeholder="SKU code"/>
          </Field>
          <Field label="Category *">
            <select className="select" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
              <option value="">Select category</option>
              {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Brand *">
            <select className="select" value={form.brand} onChange={e => setForm(f=>({...f,brand:e.target.value}))}>
              <option value="">Select brand</option>
              {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Price (AED) *">
            <input type="number" className="input" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} placeholder="0.00"/>
          </Field>
          <Field label="Compare Price (AED)">
            <input type="number" className="input" value={form.comparePrice} onChange={e => setForm(f=>({...f,comparePrice:e.target.value}))} placeholder="0.00"/>
          </Field>
          <Field label="Stock">
            <input type="number" className="input" value={form.stock} onChange={e => setForm(f=>({...f,stock:e.target.value}))} placeholder="0"/>
          </Field>
          <Field label="Low Stock Alert">
            <input type="number" className="input" value={form.lowStockAlert} onChange={e => setForm(f=>({...f,lowStockAlert:e.target.value}))} placeholder="5"/>
          </Field>
          <div className="md:col-span-2">
            <Field label="Short Description">
              <input className="input" value={form.shortDesc} onChange={e => setForm(f=>({...f,shortDesc:e.target.value}))} placeholder="Short summary"/>
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Description *">
              <textarea rows={4} className="input resize-none" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Full product description"/>
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Key Features (one per line)">
              <textarea rows={3} className="input resize-none" value={form.features} onChange={e => setForm(f=>({...f,features:e.target.value}))} placeholder="800W motor&#10;SDS Plus system&#10;Quick-change chuck"/>
            </Field>
          </div>
          <Field label="Tags (comma separated)">
            <input className="input" value={form.tags} onChange={e => setForm(f=>({...f,tags:e.target.value}))} placeholder="drill, bosch, power tool"/>
          </Field>
          <Field label="Badge">
            <select className="select" value={form.badge} onChange={e => setForm(f=>({...f,badge:e.target.value}))}>
              {BADGES.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
            </select>
          </Field>
          <Field label="SEO Title">
            <input className="input" value={form.metaTitle} onChange={e => setForm(f=>({...f,metaTitle:e.target.value}))}/>
          </Field>
          <Field label="SEO Description">
            <input className="input" value={form.metaDesc} onChange={e => setForm(f=>({...f,metaDesc:e.target.value}))}/>
          </Field>

          <div className="md:col-span-2 flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.isActive as boolean} onChange={e => setForm(f=>({...f,isActive:e.target.checked}))} className="w-4 h-4 accent-brand"/>
              Active
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.isFeatured as boolean} onChange={e => setForm(f=>({...f,isFeatured:e.target.checked}))} className="w-4 h-4 accent-brand"/>
              Featured
            </label>
          </div>

          {/* Image upload */}
          <div className="md:col-span-2">
            <p className="label">Images</p>
            <div onClick={() => fileRef.current?.click()}
                 className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center cursor-pointer hover:border-brand hover:bg-orange-50 transition-colors">
              <Upload className="w-6 h-6 text-stone-300 mx-auto mb-2"/>
              <p className="text-sm text-stone-400">Click to select images (max 8)</p>
              <p className="text-xs text-stone-300 mt-1">JPG, PNG, WEBP up to 5MB each</p>
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                   onChange={e => { const f = e.target.files; handleFiles(f); e.target.value = '' }}/>
            {/* Paste image URL */}
            <div className="flex gap-2 mt-2">
              <input
                className="input text-sm flex-1"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addImageUrl()}
                placeholder="Or paste an image URL and press Add…"
              />
              <button type="button" onClick={addImageUrl}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-700 transition-colors shrink-0">
                Add
              </button>
            </div>
            {(existingImgs.length > 0 || newFiles.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {existingImgs.map((src, i) => (
                  <div key={`ex-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-stone-200">
                    <img src={src} alt="" className="w-full h-full object-cover"/>
                    <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[8px] text-center py-0.5">Saved</span>
                    <button onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold leading-none">×</button>
                  </div>
                ))}
                {newFiles.map((file, i) => (
                  <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-brand/40">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover"/>
                    <span className="absolute bottom-0 left-0 right-0 bg-brand/70 text-white text-[8px] text-center py-0.5">New</span>
                    <button onClick={() => removeImage(existingImgs.length + i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold leading-none">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-stone-100">
          <button onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin"/>}
            {editProd ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </Modal>

      <Confirm open={!!delId} onClose={() => setDelId(null)} onConfirm={handleDelete}
               loading={delLoading} message="This will permanently delete the product and all its images."/>
    </div>
  )
}
