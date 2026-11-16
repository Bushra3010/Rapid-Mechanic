import { useState } from 'react'
import { CrudPage, type Field } from '../../components/CrudPage'
import { Badge, Toggle } from '../../components/ui'
import { destroy, save } from '../../services/api'
import { inr, uid, vehicleLabel } from '../../lib/format'
import { useStore } from '../../store/useStore'
import type { AmcPlan, Product, RsaOffering, Seller, Service, Technician, VehicleType } from '../../types'

const vtOptions = [{ value: 'two_wheeler', label: 'Two-wheeler' }, { value: 'four_wheeler', label: 'Four-wheeler' }]
const active = <T extends { is_active: boolean }>(k: Parameters<typeof save>[0]) => ({
  header: 'Active', cell: (r: T) => <Toggle checked={r.is_active} onChange={(v) => save(k, { ...(r as object), is_active: v } as never)} />,
})
const now = () => new Date().toISOString()

function VehicleFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className="input max-w-[180px]" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">All vehicle types</option>{vtOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ---------------- Sellers ----------------
export function AdminSellers() {
  const rows = useStore((s) => s.sellers)
  const products = useStore((s) => s.products)
  const fields: Field<Seller>[] = [
    { key: 'store_name', label: 'Store name', required: true },
    { key: 'full_name', label: 'Owner name', required: true, half: true },
    { key: 'phone', label: 'Phone', required: true, half: true },
    { key: 'email', label: 'Email', required: true, half: true },
    { key: 'city', label: 'City', half: true },
    { key: 'gstin', label: 'GSTIN' },
    { key: 'verified', label: 'KYC verified', type: 'toggle', half: true },
    { key: 'is_active', label: 'Active', type: 'toggle', half: true },
  ]
  return (
    <CrudPage<Seller> title="Sellers" subtitle="Onboard and manage marketplace sellers." newLabel="Add seller" rows={rows} fields={fields}
      searchKeys={['store_name', 'full_name', 'city', 'email']}
      blank={() => ({ id: uid('sel'), full_name: '', phone: '', email: '', store_name: '', gstin: '', city: '', rating: 0, verified: false, is_active: true, created_at: now() })}
      onSave={(r) => save('sellers', r)} onDelete={(r) => destroy('sellers', r.id)}
      columns={[
        { header: 'Store', cell: (r) => <div><p className="font-medium">{r.store_name}</p><p className="text-xs text-slate-400">{r.full_name} · {r.city}</p></div> },
        { header: 'Contact', cell: (r) => <div className="text-xs"><p>{r.phone}</p><p className="text-slate-400">{r.email}</p></div> },
        { header: 'Products', cell: (r) => products.filter((p) => p.seller_id === r.id).length },
        { header: 'Rating', cell: (r) => (r.rating ? `★ ${r.rating}` : '—') },
        { header: 'KYC', cell: (r) => r.verified ? <Badge tone="green">Verified</Badge> : <Badge tone="amber">Pending</Badge> },
        active<Seller>('sellers'),
      ]} />
  )
}

// ---------------- Technicians ----------------
export function AdminTechnicians() {
  const rows = useStore((s) => s.technicians)
  const services = useStore((s) => s.services)
  const fields: Field<Technician>[] = [
    { key: 'full_name', label: 'Full name', required: true, half: true },
    { key: 'business_name', label: 'Garage / business name', half: true },
    { key: 'phone', label: 'Phone', required: true, half: true },
    { key: 'email', label: 'Email', required: true, half: true },
    { key: 'experience_years', label: 'Experience (years)', type: 'number', half: true },
    { key: 'verified', label: 'Verified', type: 'toggle', half: true },
    { key: 'is_active', label: 'Active', type: 'toggle', half: true },
  ]
  return (
    <CrudPage<Technician> title="Technicians" subtitle="Approve technicians and review the services and areas they cover." newLabel="Add technician" rows={rows} fields={fields}
      searchKeys={['full_name', 'business_name', 'phone']}
      blank={() => ({ id: uid('tec'), full_name: '', phone: '', email: '', business_name: '', rating: 0, experience_years: 0, verified: false, is_active: true, service_ids: [], service_areas: [], created_at: now() })}
      onSave={(r) => save('technicians', r)} onDelete={(r) => destroy('technicians', r.id)}
      columns={[
        { header: 'Technician', cell: (r) => <div><p className="font-medium">{r.full_name}</p><p className="text-xs text-slate-400">{r.business_name} · {r.experience_years} yrs</p></div> },
        { header: 'Services', cell: (r) => <span className="text-xs text-slate-600">{r.service_ids.map((id) => services.find((s) => s.id === id)?.name).filter(Boolean).join(', ') || '—'}</span>, className: 'max-w-xs' },
        { header: 'Areas', cell: (r) => <span className="text-xs">{r.service_areas.map((a) => `${a.city} (${a.radius_km} km)`).join(', ') || '—'}</span> },
        { header: 'Rating', cell: (r) => (r.rating ? `★ ${r.rating}` : '—') },
        { header: 'Status', cell: (r) => r.verified ? <Badge tone="green">Verified</Badge> : <Badge tone="amber">Pending</Badge> },
        active<Technician>('technicians'),
      ]} />
  )
}

