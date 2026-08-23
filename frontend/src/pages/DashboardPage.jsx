import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Tag, List, Button, Empty, Avatar } from 'antd';
import {
  CarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  RightOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import reservationService from '../services/reservationService';
import paymentService from '../services/paymentService';
import subscriptionService from '../services/subscriptionService';
import slotService from '../services/slotService';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const statusTag = (status) => {
  const map = {
    PENDING: { color: 'gold', label: 'Chờ xác nhận' },
    CONFIRMED: { color: 'blue', label: 'Đã xác nhận' },
    COMPLETED: { color: 'green', label: 'Hoàn thành' },
    CANCELLED: { color: 'red', label: 'Đã hủy' },
    ACTIVE: { color: 'green', label: 'Đang hoạt động' },
    EXPIRED: { color: 'default', label: 'Hết hạn' },
    FAILED: { color: 'red', label: 'Thất bại' },
    REFUNDED: { color: 'orange', label: 'Đã hoàn tiền' },
  };
  const s = map[status] || { color: 'default', label: status };
  return <Tag color={s.color}>{s.label}</Tag>;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);
  const [availableSlots, setAvailableSlots] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, rRes, pRes, sRes] = await Promise.all([
          vehicleService.getMyVehicles().catch(() => ({ data: { result: [] } })),
          reservationService.getMyReservations().catch(() => ({ data: { result: [] } })),
          paymentService.getPaymentHistory().catch(() => ({ data: { result: [] } })),
          slotService.getSlots().catch(() => ({ data: { result: [] } })),
        ]);

        const v = vRes.data?.result || [];
        const r = rRes.data?.result || [];
        const p = pRes.data?.result || [];
        const slots = sRes.data?.result || [];

        setVehicles(v);
        setReservations(r);
        setPayments(p);
        setAvailableSlots(slots.filter((s) => s.status === 'AVAILABLE').length);

        const activeSubs = [];
        for (const vehicle of v) {
          try {
            const sRes = await subscriptionService.getActiveSubscription(vehicle.vehicleId || vehicle.id);
            const sub = sRes.data?.result;
            if (sub) activeSubs.push({ ...sub, vehiclePlate: vehicle.plateNumber || vehicle.plate || '' });
          } catch { }
        }
        setActiveSubscriptions(activeSubs);
      } catch { } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 100%)',
        borderRadius: 16,
        padding: '40px 48px',
        marginBottom: 28,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,119,255,0.2) 0%, transparent 70%)',
        }} />
        <Row align="middle" justify="space-between">
          <Col>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Chào mừng trở lại</Text>
            <Title level={3} style={{ color: '#fff', margin: '4px 0', fontWeight: 700, fontSize: 24 }}>
              {user?.fullName || 'Người dùng'}
            </Title>
            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <Button
                type="primary"
                size="large"
                icon={<EnvironmentOutlined />}
                style={{ borderRadius: 10, height: 44, fontWeight: 600 }}
                onClick={() => navigate('/slots')}
              >
                Tìm chỗ đỗ xe
              </Button>
              <Button
                size="large"
                ghost
                icon={<CalendarOutlined />}
                style={{ borderRadius: 10, height: 44, fontWeight: 600, borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                onClick={() => navigate('/reservations')}
              >
                Đặt chỗ ngay
              </Button>
            </div>
          </Col>
          <Col>
            <div style={{
              width: 120,
              height: 120,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
            }}>
              🅿️
            </div>
          </Col>
        </Row>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }} styles={{ body: { padding: '20px 24px' } }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 13 }}>Xe đã đăng ký</Text>}
              value={vehicles.length}
              prefix={<CarOutlined style={{ color: '#1677ff' }} />}
              styles={{ content: { color: '#1677ff', fontSize: 28, fontWeight: 700 } }}
            />
            <Button type="link" size="small" style={{ padding: 0, marginTop: 8 }} onClick={() => navigate('/vehicles')}>
              Quản lý xe <RightOutlined />
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }} styles={{ body: { padding: '20px 24px' } }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 13 }}>Chỗ trống</Text>}
              value={availableSlots}
              prefix={<EnvironmentOutlined style={{ color: '#52c41a' }} />}
              styles={{ content: { color: '#52c41a', fontSize: 28, fontWeight: 700 } }}
            />
            <Button type="link" size="small" style={{ padding: 0, marginTop: 8 }} onClick={() => navigate('/slots')}>
              Xem bản đồ <RightOutlined />
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }} styles={{ body: { padding: '20px 24px' } }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 13 }}>Gói đang hoạt động</Text>}
              value={activeSubscriptions.length}
              prefix={<CreditCardOutlined style={{ color: '#722ed1' }} />}
              styles={{ content: { color: '#722ed1', fontSize: 28, fontWeight: 700 } }}
            />
            <Button type="link" size="small" style={{ padding: 0, marginTop: 8 }} onClick={() => navigate('/subscriptions')}>
              Gói của tôi <RightOutlined />
            </Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }} styles={{ body: { padding: '20px 24px' } }}>
            <Statistic
              title={<Text type="secondary" style={{ fontSize: 13 }}>Giao dịch</Text>}
              value={payments.length}
              prefix={<HistoryOutlined style={{ color: '#fa8c16' }} />}
              styles={{ content: { color: '#fa8c16', fontSize: 28, fontWeight: 700 } }}
            />
            <Button type="link" size="small" style={{ padding: 0, marginTop: 8 }} onClick={() => navigate('/payments')}>
              Lịch sử <RightOutlined />
            </Button>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 28 }}>
        <Col xs={24} lg={16}>
          <Card
            title={<span style={{ fontWeight: 600 }}><CalendarOutlined style={{ marginRight: 8 }} />Lịch sử đặt chỗ</span>}
            extra={<Button type="link" onClick={() => navigate('/reservations')}>Xem tất cả <RightOutlined /></Button>}
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            {reservations.length === 0 ? (
              <Empty
                description="Bạn chưa có đặt chỗ nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={() => navigate('/slots')}>Đặt chỗ ngay</Button>
              </Empty>
            ) : (
              <List
                dataSource={reservations.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: '#e6f4ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          color: '#1677ff',
                        }}>
                          <ClockCircleOutlined />
                        </div>
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 500 }}>{item.buildingName || `Mã #${item.id || item.reservationId}`}</span>
                          {statusTag(item.status)}
                        </div>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {item.slotName || ''}
                          {item.startTime ? ` - ${new Date(item.startTime).toLocaleDateString('vi-VN')}` : ''}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<span style={{ fontWeight: 600 }}><CreditCardOutlined style={{ marginRight: 8 }} />Gói thuê bao</span>}
            extra={<Button type="link" onClick={() => navigate('/subscriptions')}>Xem thêm <RightOutlined /></Button>}
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          >
            {activeSubscriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Text type="secondary">Chưa có gói nào</Text>
                <br />
                <Button style={{ marginTop: 12 }} onClick={() => navigate('/subscriptions')}>Mua gói mới</Button>
              </div>
            ) : (
              <List
                dataSource={activeSubscriptions}
                renderItem={(item) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: '#f9f0ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 20,
                          color: '#722ed1',
                        }}>
                          <CreditCardOutlined />
                        </div>
                      }
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 500 }}>{item.planName || 'Gói thuê bao'}</span>
                          <Tag color="green">Đang hoạt động</Tag>
                        </div>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Xe: {item.vehiclePlate || ''}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}