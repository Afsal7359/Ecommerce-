'use client'
import { ReactNode, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Search, Plus, Loader2 } from 'lucide-react'

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean; onClose: () => void
  title: string; children: ReactNode
  size?: 'sm'|'md'|'lg'|'xl'
}
export function Modal({ open, onClose, title, children, size='md' }: ModalProps) {
  if (!open) return null
  const widths = { sm:'max-w-sm', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <h2 className="font-bold text-stone-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4"/>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
interface ConfirmProps {
  open: boolean; onClose: () => void; onConfirm: () => void
  title?: string; message?: string; loading?: boolean
}
export function Confirm({ open, onClose, onConfirm, title='Delete?', message='This action cannot be undone.', loading }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-stone-500 mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onClose}  className="flex-1 btn-outline">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
                className="flex-1 btn-danger flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin"/>}
          Delete
        </button>
      </div>
    </Modal>
  )
}

// ── Page header ───────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string; count?: number
  onAdd?: () => void; addLabel?: string
  search?: string; onSearch?: (v: string) => void
  children?: ReactNode
}
export function PageHeader({ title, count, onAdd, addLabel='Add New', search, onSearch, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="page-title">{title}</h1>
        {count !== undefined && <p className="text-sm text-stone-400 mt-0.5">{count} total</p>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {onSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"/>
            <input value={search} onChange={(e) => onSearch(e.target.value)}
                   placeholder="Search…" className="input input-sm pl-9 w-52"/>
          </div>
        )}
        {children}
        {onAdd && (
          <button onClick={onAdd} className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5"/> {addLabel}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Data table ────────────────────────────────────────────────────────────────
interface TableProps {
  columns: { key: string; label: string; render?: (row: any) => ReactNode }[]
  rows: any[]; loading?: boolean; emptyMsg?: string
}
export function DataTable({ columns, rows, loading, emptyMsg='No data found.' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-stone-50 border-b border-stone-100">
          <tr>{columns.map(c => <th key={c.key} className="table-th">{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="table-td text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-stone-300 mx-auto"/>
            </td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="table-td text-center py-12 text-stone-400 text-sm">
              {emptyMsg}
            </td></tr>
          ) : rows.map((row, i) => (
            <tr key={row._id || i} className="hover:bg-stone-50/50">
              {columns.map(c => (
                <td key={c.key} className="table-td">
                  {c.render ? c.render(row) : row[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button onClick={() => onPage(page-1)} disabled={page <= 1}
              className="p-2 rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-50">
        <ChevronLeft className="w-4 h-4"/>
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i+1).map(p => (
        <button key={p} onClick={() => onPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                            ${p === page ? 'bg-brand text-white' : 'border border-stone-200 hover:bg-stone-50'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPage(page+1)} disabled={page >= pages}
              className="p-2 rounded-lg border border-stone-200 disabled:opacity-30 hover:bg-stone-50">
        <ChevronRight className="w-4 h-4"/>
      </button>
    </div>
  )
}

// ── Form field wrappers ───────────────────────────────────────────────────────
export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ── Status badge helper ───────────────────────────────────────────────────────
const ORDER_STATUS_STYLES: Record<string, string> = {
  pending:'badge-yellow', confirmed:'badge-blue', processing:'badge-blue',
  shipped:'badge-orange', out_for_delivery:'badge-orange',
  delivered:'badge-green', cancelled:'badge-red', returned:'badge-red',
  paid:'badge-green', failed:'badge-red', refunded:'badge-gray',
  new:'badge-blue', contacted:'badge-yellow', quoted:'badge-orange', won:'badge-green', lost:'badge-red',
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={ORDER_STATUS_STYLES[status] || 'badge-gray'}>
      {status?.replace(/_/g,' ')}
    </span>
  )
}

// ── Image preview ─────────────────────────────────────────────────────────────
export function ImagePreview({ src, alt='', className='' }: { src?: string; alt?: string; className?: string }) {
  if (!src) return <div className={`bg-stone-100 rounded-xl flex items-center justify-center text-stone-300 text-xs ${className}`}>No image</div>
  return <img src={src} alt={alt} className={`object-cover rounded-xl ${className}`}/>
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-stone-200'}`}
           onClick={() => onChange(!checked)}>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                         ${checked ? 'translate-x-5' : 'translate-x-0'}`}/>
      </div>
      {label && <span className="text-sm text-stone-600">{label}</span>}
    </label>
  )
}
