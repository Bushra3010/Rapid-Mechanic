import { useState } from 'react'
import { Button, Card, Modal, PageHeader, SearchInput, StatusBadge, Table, Toggle } from '../../components/ui'
import { saveSettings } from '../../services/api'
import { date, inr, vehicleLabel } from '../../lib/format'
import { useStore } from '../../store/useStore'
import type { PlatformSettings, Profile } from '../../types'

export function AdminCustomers() {
  const db = useStore()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Profile | null>(null)
  const rows = db.customers.filter((c) => !q || [c.full_name, c.phone, c.email].some((v) => v.toLowerCase().includes(q.toLowerCase())))
  return (
    <>
      <PageHeader title="Customers" subtitle="People using the Rapid Mechanic app." />
      <div className="mb-4"><SearchInput value={q} onChange={setQ} placeholder="Search name, phone, email…" /></div>
      <Table rows={rows} onRowClick={setSel} cols={[
        { header: 'Customer', cell: (c) => <div><p className="font-medium">{c.full_name}</p><p className="text-xs text-slate-400">{c.email}</p></div> },
        { header: 'Phone', cell: (c) => c.phone },
        { header: 'Vehicles', cell: (c) => db.vehicles.filter((v) => v.customer_id === c.id).length },
        { header: 'Requests', cell: (c) => db.service_requests.filter((r) => r.customer_id === c.id).length },
        { header: 'Orders', cell: (c) => db.orders.filter((o) => o.customer_id === c.id).length },
        { header: 'AMC', cell: (c) => db.amc_subscriptions.some((s) => s.customer_id === c.id && s.status === 'active') ? 'Active' : '—' },
        { header: 'Joined', cell: (c) => date(c.created_at) },
      ]} />
      {sel && (
        <Modal open onClose={() => setSel(null)} wide title={sel.full_name}>
          <p className="mb-4 text-sm text-slate-500">{sel.phone} · {sel.email}</p>
          <h3 className="mb-2 text-sm font-semibold text-navy-800">Vehicles</h3>
          <ul className="mb-4 space-y-1 text-sm">{db.vehicles.filter((v) => v.customer_id === sel.id).map((v) => <li key={v.id}>{v.make} {v.model} ({v.year}) · {vehicleLabel[v.type]} · <span className="text-slate-500">{v.reg_number}</span></li>)}</ul>
          <h3 className="mb-2 text-sm font-semibold text-navy-800">AMC subscriptions</h3>
          <ul className="mb-4 space-y-1 text-sm">
            {db.amc_subscriptions.filter((s) => s.customer_id === sel.id).map((s) => <li key={s.id}>{db.amc_plans.find((p) => p.id === s.plan_id)?.name} · valid till {date(s.end_date)} · <span className="capitalize">{s.status}</span></li>)}
            {!db.amc_subscriptions.some((s) => s.customer_id === sel.id) && <li className="text-slate-400">None</li>}
          </ul>
          <h3 className="mb-2 text-sm font-semibold text-navy-800">Recent activity</h3>
          <ul className="space-y-1.5 text-sm">
            {db.service_requests.filter((r) => r.customer_id === sel.id).map((r) => <li key={r.id} className="flex items-center gap-2">{r.id} · {inr(r.amount)} <StatusBadge status={r.status} /></li>)}
            {db.orders.filter((o) => o.customer_id === sel.id).map((o) => <li key={o.id} className="flex items-center gap-2">{o.id} · {inr(o.amount)} <StatusBadge status={o.status} /></li>)}
          </ul>
        </Modal>
      )}
    </>
  )
}

export function AdminSettings() {
  const settings = useStore((s) => s.settings)
  const resetDemo = useStore((s) => s.resetDemo)
  const [f, setF] = useState<PlatformSettings>(settings)
  const [saved, setSaved] = useState(false)
  const set = <K extends keyof PlatformSettings>(k: K, v: PlatformSettings[K]) => { setSaved(false); setF({ ...f, [k]: v }) }
  return (
    <>
      <PageHeader title="Platform settings" subtitle="Commercial and support settings applied across the app and panels." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <h2 className="font-semibold text-navy-800">Commercials</h2>
          <div><label className="label">Marketplace commission (%)</label><input className="input" type="number" value={f.commission_percent} onChange={(e) => set('commission_percent', +e.target.value)} /></div>
          <div><label className="label">GST on services (%)</label><input className="input" type="number" value={f.tax_percent} onChange={(e) => set('tax_percent', +e.target.value)} /></div>
          <div><label className="label">Default technician service radius (km)</label><input className="input" type="number" value={f.default_service_radius_km} onChange={(e) => set('default_service_radius_km', +e.target.value)} /></div>
        </Card>
        <Card className="space-y-4 p-5">
          <h2 className="font-semibold text-navy-800">Support &amp; features</h2>
          <div><label className="label">Support phone</label><input className="input" value={f.support_phone} onChange={(e) => set('support_phone', e.target.value)} /></div>
          <div><label className="label">Support email</label><input className="input" value={f.support_email} onChange={(e) => set('support_email', e.target.value)} /></div>
          <Toggle checked={f.rsa_enabled} onChange={(v) => set('rsa_enabled', v)} label="Roadside assistance enabled in app" />
          <Toggle checked={f.marketplace_enabled} onChange={(v) => set('marketplace_enabled', v)} label="Products marketplace enabled in app" />
        </Card>
        <Card className="space-y-2 p-5 lg:col-span-2">
          <h2 className="font-semibold text-navy-800">Integrations</h2>
          <p className="text-sm text-slate-500">Google Maps, payment gateway and delivery-tracking credentials will be configured here once merchant accounts and API keys are provided.</p>
        </Card>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={async () => { await saveSettings(f); setSaved(true) }}>Save settings</Button>
        {saved && <span className="text-sm text-emerald-600">Saved.</span>}
        <Button variant="ghost" className="ml-auto" onClick={() => { if (confirm('Reset all demo data to the original sample set?')) { resetDemo(); location.reload() } }}>Reset demo data</Button>
      </div>
    </>
  )
}
