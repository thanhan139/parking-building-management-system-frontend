import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Typography } from 'antd';
import {
  CarOutlined,
  SearchOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/vehicles', icon: <CarOutlined />, label: 'Xe của tôi' },
  { key: '/slots', icon: <SearchOutlined />, label: 'Tìm chỗ đỗ' },
  { key: '/reservations', icon: <CalendarOutlined />, label: 'Đặt chỗ' },
  { key: '/subscriptions', icon: <CreditCardOutlined />, label: 'Gói thuê bao' },
  { key: '/payments', icon: <HistoryOutlined />, label: 'Lịch sử thanh toán' },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  return (
    <Layout style={{ minHeight: '100vh', background: '#f4f6f9' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          background: 'linear-gradient(180deg, #0a1628 0%, #132144 100%)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          gap: 10,
          padding: '0 16px',
        }}>
          <div style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}>
            🅿️
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Parking</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 1 }}>MANAGEMENT</div>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderInlineEnd: 'none',
            padding: '8px 0',
          }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
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
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined style={{ fontSize: 18 }} /> : <MenuFoldOutlined style={{ fontSize: 18 }} />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: '#555' }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 12px 4px 4px',
              borderRadius: 8,
              transition: 'background 0.2s',
            }}>
              <Avatar
                size={36}
                icon={<UserOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
                  color: '#fff',
                  flexShrink: 0,
                }}
              />
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>{user?.fullName || 'User'}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>{user?.email || 'user@parking.com'}</Text>
              </div>
            </div>
          </Dropdown>
        </Header>
        <Content style={{
          margin: 0,
          padding: 32,
          minHeight: 'calc(100vh - 64px)',
          background: '#f4f6f9',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}