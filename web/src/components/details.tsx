import { MapPin, Phone, Truck } from 'lucide-react'
import { useState } from 'react'
import { assignTechnician, updateJobStatus, updateOrderStatus } from '../services/api'
import { useStore } from '../store/useStore'
import { dateTime, inr, jobLabel, nextJob, nextOrder, orderLabel, vehicleLabel } from '../lib/format'
import type { Order, Role, ServiceRequest } from '../types'
import { Badge, Button, jobTimeline, Modal, orderTimeline, StatusBadge } from './ui'

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm"><span className="text-slate-500">{k}</span><span className="text-right font-medium text-slate-800">{v}</span></div>
)

export const kindLabel = { service: 'Service', repair: 'Repair', rsa: 'Roadside assistance' } as const

export function useRequestView(r: ServiceRequest) {
  const db = useStore()
  const customer = db.customers.find((c) => c.id === r.customer_id)
  const vehicle = db.vehicles.find((v) => v.id === r.vehicle_id)
  const item = r.kind === 'rsa' ? db.rsa_offerings.find((x) => x.id === r.rsa_offering_id)?.name : db.services.find((x) => x.id === r.service_id)?.name
  const tech = db.technicians.find((t) => t.id === r.technician_id)
  return { customer, vehicle, item: item ?? '—', tech }
}

/** Service / repair / RSA job detail. Admin can assign technicians; admin & technician can advance status. */
export function RequestDetail({ request, onClose, actor }: { request: ServiceRequest | null; onClose: () => void; actor: Role }) {
  const technicians = useStore((s) => s.technicians)
  const live = useStore((s) => s.service_requests.find((x) => x.id === request?.id))
  const [tech, setTech] = useState('')
  const [note, setNote] = useState('')
  if (!request || !live) return null
  return <RequestDetailInner r={live} onClose={onClose} actor={actor} technicians={technicians} tech={tech} setTech={setTech} note={note} setNote={setNote} />
}