// ---------------- Service listings ----------------
export function AdminServices() {
  const all = useStore((s) => s.services)
  const [vt, setVt] = useState('')
  const rows = all.filter((r) => !vt || r.vehicle_type === vt)
  const fields: Field<Service>[] = [
    { key: 'name', label: 'Service name', required: true },
    { key: 'vehicle_type', label: 'Vehicle type', type: 'select', options: vtOptions, half: true },
    { key: 'category', label: 'Category', type: 'select', options: [{ value: 'service', label: 'Service' }, { value: 'repair', label: 'Repair' }], half: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'base_price', label: 'Base price (₹)', type: 'number', required: true, half: true },
    { key: 'duration_mins', label: 'Duration (mins)', type: 'number', half: true },
    { key: 'is_active', label: 'Visible in app', type: 'toggle' },
  ]
  return (
    <CrudPage<Service> title="Service listings" subtitle="Two-wheeler and four-wheeler services & repairs customers can book." newLabel="Add service" rows={rows} fields={fields}
      searchKeys={['name', 'description']} filters={<VehicleFilter value={vt} onChange={setVt} />}
      blank={() => ({ id: uid('svc'), vehicle_type: 'two_wheeler', category: 'service', name: '', description: '', base_price: 0, duration_mins: 60, is_active: true })}
      onSave={(r) => save('services', r)} onDelete={(r) => destroy('services', r.id)}
      columns={[
        { header: 'Service', cell: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-slate-400">{r.description}</p></div>, className: 'max-w-sm' },
        { header: 'Vehicle', cell: (r) => <Badge tone="navy">{vehicleLabel[r.vehicle_type]}</Badge> },
        { header: 'Category', cell: (r) => <Badge tone={r.category === 'repair' ? 'orange' : 'blue'}>{r.category}</Badge> },
        { header: 'Price', cell: (r) => inr(r.base_price) },
        { header: 'Duration', cell: (r) => `${r.duration_mins} min` },
        active<Service>('services'),
      ]} />
  )
}

// ---------------- AMC plans ----------------
export function AdminAmc() {
  const rows = useStore((s) => s.amc_plans)
  const subs = useStore((s) => s.amc_subscriptions)
  const fields: Field<AmcPlan>[] = [
    { key: 'name', label: 'Plan name', required: true },
    { key: 'vehicle_type', label: 'Vehicle type', type: 'select', options: vtOptions, half: true },
    { key: 'price_per_year', label: 'Price per year (₹)', type: 'number', required: true, half: true },
    { key: 'visits_per_year', label: 'Visits per year', type: 'number', half: true },
    { key: 'is_active', label: 'Available for purchase', type: 'toggle', half: true },
    { key: 'covered_services', label: 'Covered services / benefits', type: 'list', required: true },
  ]
  return (
    <CrudPage<AmcPlan> title="AMC plans" subtitle="Yearly maintenance contracts. Final pricing & coverage to be agreed with the client before launch." newLabel="Add plan" rows={rows} fields={fields}
      searchKeys={['name']}
      blank={() => ({ id: uid('amc'), name: '', vehicle_type: 'two_wheeler', price_per_year: 0, covered_services: [], visits_per_year: 2, is_active: true })}
      onSave={(r) => save('amc_plans', r)} onDelete={(r) => destroy('amc_plans', r.id)}
      columns={[
        { header: 'Plan', cell: (r) => <p className="font-medium">{r.name}</p> },
        { header: 'Vehicle', cell: (r) => <Badge tone="navy">{vehicleLabel[r.vehicle_type]}</Badge> },
        { header: 'Covers', cell: (r) => <ul className="list-inside list-disc text-xs text-slate-600">{r.covered_services.map((c) => <li key={c}>{c}</li>)}</ul> },
        { header: 'Price / year', cell: (r) => inr(r.price_per_year) },
        { header: 'Subscribers', cell: (r) => subs.filter((s) => s.plan_id === r.id && s.status === 'active').length },
        active<AmcPlan>('amc_plans'),
      ]} />
  )
}

// ---------------- RSA offerings ----------------
export function AdminRsa() {
  const all = useStore((s) => s.rsa_offerings)
  const [vt, setVt] = useState('')
  const rows = all.filter((r) => !vt || r.vehicle_type === vt)
  const fields: Field<RsaOffering>[] = [
    { key: 'name', label: 'Assistance type', required: true },
    { key: 'vehicle_type', label: 'Vehicle type', type: 'select', options: vtOptions, half: true },
    { key: 'price', label: 'Price (₹)', type: 'number', required: true, half: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'is_active', label: 'Available in app', type: 'toggle' },
  ]
  return (
    <CrudPage<RsaOffering> title="RSA offerings" subtitle="Roadside assistance services customers can request from a map pin." newLabel="Add offering" rows={rows} fields={fields}
      searchKeys={['name', 'description']} filters={<VehicleFilter value={vt} onChange={setVt} />}
      blank={() => ({ id: uid('rsa'), name: '', vehicle_type: 'four_wheeler' as VehicleType, price: 0, description: '', is_active: true })}
      onSave={(r) => save('rsa_offerings', r)} onDelete={(r) => destroy('rsa_offerings', r.id)}
      columns={[
        { header: 'Offering', cell: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-slate-400">{r.description}</p></div> },
        { header: 'Vehicle', cell: (r) => <Badge tone="navy">{vehicleLabel[r.vehicle_type]}</Badge> },
        { header: 'Price', cell: (r) => inr(r.price) },
        active<RsaOffering>('rsa_offerings'),
      ]} />
  )
}

// ---------------- Products (shared with seller panel) ----------------
export const PRODUCT_CATEGORIES = ['Lubricants', 'Spare Parts', 'Batteries', 'Tyres', 'Accessories', 'Riding Gear', 'Lighting', 'Car Care']
export const productFields = (sellerOptions?: { value: string; label: string }[]): Field<Product>[] => [
  { key: 'name', label: 'Product name', required: true },
  ...(sellerOptions ? [{ key: 'seller_id' as const, label: 'Seller', type: 'select' as const, options: sellerOptions }] : []),
  { key: 'brand', label: 'Brand', half: true },
  { key: 'category', label: 'Category', type: 'select', options: PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c })), half: true },
  { key: 'compatible_vehicle_type', label: 'Fits', type: 'select', options: [...vtOptions, { value: 'both', label: 'All vehicles' }], half: true },
  { key: 'stock', label: 'Stock qty', type: 'number', half: true },
  { key: 'price', label: 'Selling price (₹)', type: 'number', required: true, half: true },
  { key: 'mrp', label: 'MRP (₹)', type: 'number', half: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'images', label: 'Image URLs', type: 'list' },
  { key: 'is_active', label: 'Listed in app', type: 'toggle' },
]
export const blankProduct = (seller_id: string): Product => ({
  id: uid('prd'), seller_id, name: '', category: 'Spare Parts', brand: '', description: '', price: 0, mrp: 0, stock: 0, images: [], compatible_vehicle_type: 'both', is_active: true,
})
export const stockBadge = (n: number) => n === 0 ? <Badge tone="red">Out of stock</Badge> : n <= 5 ? <Badge tone="amber">{n} left</Badge> : <span>{n}</span>

