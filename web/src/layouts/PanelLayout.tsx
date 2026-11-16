import clsx from 'clsx'
import {
  BadgeIndianRupee, Bike, Boxes, ClipboardList, LayoutDashboard, LifeBuoy, LogOut, MapPin, Menu,
  Package, Settings, ShieldCheck, ShoppingBag, Store, User, Users, Wrench, X,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from '../services/api'
import { useStore, type Session } from '../store/useStore'

type NavItem = { to: string; label: string; icon: ReactNode; end?: boolean }
const I = 18
const NAV: Record<Session['role'], NavItem[]> = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={I} />, end: true },
    { to: '/admin/requests', label: 'Service requests', icon: <ClipboardList size={I} /> },
    { to: '/admin/orders', label: 'Product orders', icon: <ShoppingBag size={I} /> },
    { to: '/admin/technicians', label: 'Technicians', icon: <Wrench size={I} /> },
    { to: '/admin/sellers', label: 'Sellers', icon: <Store size={I} /> },
    { to: '/admin/services', label: 'Service listings', icon: <Bike size={I} /> },
    { to: '/admin/amc', label: 'AMC plans', icon: <ShieldCheck size={I} /> },
    { to: '/admin/rsa', label: 'RSA offerings', icon: <LifeBuoy size={I} /> },
    { to: '/admin/products', label: 'Product listings', icon: <Package size={I} /> },
    { to: '/admin/customers', label: 'Customers', icon: <Users size={I} /> },
    { to: '/admin/settings', label: 'Platform settings', icon: <Settings size={I} /> },
  ],
  seller: [
    { to: '/seller', label: 'Dashboard', icon: <LayoutDashboard size={I} />, end: true },
    { to: '/seller/products', label: 'My products', icon: <Package size={I} /> },
    { to: '/seller/inventory', label: 'Inventory', icon: <Boxes size={I} /> },
    { to: '/seller/orders', label: 'Orders', icon: <ShoppingBag size={I} /> },
  ],
  technician: [
    { to: '/technician', label: 'Dashboard', icon: <LayoutDashboard size={I} />, end: true },
    { to: '/technician/jobs', label: 'My jobs', icon: <ClipboardList size={I} /> },
    { to: '/technician/services', label: 'Offered services', icon: <BadgeIndianRupee size={I} /> },
    { to: '/technician/areas', label: 'Service areas', icon: <MapPin size={I} /> },
    { to: '/technician/profile', label: 'Profile', icon: <User size={I} /> },
  ],
}
const TITLE: Record<Session['role'], string> = { admin: 'Admin Console', seller: 'Seller Panel', technician: 'Technician Panel' }

export default function PanelLayout({ role }: { role: Session['role'] }) {
  const session = useStore((s) => s.session)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  if (!session) return <Navigate to="/login" replace />
  if (session.role !== role) return <Navigate to={`/${session.role}`} replace />

  const sidebar = (
    <div className="flex h-full flex-col bg-navy-800 text-navy-100">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src="/logo.png" alt="" className="h-9 w-9 rounded-lg bg-white p-0.5" />
        <div>
          <p className="text-sm font-semibold text-white">Rapid Mechanic</p>
          <p className="text-[11px] uppercase tracking-wider text-brand-400">{TITLE[role]}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV[role].map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
            className={({ isActive }) => clsx('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
              isActive ? 'bg-brand-500 text-white' : 'text-navy-100 hover:bg-navy-700 hover:text-white')}>
            {n.icon}{n.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-navy-700 p-3">
        <div className="mb-2 px-3 text-xs">
          <p className="font-medium text-white">{session.name}</p>
          <p className="capitalize text-navy-200">{role}</p>
        </div>
        <button onClick={async () => { await signOut(); navigate('/login') }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-navy-700 hover:text-white">
          <LogOut size={I} />Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-64">{sidebar}</div>
          <div className="flex-1 bg-slate-900/40" onClick={() => setOpen(false)} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
          <img src="/logo.png" alt="" className="h-7 w-7" />
          <span className="font-semibold text-navy-800">{TITLE[role]}</span>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
