import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './contexts/AuthContext';
import { ApartmentOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NoiBoLayout from './pages/NoiBoLayout';
import FacilityPage from './pages/manager/FacilityPage';
import CheckOutPage from './pages/staff/CheckOutPage';

const MENU_MANAGER = [
  { key: '/manager/facility', icon: <ApartmentOutlined />, label: 'Hạ tầng bãi' },
];

const MENU_STAFF = [
  { key: '/staff/check-in', icon: <ImportOutlined />, label: 'Xe vào', disabled: true },
  { key: '/staff/check-out', icon: <ExportOutlined />, label: 'Xe ra' },
];

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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/internal/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/manager" element={<NoiBoLayout ten="Quản lý bãi" mau="#4f46e5" navItems={MENU_MANAGER} />}>
                <Route path="facility" element={<FacilityPage />} />
              </Route>

              <Route path="/staff" element={<NoiBoLayout ten="Nhân viên cổng" mau="#2e7d4f" navItems={MENU_STAFF} />}>
                <Route path="check-out" element={<CheckOutPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AntApp>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}