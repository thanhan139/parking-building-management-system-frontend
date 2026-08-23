import { Button, Menu, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Text } = Typography;

export default function InternalLayout({ title, color, navItems }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useLocation().pathname;

  const signOut = () => {
    logout();
    navigate('/internal/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 24, height: 60,
        padding: '0 24px', background: '#fff', borderBottom: `3px solid ${color}`,
        position: 'sticky', top: 0, zIndex: 99,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
          }}>🅿</div>
          <span style={{ fontWeight: 700 }}>{title}</span>
        </div>

        <Menu
          mode="horizontal"
          selectedKeys={[path]}
          items={navItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', flex: 1, minWidth: 0 }}
        />

        <Text type="secondary" style={{ fontSize: 13 }}>{user?.fullName || ''}</Text>
        <Button icon={<LogoutOutlined />} onClick={signOut}>Thoát</Button>
      </div>

      <Outlet />
    </div>
  );
}
