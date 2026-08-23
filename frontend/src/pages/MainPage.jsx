import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import {
  CarOutlined, SearchOutlined, CalendarOutlined, CreditCardOutlined,
  HistoryOutlined, LogoutOutlined, UserOutlined, DashboardOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HomePage from './HomePage';
import DashboardPage from './DashboardPage';
import VehiclesPage from './VehiclesPage';
import SlotsPage from './SlotsPage';
import ReservationsPage from './ReservationsPage';
import SubscriptionsPage from './SubscriptionsPage';
import PaymentHistoryPage from './PaymentHistoryPage';

const { Header } = Layout;
const { Text } = Typography;

const navItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: 'vehicles', icon: <CarOutlined />, label: 'Xe của tôi' },
  { key: 'slots', icon: <SearchOutlined />, label: 'Tìm chỗ đỗ' },
  { key: 'reservations', icon: <CalendarOutlined />, label: 'Đặt chỗ' },
  { key: 'subscriptions', icon: <CreditCardOutlined />, label: 'Gói thuê bao' },
  { key: 'payments', icon: <HistoryOutlined />, label: 'Lịch sử thanh toán' },
];

export default function MainPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (key) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div style={{ fontWeight: 600 }}>{user?.fullName || 'User'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{user?.email || ''}</Text>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => { logout(); navigate('/login'); },
    },
  ];

  const tab = location.pathname === '/' ? '/' : location.pathname.substring(1);

  const renderContent = () => {
    switch (tab) {
      case 'vehicles': return <VehiclesPage key="vehicles" />;
      case 'slots': return <SlotsPage key="slots" />;
      case 'reservations': return <ReservationsPage key="reservations" />;
      case 'subscriptions': return <SubscriptionsPage key="subscriptions" />;
      case 'payments': return <PaymentHistoryPage key="payments" />;
      default: return <DashboardPage key="dashboard" />;
    }
  };

  if (!user) return <HomePage />;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9' }}>
      <Header style={{
        padding: '0 32px',
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#fff',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        transition: 'all 0.3s',
        boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
        height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>🅿️</div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#0a1628' }}>Parking</span>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[tab || '/']}
            items={navItems}
            onClick={({ key }) => handleNav(key)}
            style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 0, overflow: 'hidden' }}
          />
        </div>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <Avatar size={32} icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg, #1677ff, #69b1ff)' }} />
            <span style={{ fontWeight: 500, fontSize: 14 }}>{user?.fullName || 'User'}</span>
          </div>
        </Dropdown>
      </Header>

      <div style={{ padding: 32 }}>
        {renderContent()}
      </div>
    </div>
  );
}