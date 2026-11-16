import { ClipboardList, IndianRupee, LifeBuoy, ShieldCheck, ShoppingBag, Wrench } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { kindLabel, OrderDetail, RequestDetail, useRequestView } from '../../components/details'
import { Card, PageHeader, StatCard, StatusBadge } from '../../components/ui'
import { dateTime, inr } from '../../lib/format'
import { useStore } from '../../store/useStore'
import type { Order, ServiceRequest } from '../../types'

function ReqRow({ r, onOpen }: { r: ServiceRequest; onOpen: () => void }) {
  const { customer, item } = useRequestView(r)
  return (
    <button onClick={onOpen} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-slate-50">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{item} <span className="text-slate-400">· {kindLabel[r.kind]}</span></p>
        <p className="text-xs text-slate-400">{r.id} · {customer?.full_name} · {dateTime(r.created_at)}</p>
      </div>
      <StatusBadge status={r.status} />
    </button>
  )
}

export default function AdminDashboard() {
  const db = useStore()
  const [req, setReq] = useState<ServiceRequest | null>(null)
  const [ord, setOrd] = useState<Order | null>(null)
  const open = db.service_requests.filter((r) => !['completed', 'cancelled'].includes(r.status))
  const unassigned = open.filter((r) => !r.technician_id)
  const rsaOpen = open.filter((r) => r.kind === 'rsa')
  const revenue = db.service_requests.filter((r) => r.payment_status === 'paid').reduce((a, r) => a + r.amount, 0)
    + db.orders.filter((o) => o.payment_status === 'paid').reduce((a, o) => a + o.amount, 0)
    + db.amc_subscriptions.reduce((a, s) => a + (db.amc_plans.find((p) => p.id === s.plan_id)?.price_per_year ?? 0), 0)
  const pendingOrders = db.orders.filter((o) => !['delivered', 'cancelled'].includes(o.status))
  const lowStock = db.products.filter((p) => p.is_active && p.stock <= 5)

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Platform overview across services, roadside assistance, AMC and marketplace." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Open service jobs" value={open.length} hint={`${unassigned.length} waiting for a technician`} icon={<ClipboardList size={18} />} />
        <StatCard label="Active roadside requests" value={rsaOpen.length} hint="Respond to these first" icon={<LifeBuoy size={18} />} />
        <StatCard label="Orders in fulfilment" value={pendingOrders.length} hint={`${lowStock.length} products low on stock`} icon={<ShoppingBag size={18} />} />
        <StatCard label="Active AMC subscriptions" value={db.amc_subscriptions.filter((s) => s.status === 'active').length} icon={<ShieldCheck size={18} />} />
        <StatCard label="Active technicians" value={db.technicians.filter((t) => t.is_active).length} hint={`${db.technicians.filter((t) => !t.verified).length} pending verification`} icon={<Wrench size={18} />} />
        <StatCard label="Gross collections (demo)" value={inr(revenue)} hint="Services + RSA + AMC + products" icon={<IndianRupee size={18} />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-navy-800">Needs attention</h2>
            <Link to="/admin/requests" className="text-sm text-brand-500 hover:underline">All requests</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {open.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">All caught up.</p>}
            {[...open].sort((a, b) => (a.kind === 'rsa' ? -1 : 0) - (b.kind === 'rsa' ? -1 : 0)).slice(0, 6).map((r) => <ReqRow key={r.id} r={r} onOpen={() => setReq(r)} />)}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-navy-800">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm text-brand-500 hover:underline">All orders</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {db.orders.slice(0, 6).map((o) => (
              <button key={o.id} onClick={() => setOrd(o)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium">{o.id} · {inr(o.amount)}</p>
                  <p className="text-xs text-slate-400">{db.customers.find((c) => c.id === o.customer_id)?.full_name} · {o.items.length} item(s) · {dateTime(o.created_at)}</p>
                </div>
                <StatusBadge status={o.status} />
              </button>
            ))}
          </div>
        </Card>
      </div>
      <RequestDetail request={req} onClose={() => setReq(null)} actor="admin" />
      <OrderDetail order={ord} onClose={() => setOrd(null)} actor="admin" />
    </>
  )
}
