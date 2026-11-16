import { AlertTriangle, IndianRupee, Package, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CrudPage } from '../../components/CrudPage'
import { Button, Card, PageHeader, StatCard, StatusBadge, Table, Toggle } from '../../components/ui'
import { save } from '../../services/api'
import { inr, vehicleLabel } from '../../lib/format'
import { useStore } from '../../store/useStore'
import type { Product } from '../../types'
import { blankProduct, productFields, stockBadge } from '../admin/Catalog'
import { OrdersTable } from '../admin/Orders'
import { destroy } from '../../services/api'

const useSellerId = () => useStore((s) => s.session?.user_id ?? '')

export function SellerDashboard() {
  const id = useSellerId()
  const db = useStore()
  const seller = db.sellers.find((s) => s.id === id)
  const products = db.products.filter((p) => p.seller_id === id)
  const orders = db.orders.filter((o) => o.items.some((i) => i.seller_id === id))
  const pending = orders.filter((o) => o.status === 'placed')
  const sales = orders.filter((o) => o.status !== 'cancelled').reduce((a, o) => a + o.items.filter((i) => i.seller_id === id).reduce((x, i) => x + i.price * i.qty, 0), 0)
  const low = products.filter((p) => p.stock <= 5)
  return (
    <>
      <PageHeader title={`Welcome, ${seller?.store_name ?? 'Seller'}`} subtitle="Your store at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New orders to dispatch" value={pending.length} icon={<ShoppingBag size={18} />} />
        <StatCard label="Listed products" value={products.filter((p) => p.is_active).length} hint={`${products.length} total`} icon={<Package size={18} />} />
        <StatCard label="Low / out of stock" value={low.length} icon={<AlertTriangle size={18} />} />
        <StatCard label="Sales (all time)" value={inr(sales)} hint={`Platform commission ${db.settings.commission_percent}%`} icon={<IndianRupee size={18} />} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-navy-800">Orders to process</h2><Link to="/seller/orders" className="text-sm text-brand-500 hover:underline">All orders</Link></div>
          <div className="divide-y divide-slate-100">
            {orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3 text-sm"><span>{o.id} · {o.items.filter((i) => i.seller_id === id).length} item(s)</span><StatusBadge status={o.status} /></div>
            ))}
            {!orders.some((o) => !['delivered', 'cancelled'].includes(o.status)) && <p className="px-5 py-8 text-center text-sm text-slate-400">No open orders.</p>}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-navy-800">Stock alerts</h2><Link to="/seller/inventory" className="text-sm text-brand-500 hover:underline">Inventory</Link></div>
          <div className="divide-y divide-slate-100">
            {low.map((p) => <div key={p.id} className="flex items-center justify-between px-5 py-3 text-sm"><span>{p.name}</span>{stockBadge(p.stock)}</div>)}
            {low.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">Stock levels look healthy.</p>}
          </div>
        </Card>
      </div>
    </>
  )
}

export function SellerProducts() {
  const id = useSellerId()
  const rows = useStore((s) => s.products).filter((p) => p.seller_id === id)
  return (
    <CrudPage<Product> title="My products" subtitle="Create and edit the products you sell on Rapid Mechanic." newLabel="Add product" rows={rows}
      fields={productFields()} searchKeys={['name', 'brand', 'category']} blank={() => blankProduct(id)}
      onSave={(r) => save('products', { ...r, seller_id: id })} onDelete={(r) => destroy('products', r.id)}
      columns={[
        { header: 'Product', cell: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-slate-400">{r.brand} · {r.category}</p></div>, className: 'max-w-xs' },
        { header: 'Fits', cell: (r) => <span className="text-xs">{vehicleLabel[r.compatible_vehicle_type]}</span> },
        { header: 'Price', cell: (r) => <div>{inr(r.price)}{r.mrp > r.price && <span className="ml-1 text-xs text-slate-400 line-through">{inr(r.mrp)}</span>}</div> },
        { header: 'Stock', cell: (r) => stockBadge(r.stock) },
        { header: 'Listed', cell: (r) => <Toggle checked={r.is_active} onChange={(v) => save('products', { ...r, is_active: v })} /> },
      ]} />
  )
}

export function SellerInventory() {
  const id = useSellerId()
  const rows = useStore((s) => s.products).filter((p) => p.seller_id === id)
  const [draft, setDraft] = useState<Record<string, number>>({})
  const changed = Object.keys(draft).filter((k) => draft[k] !== rows.find((r) => r.id === k)?.stock)
  return (
    <>
      <PageHeader title="Inventory" subtitle="Update stock levels quickly. Products at 0 stock show as out of stock in the app."
        actions={<Button disabled={!changed.length} onClick={async () => { for (const k of changed) { const p = rows.find((r) => r.id === k)!; await save('products', { ...p, stock: Math.max(0, draft[k]) }) } setDraft({}) }}>Save {changed.length || ''} change{changed.length === 1 ? '' : 's'}</Button>} />
      <Table rows={rows} cols={[
        { header: 'Product', cell: (r) => <p className="font-medium">{r.name}</p> },
        { header: 'Category', cell: (r) => r.category },
        { header: 'Status', cell: (r) => stockBadge(draft[r.id] ?? r.stock) },
        { header: 'Stock qty', className: 'w-48', cell: (r) => {
          const v = draft[r.id] ?? r.stock
          return (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={() => setDraft({ ...draft, [r.id]: Math.max(0, v - 1) })}>−</Button>
              <input className="input w-20 text-center" type="number" min={0} value={v} onChange={(e) => setDraft({ ...draft, [r.id]: +e.target.value })} />
              <Button size="sm" variant="outline" onClick={() => setDraft({ ...draft, [r.id]: v + 1 })}>+</Button>
            </div>
          )
        } },
      ]} />
    </>
  )
}

export function SellerOrders() {
  const id = useSellerId()
  const rows = useStore((s) => s.orders).filter((o) => o.items.some((i) => i.seller_id === id))
  return (
    <>
      <PageHeader title="Orders" subtitle="Review incoming orders and update fulfilment status. Customers see each update in the app." />
      <OrdersTable rows={rows} actor="seller" sellerId={id} />
    </>
  )
}
