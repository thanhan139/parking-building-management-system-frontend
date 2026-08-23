import { Button, Typography, Row, Col, Card, Space } from 'antd';
import {
  CarOutlined,
  SearchOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const features = [
  {
    icon: <SearchOutlined style={{ fontSize: 28 }} />,
    title: 'Tìm chỗ đỗ thông minh',
    desc: 'Tra cứu vị trí trống theo thời gian thực, tìm bãi gần bạn nhất.',
  },
  {
    icon: <CalendarOutlined style={{ fontSize: 28 }} />,
    title: 'Đặt chỗ trước',
    desc: 'Đặt trước vị trí đỗ xe, không lo hết chỗ khi đến nơi.',
  },
  {
    icon: <CreditCardOutlined style={{ fontSize: 28 }} />,
    title: 'Gói thuê bao linh hoạt',
    desc: 'Nhiều gói thuê bao theo tháng, quý, năm phù hợp nhu cầu.',
  },
  {
    icon: <CarOutlined style={{ fontSize: 28 }} />,
    title: 'Quản lý phương tiện',
    desc: 'Thêm nhiều xe, theo dõi lịch sử đỗ xe dễ dàng.',
  },
  {
    icon: <SafetyCertificateOutlined style={{ fontSize: 28 }} />,
    title: 'An toàn & bảo mật',
    desc: 'Hệ thống camera giám sát 24/7, bảo vệ xe an toàn tuyệt đối.',
  },
  {
    icon: <TeamOutlined style={{ fontSize: 28 }} />,
    title: 'Hỗ trợ 24/7',
    desc: 'Đội ngũ hỗ trợ trực tuyến sẵn sàng giúp bạn mọi lúc.',
  },
];

const stats = [
  { value: '10.000+', label: 'Lượt đỗ xe' },
  { value: '500+', label: 'Bãi đỗ trên toàn quốc' },
  { value: '50.000+', label: 'Người dùng tin tưởng' },
  { value: '99%', label: 'Hài lòng khách hàng' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 50%, #1677ff 100%)',
        padding: '80px 48px 100px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,119,255,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -150,
          left: -80,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(105,177,255,0.1) 0%, transparent 70%)',
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <div style={{
            width: 80,
            height: 80,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            margin: '0 auto 24px',
            backdropFilter: 'blur(10px)',
          }}>
            🅿️
          </div>
          <Title style={{ color: '#fff', fontSize: 42, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            Hệ thống quản lý bãi đỗ xe thông minh
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, marginTop: 20, marginBottom: 36 }}>
            Đặt chỗ, thanh toán và quản lý phương tiện của bạn mọi lúc mọi nơi. Tiết kiệm thời gian với giải pháp đỗ xe thông minh.
          </Paragraph>
          <Space size={16}>
            <Button
              type="primary"
              size="large"
              style={{ borderRadius: 10, height: 50, paddingInline: 32, fontWeight: 600, fontSize: 16 }}
              onClick={() => navigate('/register')}
            >
              Bắt đầu ngay <RightOutlined />
            </Button>
            <Button
              size="large"
              ghost
              style={{ borderRadius: 10, height: 50, paddingInline: 32, fontWeight: 600, fontSize: 16, borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        background: '#fff',
        padding: '32px 48px',
        marginTop: -40,
        marginLeft: 48,
        marginRight: 48,
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 2,
      }}>
        <Row gutter={[32, 16]}>
          {stats.map((s) => (
            <Col xs={12} md={6} key={s.label}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1677ff' }}>{s.value}</div>
                <Text type="secondary" style={{ fontSize: 14 }}>{s.label}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Features */}
      <div style={{ padding: '80px 48px', background: '#f4f6f9' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={2} style={{ fontWeight: 700, margin: 0 }}>Tính năng nổi bật</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Mọi thứ bạn cần cho trải nghiệm đỗ xe tốt nhất
          </Text>
        </div>
        <Row gutter={[24, 24]} style={{ maxWidth: 1000, margin: '0 auto' }}>
          {features.map((f, i) => (
            <Col xs={24} sm={12} md={8} key={i}>
              <Card
                style={{
                  borderRadius: 14,
                  border: 'none',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  height: '100%',
                }}
                styles={{ body: { padding: 32 } }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: '#e6f4ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1677ff',
                  marginBottom: 20,
                }}>
                  {f.icon}
                </div>
                <Title level={5} style={{ fontWeight: 600, margin: 0 }}>{f.title}</Title>
                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>{f.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA */}
      <div style={{
        padding: '80px 48px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 100%)',
      }}>
        <Title level={2} style={{ color: '#fff', fontWeight: 700, margin: 0 }}>
          Sẵn sàng trải nghiệm?
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 12, marginBottom: 32, maxWidth: 500, marginInline: 'auto' }}>
          Đăng ký ngay để nhận ưu đãi đặc biệt cho lần đỗ xe đầu tiên.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          style={{ borderRadius: 10, height: 50, paddingInline: 40, fontWeight: 600, fontSize: 16 }}
          onClick={() => navigate('/register')}
        >
          Đăng ký miễn phí <RightOutlined />
        </Button>
      </div>

      {/* Footer */}
      <div style={{ padding: '24px 48px', textAlign: 'center', background: '#0a1628' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>🅿️</span>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Parking Management System</Text>
        </div>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          &copy; 2026 Parking Management. Tất cả quyền được bảo lưu.
        </Text>
      </div>
    </div>
  );
}