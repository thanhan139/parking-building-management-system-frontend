import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { ApartmentOutlined, CreditCardOutlined, DollarOutlined, ExportOutlined, ImportOutlined, ProfileOutlined } from '@ant-design/icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InternalLayout from './pages/InternalLayout';
import FacilityPage from './pages/manager/FacilityPage';
import GuestCheckInPage from './pages/GuestCheckInPage';
import MemberCheckInPage from './pages/MemberCheckInPage';
import CheckOutPage from './pages/staff/CheckOutPage';
import PricingPage from './pages/admin/PricingPage';
import PaymentPage from './pages/admin/PaymentPage';
import PlanPage from './pages/admin/PlanPage';
import PaymentResultPage from './pages/PaymentResultPage';

const MENU_ADMIN = [
  { key: '/admin/plans', icon: <CreditCardOutlined />, label: 'Gói đăng ký' },
  { key: '/admin/pricing', icon: <DollarOutlined />, label: 'Biểu giá' },
  { key: '/admin/payments', icon: <ProfileOutlined />, label: 'Giao dịch' },
];

const MENU_MANAGER = [
  { key: '/manager/facility', icon: <ApartmentOutlined />, label: 'Hạ tầng bãi' },
];

const MENU_STAFF = [
  { key: '/staff/check-in', icon: <ImportOutlined />, label: 'Check-in khách' },
  { key: '/staff/member-check-in', icon: <ImportOutlined />, label: 'Check-in thành viên' },
  { key: '/staff/check-out', icon: <ExportOutlined />, label: 'Xe ra' },
];

// Guard chung: chi cho phep cac role trong "allow" vao khu vuc nay.
function RoleGuard({ allow, children }) {
  const { user, role } = useAuth();

  if (!user) return <Navigate to="/internal/login" replace />;
  if (!allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        },
        components: {
          Card: { borderRadiusLG: 12 },
          Table: { borderRadius: 8 },
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <AntApp>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/vehicles" element={<MainPage />} />
              <Route path="/slots" element={<MainPage />} />
              <Route path="/reservations" element={<MainPage />} />
              <Route path="/subscriptions" element={<MainPage />} />
              <Route path="/payments" element={<MainPage />} />
              <Route path="/profile" element={<MainPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/internal/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/admin"
                element={<RoleGuard allow={['ADMIN']}><InternalLayout title="Quản trị hệ thống" color="#b45309" navItems={MENU_ADMIN} /></RoleGuard>}
              >
                <Route index element={<Navigate to="plans" replace />} />
                <Route path="plans" element={<PlanPage />} />
                <Route path="pricing" element={<PricingPage />} />
                <Route path="payments" element={<PaymentPage />} />
              </Route>

              <Route
                path="/manager"
                element={<RoleGuard allow={['MANAGER', 'ADMIN']}><InternalLayout title="Quản lý bãi" color="#4f46e5" navItems={MENU_MANAGER} /></RoleGuard>}
              >
                <Route index element={<Navigate to="facility" replace />} />
                <Route path="facility" element={<FacilityPage />} />
              </Route>

              <Route
                path="/staff"
                element={<RoleGuard allow={['STAFF', 'MANAGER', 'ADMIN']}><InternalLayout title="Nhân viên cổng" color="#2e7d4f" navItems={MENU_STAFF} /></RoleGuard>}
              >
                <Route index element={<Navigate to="check-in" replace />} />
                <Route path="check-in" element={<GuestCheckInPage />} />
                <Route path="member-check-in" element={<MemberCheckInPage />} />
                <Route path="check-out" element={<CheckOutPage />} />
              </Route>

              <Route path="/staff/guest-check-in" element={<Navigate to="/staff/check-in" replace />} />
              <Route path="/staff/membership-check-in" element={<Navigate to="/staff/member-check-in" replace />} />
              <Route path="/payment-result" element={<PaymentResultPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AntApp>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
