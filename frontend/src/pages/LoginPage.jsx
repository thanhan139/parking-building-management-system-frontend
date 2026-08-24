import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, App } from 'antd';
import { LockOutlined, PhoneOutlined, RightOutlined } from '@ant-design/icons';
import { useAuth, roleFromToken } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const DEMO_ACCOUNTS = [
  { role: 'ADMIN', phone: 'admin', hint: 'biểu giá · giao dịch · phân quyền' },
  { role: 'MANAGER', phone: 'manager', hint: 'hạ tầng bãi · khiếu nại' },
  { role: 'STAFF', phone: 'staff', hint: 'xe vào · xe ra · thu tiền' },
];
const DEMO_PASSWORD = 'admin';

function homeForRole() {
  const role = roleFromToken();
  if (role === 'STAFF') return '/staff/check-in';
  if (role === 'ADMIN') return '/admin/pricing';
  return '/manager/facility';
}

export default function LoginPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const internal = useLocation().pathname.startsWith('/internal');

  const quickLogin = async (phone) => {
    setLoading(true);
    try {
      await login(phone, DEMO_PASSWORD);
      navigate(homeForRole());
    } catch (err) {
      message.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.phoneNumber, values.password);
      message.success('Đăng nhập thành công!');
      navigate(internal ? homeForRole() : '/');
    } catch (err) {
      message.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 50%, #1677ff 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(22,119,255,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        left: '-10%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(105,177,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255,255,255,0.98)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #1677ff, #69b1ff)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(22,119,255,0.3)',
          }}>
            🅿️
          </div>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            {internal ? 'Cổng nội bộ' : 'Parking Management'}
          </Title>
          <Text type="secondary">
            {internal ? 'Dành cho nhân viên, quản lý và quản trị' : 'Đăng nhập để gửi xe và quản lý xe của bạn'}
          </Text>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
            <Input
              prefix={<PhoneOutlined style={{ color: '#bbb' }} />}
              placeholder="Số điện thoại"
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bbb' }} />}
              placeholder="Mật khẩu"
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ borderRadius: 10, height: 48, fontWeight: 600 }}
            >
              Đăng nhập <RightOutlined />
            </Button>
          </Form.Item>
        </Form>
        {internal ? (
          <>
            <Divider plain><Text type="secondary" style={{ fontSize: 13 }}>Tài khoản demo</Text></Divider>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_ACCOUNTS.map((tk) => (
                <Button
                  key={tk.role}
                  block
                  onClick={() => quickLogin(tk.phone)}
                  disabled={loading}
                  style={{ borderRadius: 10, height: 46, textAlign: 'left' }}
                >
                  <span style={{ fontWeight: 600 }}>{tk.role}</span>
                  <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 8 }}>{tk.hint}</span>
                </Button>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/login"><Text type="secondary" style={{ fontSize: 13 }}>Bạn là khách gửi xe?</Text></Link>
            </div>
          </>
        ) : (
          <>
            <Divider plain><Text type="secondary" style={{ fontSize: 13 }}>Chưa có tài khoản?</Text></Divider>
            <Link to="/register">
              <Button block size="large" style={{ borderRadius: 10, height: 44, fontWeight: 500 }}>
                Đăng ký tài khoản mới
              </Button>
            </Link>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/internal/login"><Text type="secondary" style={{ fontSize: 13 }}>Cổng nội bộ</Text></Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}