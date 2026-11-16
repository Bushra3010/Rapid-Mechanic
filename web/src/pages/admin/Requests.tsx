import { useState } from 'react'
import { kindLabel, RequestDetail } from '../../components/details'
import { Badge, PageHeader, SearchInput, StatusBadge, Table, Tabs } from '../../components/ui'
import { dateTime, inr, vehicleLabel } from '../../lib/format'
import { useStore } from '../../store/useStore'
import type { JobStatus, ServiceRequest } from '../../types'

type Filter = 'all' | JobStatus
type Kind = 'all' | ServiceRequest['kind']

/** Used by admin (all jobs) and technician (own jobs). */
export function RequestsTable({ rows, actor }: { rows: ServiceRequest[]; actor: 'admin' | 'technician' }) {
  const db = useStore()
  const [status, setStatus] = useState<Filter>('all')
  const [kind, setKind] = useState<Kind>('all')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<ServiceRequest | null>(null)

  const nameOf = (r: ServiceRequest) => (r.kind === 'rsa' ? db.rsa_offerings.find((x) => x.id === r.rsa_offering_id)?.name : db.services.find((x) => x.id === r.service_id)?.name) ?? '—'
  const filtered = rows
    .filter((r) => status === 'all' || r.status === status)
    .filter((r) => kind === 'all' || r.kind === kind)
    .filter((r) => {
      const s = q.toLowerCase()
      const c = db.customers.find((x) => x.id === r.customer_id)
      return !s || [r.id, r.address, nameOf(r), c?.full_name].some((v) => v?.toLowerCase().includes(s))
    })
  const count = (s: Filter) => rows.filter((r) => s === 'all' || r.status === s).length

  return (
    <>
      <Tabs value={status} onChange={setStatus} options={(['all', 'submitted', 'assigned', 'in_progress', 'completed', 'cancelled'] as Filter[]).map((s) => ({
        value: s, count: count(s), label: { all: 'All', submitted: 'New', assigned: 'Assigned', in_progress: 'In progress', completed: 'Completed', cancelled: 'Cancelled' }[s],
      }))} />
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search ID, customer, address…" />
        <select className="input max-w-[200px]" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
          <option value="all">All types</option><option value="service">Service</option><option value="repair">Repair</option><option value="rsa">Roadside assistance</option>
        </select>
      </div>
      <Table rows={filtered} onRowClick={setSel} empty="No requests match these filters." cols={[
        { header: 'Request', cell: (r) => <div><p className="font-medium">{r.id}</p><p className="text-xs text-slate-400">{dateTime(r.created_at)}</p></div> },
        { header: 'Type', cell: (r) => <Badge tone={r.kind === 'rsa' ? 'red' : r.kind === 'repair' ? 'orange' : 'navy'}>{kindLabel[r.kind]}</Badge> },
        { header: 'Service', cell: (r) => { const v = db.vehicles.find((x) => x.id === r.vehicle_id); return <div><p>{nameOf(r)}</p><p className="text-xs text-slate-400">{v ? `${v.make} ${v.model} · ${vehicleLabel[v.type]}` : ''}</p></div> } },
        { header: 'Customer', cell: (r) => db.customers.find((c) => c.id === r.customer_id)?.full_name ?? '—' },
        { header: 'Technician', cell: (r) => db.technicians.find((t) => t.id === r.technician_id)?.full_name ?? <span className="text-slate-400">Unassigned</span> },
        { header: 'Amount', cell: (r) => inr(r.amount) },
        { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
      ]} />
      <RequestDetail request={sel} onClose={() => setSel(null)} actor={actor} />
    </>
  )
}

export default function AdminRequests() {
  const rows = useStore((s) => s.service_requests)
  return (
    <>
      <PageHeader title="Service requests" subtitle="Two-wheeler & four-wheeler service/repair jobs and roadside assistance requests." />
      <RequestsTable rows={rows} actor="admin" />
    </>
  )
}