function RequestDetailInner({ r, onClose, actor, technicians, tech, setTech, note, setNote }: {
  r: ServiceRequest; onClose: () => void; actor: Role; technicians: ReturnType<typeof useStore.getState>['technicians']
  tech: string; setTech: (s: string) => void; note: string; setNote: (s: string) => void
}) {
  const { customer, vehicle, item, tech: assigned } = useRequestView(r)
  const next = nextJob(r.status)
  const eligible = technicians.filter((t) => t.is_active && (r.kind === 'rsa' || !r.service_id || t.service_ids.includes(r.service_id)))
  const canAdvance = next && (actor === 'admin' || (actor === 'technician' && r.status !== 'submitted'))
  const isOpen = r.status !== 'completed' && r.status !== 'cancelled'

  return (
    <Modal open onClose={onClose} wide title={`${r.id} · ${kindLabel[r.kind]}`}>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2"><StatusBadge status={r.status} /><StatusBadge status={r.payment_status} /></div>
          <Row k="Service" v={item} />
          <Row k="Amount" v={inr(r.amount)} />
          <Row k="Scheduled" v={dateTime(r.scheduled_at)} />
          <Row k="Vehicle" v={vehicle ? `${vehicle.make} ${vehicle.model} (${vehicleLabel[vehicle.type]})` : '—'} />
          <Row k="Reg. no." v={vehicle?.reg_number ?? '—'} />
          <Row k="Customer" v={customer?.full_name ?? '—'} />
          <Row k="Phone" v={customer?.phone ?? '—'} />
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
            <p className="flex items-start gap-2 text-slate-700"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-500" />{r.address}</p>
            <a className="mt-1 inline-block text-xs text-navy-500 underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}>Open in Google Maps ({r.lat.toFixed(3)}, {r.lng.toFixed(3)})</a>
          </div>
          {r.notes && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">“{r.notes}”</p>}
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-navy-800">Job tracking</h3>
          {jobTimeline(r.status, r.status_history)}

          <div className="mt-5 rounded-lg border border-slate-200 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Technician</p>
            {assigned ? (
              <div className="text-sm">
                <p className="font-medium">{assigned.full_name} <span className="text-slate-400">· {assigned.business_name}</span></p>
                <p className="flex items-center gap-1 text-slate-500"><Phone size={13} />{assigned.phone} · ★ {assigned.rating}</p>
              </div>
            ) : <p className="text-sm text-slate-400">Not assigned yet</p>}
            {actor === 'admin' && isOpen && (
              <div className="mt-3 flex gap-2">
                <select className="input" value={tech} onChange={(e) => setTech(e.target.value)}>
                  <option value="">{assigned ? 'Reassign to…' : 'Choose technician…'}</option>
                  {eligible.map((t) => <option key={t.id} value={t.id}>{t.full_name} — {t.service_areas.map((a) => a.city).join(', ')}{t.verified ? '' : ' (unverified)'}</option>)}
                </select>
                <Button disabled={!tech} onClick={async () => { await assignTechnician(r.id, tech); setTech('') }}>Assign</Button>
              </div>
            )}
          </div>

          {isOpen && (canAdvance || actor === 'admin') && (
            <div className="mt-4 space-y-2">
              <input className="input" placeholder="Optional note for the customer" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                {canAdvance && next && (next !== 'assigned' || r.technician_id) && (
                  <Button variant="accent" onClick={async () => { await updateJobStatus(r.id, next, actor, note || undefined); setNote('') }}>Mark as “{jobLabel[next]}”</Button>
                )}
                {actor === 'admin' && <Button variant="outline" onClick={() => updateJobStatus(r.id, 'cancelled', actor, note || undefined)}>Cancel request</Button>}
              </div>
              {actor === 'admin' && r.status === 'submitted' && !r.technician_id && <p className="text-xs text-slate-400">Assign a technician to move this job forward.</p>}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

/** Product order detail. Admin and the seller can advance fulfilment status and add courier details. */
export function OrderDetail({ order, onClose, actor, sellerId }: { order: Order | null; onClose: () => void; actor: Role; sellerId?: string }) {
  const db = useStore()
  const o = db.orders.find((x) => x.id === order?.id)
  const [courier, setCourier] = useState('')
  const [awb, setAwb] = useState('')
  if (!o) return null
  const customer = db.customers.find((c) => c.id === o.customer_id)
  const items = o.items.filter((i) => !sellerId || i.seller_id === sellerId)
  const next = nextOrder(o.status)
  const needsTracking = next === 'dispatched' && !o.tracking
  return (
    <Modal open onClose={onClose} wide title={`Order ${o.id}`}>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-3 flex gap-2"><StatusBadge status={o.status} /><StatusBadge status={o.payment_status} /></div>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {items.map((i) => {
              const p = db.products.find((x) => x.id === i.product_id)
              const s = db.sellers.find((x) => x.id === i.seller_id)
              return (
                <div key={i.product_id} className="flex justify-between gap-3 p-3 text-sm">
                  <div><p className="font-medium">{p?.name ?? i.product_id}</p><p className="text-xs text-slate-400">{s?.store_name} · Qty {i.qty}</p></div>
                  <p className="font-medium">{inr(i.price * i.qty)}</p>
                </div>
              )
            })}
          </div>
          <Row k={sellerId ? 'Your items total' : 'Order total'} v={inr(items.reduce((a, i) => a + i.price * i.qty, 0))} />
          <Row k="Customer" v={customer?.full_name ?? '—'} />
          <Row k="Phone" v={customer?.phone ?? '—'} />
          <Row k="Placed" v={dateTime(o.created_at)} />
          <p className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-500" />{o.shipping_address}</p>
          {o.tracking && <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Truck size={16} className="text-navy-500" />{o.tracking.courier} · AWB <Badge tone="navy">{o.tracking.awb}</Badge></p>}
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-navy-800">Delivery tracking</h3>
          {orderTimeline(o.status, o.status_history)}
          {next && o.status !== 'cancelled' && (
            <div className="mt-5 space-y-2 rounded-lg border border-slate-200 p-3">
              {needsTracking && (
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" placeholder="Courier (e.g. Delhivery)" value={courier} onChange={(e) => setCourier(e.target.value)} />
                  <input className="input" placeholder="AWB / tracking no." value={awb} onChange={(e) => setAwb(e.target.value)} />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="accent" disabled={needsTracking && (!courier || !awb)}
                  onClick={() => updateOrderStatus(o.id, next, actor, needsTracking ? { courier, awb } : undefined)}>Mark as “{orderLabel[next]}”</Button>
                {actor === 'admin' && <Button variant="outline" onClick={() => updateOrderStatus(o.id, 'cancelled', actor)}>Cancel order</Button>}
              </div>
              <p className="text-xs text-slate-400">Courier GPS / provider webhooks will update this automatically once a delivery partner is agreed.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
