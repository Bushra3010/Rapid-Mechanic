import clsx from 'clsx'
import { X, Check } from 'lucide-react'
import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { dateTime, jobLabel, orderLabel } from '../lib/format'
import type { JobStatus, OrderStatus, StatusEvent } from '../types'

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger'
export function Button({ variant = 'primary', size = 'md', className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }) {
  return (
    <button
      {...p}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        {
          primary: 'bg-navy-700 text-white hover:bg-navy-800',
          accent: 'bg-brand-500 text-white hover:bg-brand-600',
          outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
          ghost: 'text-slate-600 hover:bg-slate-100',
          danger: 'bg-red-600 text-white hover:bg-red-700',
        }[variant],
        className,
      )}
    />
  )
}

export const Card = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={clsx('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>{children}</div>
)

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-navy-800">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        {icon && <div className="rounded-lg bg-brand-50 p-2 text-brand-500">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-semibold text-navy-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </Card>
  )
}

const tones = {
  gray: 'bg-slate-100 text-slate-700', blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700', red: 'bg-red-50 text-red-700', orange: 'bg-brand-50 text-brand-600', navy: 'bg-navy-50 text-navy-700',
}
export type Tone = keyof typeof tones
export const Badge = ({ tone = 'gray', children }: { tone?: Tone; children: ReactNode }) => (
  <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>
)

const statusTone: Record<string, Tone> = {
  submitted: 'amber', assigned: 'blue', in_progress: 'orange', completed: 'green', cancelled: 'red',
  placed: 'amber', dispatched: 'blue', in_transit: 'orange', delivered: 'green',
  paid: 'green', pending: 'amber', failed: 'red', refunded: 'gray',
}
export function StatusBadge({ status }: { status: string }) {
  const label = (jobLabel as Record<string, string>)[status] ?? (orderLabel as Record<string, string>)[status] ?? status
  return <Badge tone={statusTone[status] ?? 'gray'}>{label}</Badge>
}

export function Table<T>({ rows, cols, onRowClick, empty = 'Nothing here yet.' }: {
  rows: T[]; cols: { header: string; cell: (r: T) => ReactNode; className?: string }[]; onRowClick?: (r: T) => void; empty?: string
}) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>{cols.map((c) => <th key={c.header} className={clsx('px-4 py-3 font-medium', c.className)}>{c.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && <tr><td colSpan={cols.length} className="px-4 py-10 text-center text-slate-400">{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={i} onClick={() => onRowClick?.(r)} className={clsx(onRowClick && 'cursor-pointer hover:bg-slate-50')}>
              {cols.map((c) => <td key={c.header} className={clsx('px-4 py-3 align-middle', c.className)}>{c.cell(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-10" onMouseDown={onClose}>
      <div className={clsx('w-full rounded-xl bg-white shadow-xl', wide ? 'max-w-3xl' : 'max-w-lg')} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-navy-800">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onChange(!checked) }} className="inline-flex items-center gap-2 text-sm" aria-pressed={checked}>
      <span className={clsx('relative h-5 w-9 rounded-full transition', checked ? 'bg-emerald-500' : 'bg-slate-300')}>
        <span className={clsx('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', checked ? 'left-[18px]' : 'left-0.5')} />
      </span>
      {label}
    </button>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input className="input max-w-xs" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}

export function Tabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={clsx('rounded-md px-3 py-1.5 text-sm font-medium', value === o.value ? 'bg-white text-navy-800 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
          {o.label}{o.count !== undefined && <span className="ml-1.5 text-xs text-slate-400">{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

/** Tracking timeline used for both service jobs and product orders. */
export function Timeline<S extends string>({ flow, labels, current, history }: { flow: S[]; labels: Record<S, string>; current: S; history: StatusEvent<S>[] }) {
  const cancelled = current === 'cancelled'
  const idx = flow.indexOf(current)
  return (
    <ol className="space-y-4">
      {flow.map((s, i) => {
        const ev = [...history].reverse().find((h) => h.status === s)
        const done = !cancelled && i <= idx
        return (
          <li key={s} className="flex gap-3">
            <span className={clsx('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2', done ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 bg-white')}>
              {done && <Check size={14} />}
            </span>
            <div>
              <p className={clsx('text-sm font-medium', done ? 'text-navy-800' : 'text-slate-400')}>{labels[s]}</p>
              {ev && <p className="text-xs text-slate-400">{dateTime(ev.at)} · by {ev.by_role}{ev.note ? ` — ${ev.note}` : ''}</p>}
            </div>
          </li>
        )
      })}
      {cancelled && <li className="text-sm font-medium text-red-600">This was cancelled.</li>}
    </ol>
  )
}

export const jobTimeline = (cur: JobStatus, h: StatusEvent<JobStatus>[]) =>
  <Timeline flow={['submitted', 'assigned', 'in_progress', 'completed'] as JobStatus[]} labels={jobLabel} current={cur} history={h} />
export const orderTimeline = (cur: OrderStatus, h: StatusEvent<OrderStatus>[]) =>
  <Timeline flow={['placed', 'dispatched', 'in_transit', 'delivered'] as OrderStatus[]} labels={orderLabel} current={cur} history={h} />
