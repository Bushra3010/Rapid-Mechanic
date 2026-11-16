import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PanelLayout from './layouts/PanelLayout'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminRequests from './pages/admin/Requests'
import AdminOrders from './pages/admin/Orders'
import { AdminAmc, AdminProducts, AdminRsa, AdminSellers, AdminServices, AdminTechnicians } from './pages/admin/Catalog'
import { AdminCustomers, AdminSettings } from './pages/admin/People'
import { SellerDashboard, SellerInventory, SellerOrders, SellerProducts } from './pages/seller/Seller'
import { TechAreas, TechDashboard, TechJobs, TechProfile, TechServices } from './pages/technician/Technician'
import { useStore } from './store/useStore'

function Home() {
  const session = useStore((s) => s.session)
  return <Navigate to={session ? `/${session.role}` : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<PanelLayout role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="technicians" element={<AdminTechnicians />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="amc" element={<AdminAmc />} />
          <Route path="rsa" element={<AdminRsa />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="/seller" element={<PanelLayout role="seller" />}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="inventory" element={<SellerInventory />} />
          <Route path="orders" element={<SellerOrders />} />
        </Route>
        <Route path="/technician" element={<PanelLayout role="technician" />}>
          <Route index element={<TechDashboard />} />
          <Route path="jobs" element={<TechJobs />} />
          <Route path="services" element={<TechServices />} />
          <Route path="areas" element={<TechAreas />} />
          <Route path="profile" element={<TechProfile />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
