import { useState } from 'react'
import { OrderDetail } from '../../components/details'
import { PageHeader, SearchInput, StatusBadge, Table, Tabs } from '../../components/ui'
import { dateTime, inr } from '../../lib/format'
import { useStore } from '../../store/useStore'
import type { Order, OrderStatus } from '../../types'

type Filter = 'all' | OrderStatus

/** Used by admin (all orders) and seller (orders containing their items). */
export function OrdersTable({ rows, actor, sellerId }: { rows: Order[]; actor: 'admin' | 'seller'; sellerId?: string }) {
  const db = useStore()
  const [status, setStatus] = useState<Filter>('all')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Order | null>(null)
  const mine = (o: Order) => o.items.filter((i) => !sellerId || i.seller_id === sellerId)
  const filtered = rows.filter((o) => status === 'all' || o.status === status).filter((o) => {
    const s = q.toLowerCase()
    return !s || [o.id, o.shipping_address, db.customers.find((c) => c.id === o.customer_id)?.full_name].some((v) => v?.toLowerCase().includes(s))
  })
  return (
    <>
      <Tabs value={status} onChange={setStatus} options={(['all', 'placed', 'dispatched', 'in_transit', 'delivered', 'cancelled'] as Filter[]).map((s) => ({
        value: s, count: rows.filter((o) => s === 'all' || o.status === s).length,
        label: { all: 'All', placed: 'New', dispatched: 'Dispatched', in_transit: 'In transit', delivered: 'Delivered', cancelled: 'Cancelled' }[s],
      }))} />
      <div className="mb-4"><SearchInput value={q} onChange={setQ} placeholder="Search order ID, customer…" /></div>
      <Table rows={filtered} onRowClick={setSel} empty="No orders here." cols={[
        { header: 'Order', cell: (o) => <div><p className="font-medium">{o.id}</p><p className="text-xs text-slate-400">{dateTime(o.created_at)}</p></div> },
        { header: 'Customer', cell: (o) => db.customers.find((c) => c.id === o.customer_id)?.full_name ?? '—' },
        { header: 'Items', cell: (o) => <span className="text-slate-600">{mine(o).map((i) => db.products.find((p) => p.id === i.product_id)?.name).join(', ')}</span>, className: 'max-w-xs' },
        ...(sellerId ? [] : [{ header: 'Sellers', cell: (o: Order) => [...new Set(o.items.map((i) => db.sellers.find((s) => s.id === i.seller_id)?.store_name))].join(', ') }]),
        { header: 'Amount', cell: (o) => inr(mine(o).reduce((a, i) => a + i.price * i.qty, 0)) },
        { header: 'Courier', cell: (o) => o.tracking ? `${o.tracking.courier}` : <span className="text-slate-400">—</span> },
        { header: 'Status', cell: (o) => <StatusBadge status={o.status} /> },
      ]} />
      <OrderDetail order={sel} onClose={() => setSel(null)} actor={actor} sellerId={sellerId} />
    </>
  )
}

export default function AdminOrders() {
  const rows = useStore((s) => s.orders)
  return (
    <>
      <PageHeader title="Product orders" subtitle="Marketplace orders across all sellers." />
      <OrdersTable rows={rows} actor="admin" />
    </>
  )
}
