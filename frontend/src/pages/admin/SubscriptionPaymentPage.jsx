import { useCallback, useEffect, useState } from 'react';
import { App, Button, Card, Statistic, Table, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import subscriptionService from '../../services/subscriptionService';
import { errorText } from '../../services/paymentService';
import { money } from '../staff/format';
import { shortTime } from './pricingLabels';

const STATUS = {
  ACTIVE: { color: 'green', label: 'Đang hiệu lực' },
  EXPIRED: { color: 'default', label: 'Hết hạn' },
  PENDING: { color: 'orange', label: 'Chờ trả' },
  CANCELLED: { color: 'default', label: 'Đã huỷ' },
};

const METHOD = { CASH: 'Tiền mặt', VNPAY: 'VNPay', BANK_TRANSFER: 'Chuyển khoản', ONLINE: 'Trực tuyến' };

export default function SubscriptionPaymentPage() {
  const { message } = App.useApp();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      setRows((await subscriptionService.getAdminPayments()).data.result || []);
    } catch (err) {
      message.error(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const collected = rows
    .filter((r) => r.status !== 'PENDING' && r.status !== 'CANCELLED')
    .reduce((sum, r) => sum + Number(r.pricePaid || 0), 0);

  const columns = [
    { title: 'Mua lúc', render: (_, r) => shortTime(r.purchasedAt) },
    { title: 'Biển số', dataIndex: 'plateNumber' },
    { title: 'Gói', dataIndex: 'planName' },
    {
      title: 'Kỳ hạn',
      render: (_, r) => `${r.startDate || '—'} → ${r.endDate || '—'}`,
    },
    {
      title: 'Số tiền',
      align: 'right',
      render: (_, r) => <strong>{money(r.pricePaid)}</strong>,
    },
    { title: 'Phương thức', render: (_, r) => METHOD[r.paymentMethod] || r.paymentMethod || '—' },
    {
      title: 'Trạng thái',
      render: (_, r) => {
        const st = STATUS[r.status] || { color: 'default', label: r.status };
        return <Tag color={st.color}>{st.label}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Thanh toán gói thuê</h2>
        <Button icon={<ReloadOutlined />} onClick={loadAll}>Tải lại</Button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Card size="small" style={{ minWidth: 180 }}>
          <Statistic title="Đã thu từ gói" value={money(collected)} valueStyle={{ color: '#2e7d4f' }} />
        </Card>
        <Card size="small" style={{ minWidth: 140 }}>
          <Statistic title="Lượt mua" value={rows.length} />
        </Card>
      </div>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table
          size="small"
          rowKey="id"
          loading={loading}
          dataSource={rows}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
}
