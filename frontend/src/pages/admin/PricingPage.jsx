import { useCallback, useEffect, useState } from 'react';
import { App, Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import pricingService, { errorText } from '../../services/pricingService';
import PricingActive from './PricingActive';
import PricingHistory from './PricingHistory';
import PricingForm from './PricingForm';

export default function PricingPage() {
  const { message } = App.useApp();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Backend trả 404 khi CHƯA có biểu giá cho loại xe -> coi như danh sách rỗng
  const getCategoryRules = async (category) => {
    try {
      return (await pricingService.getByCategory(category)).data.result || [];
    } catch (err) {
      if (err.response?.status === 404) return [];
      throw err;
    }
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [car, motorcycle] = await Promise.all([
        getCategoryRules('CAR'),
        getCategoryRules('MOTORCYCLE'),
      ]);
      setRules([...car, ...motorcycle]);
    } catch (err) {
      message.error(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const create = async (body) => {
    try {
      await pricingService.create(body);
      message.success('Đã tạo biểu giá mới');
      setFormOpen(false);
      await loadAll();
    } catch (err) {
      message.error(errorText(err));
    }
  };

  const remove = async (id) => {
    try {
      await pricingService.remove(id);
      message.success('Đã xoá');
      await loadAll();
    } catch (err) {
      message.error(errorText(err));
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Biểu giá</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormOpen(true)}>
          Biểu giá mới
        </Button>
      </div>

      <PricingActive rules={rules} />

      <Card title="Toàn bộ biểu giá" size="small" style={{ marginTop: 16 }} styles={{ body: { padding: 0 } }}>
        <PricingHistory rules={rules} loading={loading} onRemove={remove} />
      </Card>

      <PricingForm open={formOpen} onCancel={() => setFormOpen(false)} onSubmit={create} />
    </div>
  );
}
