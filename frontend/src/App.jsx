import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './contexts/AuthContext';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PaymentResultPage from './pages/PaymentResultPage';

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
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/payment-result" element={<PaymentResultPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AntApp>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}