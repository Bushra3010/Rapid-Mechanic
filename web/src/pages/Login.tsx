import clsx from 'clsx'
import { ShieldCheck, Store, Wrench } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { DEMO_ACCOUNTS, signIn } from '../services/api'
import { useStore, type Session } from '../store/useStore'

const ROLES: { role: Session['role']; label: string; desc: string; icon: React.ReactNode }[] = [
  { role: 'admin', label: 'Platform admin', desc: 'Manage the whole platform', icon: <ShieldCheck size={20} /> },
  { role: 'seller', label: 'Seller', desc: 'Products, stock & orders', icon: <Store size={20} /> },
  { role: 'technician', label: 'Technician', desc: 'Jobs, services & areas', icon: <Wrench size={20} /> },
]

export default function Login() {
  const session = useStore((s) => s.session)
  const navigate = useNavigate()
  const [role, setRole] = useState<Session['role']>('admin')
  const [email, setEmail] = useState(DEMO_ACCOUNTS.admin.email)
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (session) return <Navigate to={`/${session.role}`} replace />

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try { await signIn(role, email, password); navigate(`/${role}`) } catch (err) { setError((err as Error).message) } finally { setBusy(false) }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-800 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="h-12 w-12 rounded-xl bg-white p-1" />
          <span className="text-xl font-semibold">Rapid Mechanic</span>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-semibold leading-tight">Vehicle services &amp; parts,<br /><span className="text-brand-400">run from one console.</span></h1>
          <p className="mt-4 max-w-md text-navy-100">Service &amp; repair jobs, roadside assistance, yearly AMC plans and a multi-seller marketplace — managed by admins, sellers and technicians.</p>
        </div>
        <p className="text-xs text-navy-200">© {new Date().getFullYear()} Rapid Mechanic</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-md">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Rapid Mechanic" className="mb-6 h-14 w-14 lg:hidden" />
          <h2 className="text-2xl font-semibold text-navy-800">Sign in</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">Choose your panel to continue.</p>

          <div className="mb-5 grid grid-cols-3 gap-2">
            {ROLES.map((r) => (
              <button type="button" key={r.role} onClick={() => { setRole(r.role); setEmail(DEMO_ACCOUNTS[r.role].email) }}
                className={clsx('rounded-xl border p-3 text-left transition', role === r.role ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 bg-white hover:border-slate-300')}>
                <span className={clsx(role === r.role ? 'text-brand-500' : 'text-navy-500')}>{r.icon}</span>
                <p className="mt-2 text-sm font-medium text-navy-800">{r.label}</p>
                <p className="text-[11px] leading-tight text-slate-500">{r.desc}</p>
              </button>
            ))}
          </div>

          <label className="label">Email</label>
          <input className="input mb-4" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label className="label">Password</label>
          <input className="input mb-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="accent" className="mt-4 w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
          <p className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-500">Demo mode: any password of 4+ characters works. Real accounts will use Supabase Auth.</p>
        </form>
      </div>
    </div>
  )
}
