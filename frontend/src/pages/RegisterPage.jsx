import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, RightOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values);
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      message.error(err.response?.data?.message || 'Đăng ký thất bại');
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
        top: '-40%',
        left: '-10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(22,119,255,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Card
        style={{
          width: 440,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255,255,255,0.98)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Tạo tài khoản</Title>
          <Text type="secondary">Đăng ký để bắt đầu quản lý bãi đỗ xe</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input
              prefix={<UserOutlined style={{ color: '#bbb' }} />}
              placeholder="Họ và tên"
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
            <Input
              prefix={<MailOutlined style={{ color: '#bbb' }} />}
              placeholder="Email"
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>
          <Form.Item name="phoneNumber" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
            <Input
              prefix={<PhoneOutlined style={{ color: '#bbb' }} />}
              placeholder="Số điện thoại"
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bbb' }} />}
              placeholder="Mật khẩu"
              style={{ borderRadius: 10, height: 48 }}
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('Mật khẩu không khớp!')); } }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bbb' }} />}
              placeholder="Xác nhận mật khẩu"
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
              Đăng ký <RightOutlined />
            </Button>
          </Form.Item>
        </Form>
        <Divider plain><Text type="secondary" style={{ fontSize: 13 }}>Đã có tài khoản?</Text></Divider>
        <Link to="/login">
          <Button block size="large" style={{ borderRadius: 10, height: 44, fontWeight: 500 }}>
            Đăng nhập ngay
          </Button>
        </Link>
      </Card>
    </div>
  );
}