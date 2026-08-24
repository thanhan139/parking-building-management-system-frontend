import { useCallback, useEffect, useState } from 'react';
import { App, Button, Card, Statistic } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import paymentService, { errorText } from '../../services/paymentService';
import PaymentTable from './PaymentTable';
import { money } from '../staff/format';

export default function PaymentPage() {
  const { message } = App.useApp();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      setPayments((await paymentService.getGatePayments()).data.result || []);
    } catch (err) {
      message.error(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const paid = payments.filter((row) => row.status === 'PAID');
  const collected = paid.reduce((sum, row) => sum + Number(row.amountTotal || 0), 0);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Giao dịch qua bãi</h2>
        <Button icon={<ReloadOutlined />} onClick={loadAll}>Tải lại</Button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Card size="small" style={{ minWidth: 180 }}>
          <Statistic title="Đã thu" value={money(collected)} valueStyle={{ color: '#2e7d4f' }} />
        </Card>
        <Card size="small" style={{ minWidth: 140 }}>
          <Statistic title="Lượt đã trả" value={paid.length} />
        </Card>
        <Card size="small" style={{ minWidth: 140 }}>
          <Statistic title="Đang chờ trả" value={payments.length - paid.length} />
        </Card>
      </div>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <PaymentTable payments={payments} loading={loading} />
      </Card>
    </div>
  );
}
