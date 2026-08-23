import { useState, useEffect } from 'react';
import { Table, Card, Select, Button, Tag, Typography, Space, message, Modal } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import vehicleService from '../services/vehicleService';
import subscriptionService from '../services/subscriptionService';

const { Title } = Typography;
const statusColors = { PENDING: 'orange', ACTIVE: 'green', EXPIRED: 'default', CANCELLED: 'red' };

export default function SubscriptionsPage() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const fetchPlans = async () => {
    try {
      const res = await subscriptionService.getPlans();
      setPlans(res.data?.result || []);
    } catch (err) {}
  };

  const openPurchaseModal = () => {
    fetchPlans();
    setPurchaseModal(true);
  };

  const fetchVehicles = async () => {
    try {
      const res = await vehicleService.getMyVehicles();
      setVehicles(res.data.result || res.data || []);
    } catch (err) {}
  };

  const fetchSubscriptions = async (vehicleId) => {
    setLoading(true);
    try {
      const res = await subscriptionService.getSubscriptions(vehicleId);
      setSubscriptions(res.data.result || res.data || []);
    } catch (err) {
      message.error('Không thể tải danh sách gói');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleVehicleChange = (vehicleId) => {
    setSelectedVehicle(vehicleId);
    fetchSubscriptions(vehicleId);
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !selectedVehicle) {
      message.warning('Chọn xe và gói trước!');
      return;
    }
    try {
      const res = await subscriptionService.purchase(selectedVehicle, {
        planId: selectedPlan,
        paymentMethod: 'VNPAY',
      });
      const paymentUrl = res.data.result?.message?.replace('Payment URL: ', '') || res.data.message?.replace('Payment URL: ', '');
      if (paymentUrl && paymentUrl.startsWith('http')) {
        window.open(paymentUrl, '_blank');
      }
      message.success('Đang chuyển đến VNPay...');
      setPurchaseModal(false);
    } catch (err) {
      message.error(err.response?.data?.message || 'Mua gói thất bại');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Gói', dataIndex: 'planName', key: 'planName', render: (t) => t || '-' },
    { title: 'Mã gói', dataIndex: 'planCode', key: 'planCode', render: (t) => <Tag>{t}</Tag> },
    { title: 'Thời hạn', dataIndex: 'durationMonths', key: 'durationMonths', render: (t) => `${t} tháng` },
    { title: 'Ngày bắt đầu', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate' },
    { title: 'Giá', dataIndex: 'pricePaid', key: 'pricePaid', render: (t) => t ? `${Number(t).toLocaleString()} VND` : '-' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (t) => <Tag color={statusColors[t]}>{t}</Tag> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Gói đăng ký</Title>
        <Space>
          <Select placeholder="Chọn xe" style={{ width: 250 }} onChange={handleVehicleChange}>
            {vehicles.map((v) => <Select.Option key={v.id} value={v.id}>{v.plateNumber}</Select.Option>)}
          </Select>
          {selectedVehicle && <Button type="primary" icon={<CreditCardOutlined />} onClick={openPurchaseModal}>Mua gói mới</Button>}
        </Space>
      </div>

      {selectedVehicle ? (
        <Table columns={columns} dataSource={subscriptions} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      ) : (
        <Card><p>Chọn xe để xem gói đăng ký</p></Card>
      )}

      <Modal title="Mua gói đăng ký" open={purchaseModal} onCancel={() => setPurchaseModal(false)} onOk={handlePurchase} okText="Thanh toán VNPay" cancelText="Hủy">
        <p>Chọn gói đăng ký cho xe:</p>
        <Select placeholder="Chọn gói" style={{ width: '100%' }} onChange={(v) => setSelectedPlan(v)}>
          {plans.map((p) => <Select.Option key={p.id} value={p.id}>{p.name} - {p.durationMonths} tháng - {Number(p.price).toLocaleString()} VND</Select.Option>)}
        </Select>
      </Modal>
    </div>
  );
}
