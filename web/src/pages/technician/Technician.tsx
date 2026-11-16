import { CheckCircle2, ClipboardList, MapPin, Star, Trash2, Wrench } from 'lucide-react'
import { useState } from 'react'
import { kindLabel, RequestDetail, useRequestView } from '../../components/details'
import { Badge, Button, Card, PageHeader, StatCard, StatusBadge, Toggle } from '../../components/ui'
import { save } from '../../services/api'
import { dateTime, inr, vehicleLabel } from '../../lib/format'
import { useStore } from '../../store/useStore'
import type { ServiceArea, ServiceRequest, Technician } from '../../types'
import { RequestsTable } from '../admin/Requests'

const useTech = () => {
  const id = useStore((s) => s.session?.user_id)
  return useStore((s) => s.technicians.find((t) => t.id === id))
}

function JobCard({ r, onOpen }: { r: ServiceRequest; onOpen: () => void }) {
  const { item, customer, vehicle } = useRequestView(r)
  return (
    <button onClick={onOpen} className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-brand-400">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-navy-800">{item}</p>
          <p className="text-xs text-slate-400">{r.id} · {kindLabel[r.kind]}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-sm text-slate-600"><MapPin size={15} className="mt-0.5 shrink-0 text-brand-500" />{r.address}</p>
      <p className="mt-1 text-xs text-slate-500">{customer?.full_name} · {vehicle?.make} {vehicle?.model} · {dateTime(r.scheduled_at)}</p>
    </button>
  )
}