export function AdminProducts() {
  const all = useStore((s) => s.products)
  const sellers = useStore((s) => s.sellers)
  const [seller, setSeller] = useState('')
  const rows = all.filter((p) => !seller || p.seller_id === seller)
  return (
    <CrudPage<Product> title="Product listings" subtitle="Moderate products from every seller on the marketplace." newLabel="Add product" rows={rows}
      fields={productFields(sellers.map((s) => ({ value: s.id, label: s.store_name })))}
      searchKeys={['name', 'brand', 'category']}
      filters={<select className="input max-w-[200px]" value={seller} onChange={(e) => setSeller(e.target.value)}><option value="">All sellers</option>{sellers.map((s) => <option key={s.id} value={s.id}>{s.store_name}</option>)}</select>}
      blank={() => blankProduct(sellers[0]?.id ?? '')}
      onSave={(r) => save('products', r)} onDelete={(r) => destroy('products', r.id)}
      columns={[
        { header: 'Product', cell: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-slate-400">{r.brand} · {r.category}</p></div>, className: 'max-w-xs' },
        { header: 'Seller', cell: (r) => sellers.find((s) => s.id === r.seller_id)?.store_name ?? '—' },
        { header: 'Fits', cell: (r) => <span className="text-xs">{vehicleLabel[r.compatible_vehicle_type]}</span> },
        { header: 'Price', cell: (r) => <div>{inr(r.price)}{r.mrp > r.price && <span className="ml-1 text-xs text-slate-400 line-through">{inr(r.mrp)}</span>}</div> },
        { header: 'Stock', cell: (r) => stockBadge(r.stock) },
        active<Product>('products'),
      ]} />
  )
}
