import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Button, Modal, PageHeader, SearchInput, Table, Toggle } from './ui'

export type Field<T> = {
  key: keyof T & string
  label: string
  type?: 'text' | 'number' | 'textarea' | 'select' | 'toggle' | 'list'
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  half?: boolean
}

/**
 * Generic list + create/edit modal used by admin, seller and technician panels
 * for simple listing tables (sellers, services, AMC plans, RSA offerings, products…).
 */
export function CrudPage<T extends { id: string; is_active?: boolean }>({
  title, subtitle, rows, columns, fields, blank, onSave, onDelete, searchKeys, filters, newLabel = 'Add new',
}: {
  title: string; subtitle?: string; rows: T[]
  columns: { header: string; cell: (r: T) => ReactNode; className?: string }[]
  fields: Field<T>[]; blank: () => T
  onSave: (row: T) => Promise<unknown>; onDelete?: (row: T) => Promise<unknown>
  searchKeys: (keyof T)[]; filters?: ReactNode; newLabel?: string
}) {
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<T | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [error, setError] = useState('')
  const [confirmDel, setConfirmDel] = useState<T | null>(null)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(s)))
  }, [rows, q, searchKeys])

  const set = (k: keyof T, v: unknown) => setEditing((e) => (e ? { ...e, [k]: v } : e))

  async function submit() {
    if (!editing) return
    const missing = fields.find((f) => f.required && (editing[f.key] === '' || editing[f.key] === undefined || (Array.isArray(editing[f.key]) && (editing[f.key] as unknown[]).length === 0)))
    if (missing) return setError(`${missing.label} is required.`)
    await onSave(editing)
    setEditing(null)
  }

  const allCols = [
    ...columns,
    {
      header: '', className: 'w-24 text-right',
      cell: (r: T) => (
        <div className="flex justify-end gap-1">
          <button className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-700" title="Edit" onClick={(e) => { e.stopPropagation(); setIsNew(false); setError(''); setEditing(r) }}><Pencil size={15} /></button>
          {onDelete && <button className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete" onClick={(e) => { e.stopPropagation(); setConfirmDel(r) }}><Trash2 size={15} /></button>}
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} actions={<Button variant="accent" onClick={() => { setIsNew(true); setError(''); setEditing(blank()) }}><Plus size={16} />{newLabel}</Button>} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} />
        {filters}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} of {rows.length}</span>
      </div>
      <Table rows={filtered} cols={allCols} onRowClick={(r) => { setIsNew(false); setError(''); setEditing(r) }} />

      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? newLabel : `Edit ${title.replace(/s$/, '').toLowerCase()}`}
        footer={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={submit}>Save</Button></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            {fields.map((f) => {
              const v = editing[f.key] as unknown
              return (
                <div key={f.key} className={f.half ? 'col-span-1' : 'col-span-2'}>
                  {f.type !== 'toggle' && <label className="label">{f.label}{f.required && ' *'}</label>}
                  {f.type === 'textarea' ? (
                    <textarea className="input" rows={3} value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)} />
                  ) : f.type === 'select' ? (
                    <select className="input" value={String(v ?? '')} onChange={(e) => set(f.key, e.target.value)}>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === 'toggle' ? (
                    <Toggle checked={!!v} onChange={(b) => set(f.key, b)} label={f.label} />
                  ) : f.type === 'list' ? (
                    <textarea className="input" rows={3} placeholder="One per line" value={((v as string[]) ?? []).join('\n')}
                      onChange={(e) => set(f.key, e.target.value.split('\n'))} onBlur={(e) => set(f.key, e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} />
                  ) : (
                    <input className="input" type={f.type === 'number' ? 'number' : 'text'} placeholder={f.placeholder} value={String(v ?? '')}
                      onChange={(e) => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} />
                  )}
                </div>
              )
            })}
            {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
          </div>
        )}
      </Modal>

      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete this item?"
        footer={<><Button variant="outline" onClick={() => setConfirmDel(null)}>Cancel</Button><Button variant="danger" onClick={async () => { if (confirmDel && onDelete) await onDelete(confirmDel); setConfirmDel(null) }}>Delete</Button></>}>
        <p className="text-sm text-slate-600">This removes it from the platform. You can deactivate it instead if you may need it again.</p>
      </Modal>
    </>
  )
}