export function TechDashboard() {
  const t = useTech()
  const jobs = useStore((s) => s.service_requests).filter((r) => r.technician_id === t?.id)
  const [sel, setSel] = useState<ServiceRequest | null>(null)
  if (!t) return null
  const active = jobs.filter((j) => ['assigned', 'in_progress'].includes(j.status))
  const done = jobs.filter((j) => j.status === 'completed')
  return (
    <>
      <PageHeader title={`Hello, ${t.full_name.split(' ')[0]}`} subtitle={t.business_name}
        actions={<Toggle checked={t.is_active} onChange={(v) => save('technicians', { ...t, is_active: v })} label={t.is_active ? 'Available for jobs' : 'Offline'} />} />
      {!t.verified && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Your profile is awaiting verification by the Rapid Mechanic team.</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active jobs" value={active.length} icon={<ClipboardList size={18} />} />
        <StatCard label="Completed jobs" value={done.length} icon={<CheckCircle2 size={18} />} />
        <StatCard label="Earnings (demo)" value={inr(done.reduce((a, j) => a + j.amount, 0))} icon={<Wrench size={18} />} />
        <StatCard label="Rating" value={`★ ${t.rating || '—'}`} icon={<Star size={18} />} />
      </div>
      <h2 className="mb-3 mt-8 font-semibold text-navy-800">Today’s active jobs</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {active.map((j) => <JobCard key={j.id} r={j} onOpen={() => setSel(j)} />)}
        {active.length === 0 && <Card className="p-8 text-center text-sm text-slate-400 md:col-span-2 xl:col-span-3">No active jobs right now. New jobs are assigned by the Rapid Mechanic team.</Card>}
      </div>
      <RequestDetail request={sel} onClose={() => setSel(null)} actor="technician" />
    </>
  )
}

export function TechJobs() {
  const t = useTech()
  const rows = useStore((s) => s.service_requests).filter((r) => r.technician_id === t?.id)
  return (
    <>
      <PageHeader title="My jobs" subtitle="Service, repair and roadside jobs assigned to you. Update the status as you work — the customer sees it live." />
      <RequestsTable rows={rows} actor="technician" />
    </>
  )
}

export function TechServices() {
  const t = useTech()
  const services = useStore((s) => s.services).filter((s) => s.is_active)
  if (!t) return null
  const toggle = (id: string) => save('technicians', { ...t, service_ids: t.service_ids.includes(id) ? t.service_ids.filter((x) => x !== id) : [...t.service_ids, id] })
  return (
    <>
      <PageHeader title="Offered services" subtitle="Choose the services you can perform. You'll only be assigned jobs for these." />
      {(['two_wheeler', 'four_wheeler'] as const).map((vt) => (
        <div key={vt} className="mb-6">
          <h2 className="mb-3 font-semibold text-navy-800">{vehicleLabel[vt]}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {services.filter((s) => s.vehicle_type === vt).map((s) => {
              const on = t.service_ids.includes(s.id)
              return (
                <Card key={s.id} className={on ? 'border-brand-400 p-4' : 'p-4'}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{s.name} <Badge tone={s.category === 'repair' ? 'orange' : 'blue'}>{s.category}</Badge></p>
                      <p className="mt-1 text-xs text-slate-500">{s.description}</p>
                      <p className="mt-1 text-xs text-slate-400">{inr(s.base_price)} · {s.duration_mins} min</p>
                    </div>
                    <Toggle checked={on} onChange={() => toggle(s.id)} />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}

export function TechAreas() {
  const t = useTech()
  const radius = useStore((s) => s.settings.default_service_radius_km)
  const [a, setA] = useState<ServiceArea>({ city: '', pincode: '', radius_km: radius })
  const [err, setErr] = useState('')
  if (!t) return null
  const add = async () => {
    if (!a.city || !/^\d{6}$/.test(a.pincode)) return setErr('Enter a city and a 6-digit pincode.')
    setErr(''); await save('technicians', { ...t, service_areas: [...t.service_areas, a] }); setA({ city: '', pincode: '', radius_km: radius })
  }
  return (
    <>
      <PageHeader title="Service areas" subtitle="Where you can travel for service, repair and roadside jobs." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h2 className="mb-3 font-semibold text-navy-800">Add an area</h2>
          <div className="space-y-3">
            <div><label className="label">City / locality</label><input className="input" value={a.city} onChange={(e) => setA({ ...a, city: e.target.value })} /></div>
            <div><label className="label">Pincode</label><input className="input" inputMode="numeric" maxLength={6} value={a.pincode} onChange={(e) => setA({ ...a, pincode: e.target.value.replace(/\D/g, '') })} /></div>
            <div><label className="label">Radius: {a.radius_km} km</label><input type="range" min={2} max={40} className="w-full accent-brand-500" value={a.radius_km} onChange={(e) => setA({ ...a, radius_km: +e.target.value })} /></div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <Button className="w-full" onClick={add}>Add area</Button>
            <p className="text-xs text-slate-400">Map-based area drawing will use Google Maps once the API key is configured.</p>
          </div>
        </Card>
        <div className="space-y-3 lg:col-span-2">
          {t.service_areas.map((s, i) => (
            <Card key={i} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-50 p-2 text-brand-500"><MapPin size={18} /></div>
                <div><p className="font-medium">{s.city}</p><p className="text-xs text-slate-400">{s.pincode} · within {s.radius_km} km</p></div>
              </div>
              <button className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => save('technicians', { ...t, service_areas: t.service_areas.filter((_, j) => j !== i) })} aria-label="Remove"><Trash2 size={16} /></button>
            </Card>
          ))}
          {t.service_areas.length === 0 && <Card className="p-8 text-center text-sm text-slate-400">No areas yet — add one to start receiving jobs.</Card>}
        </div>
      </div>
    </>
  )
}

export function TechProfile() {
  const t = useTech()
  const [f, setF] = useState<Technician | undefined>(t)
  const [saved, setSaved] = useState(false)
  if (!f) return null
  const field = (k: 'full_name' | 'business_name' | 'phone' | 'email', label: string) => (
    <div><label className="label">{label}</label><input className="input" value={f[k]} onChange={(e) => { setSaved(false); setF({ ...f, [k]: e.target.value }) }} /></div>
  )
  return (
    <>
      <PageHeader title="Profile" subtitle="Customers see your name, business and rating when a job is assigned." />
      <Card className="max-w-2xl space-y-4 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-700 text-lg font-semibold text-white">{f.full_name.split(' ').map((p) => p[0]).join('').slice(0, 2)}</div>
          <div><p className="font-medium">{f.full_name}</p><p className="text-sm text-slate-500">★ {f.rating || '—'} · {f.verified ? 'Verified' : 'Verification pending'}</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('full_name', 'Full name')}{field('business_name', 'Garage / business name')}{field('phone', 'Phone')}{field('email', 'Email')}
          <div><label className="label">Experience (years)</label><input className="input" type="number" value={f.experience_years} onChange={(e) => { setSaved(false); setF({ ...f, experience_years: +e.target.value }) }} /></div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={async () => { await save('technicians', f); setSaved(true) }}>Save profile</Button>
          {saved && <span className="text-sm text-emerald-600">Saved.</span>}
        </div>
      </Card>
    </>
  )
}
