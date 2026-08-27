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
  const [dangSua, setDangSua] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [car, motorcycle] = await Promise.all([
        pricingService.getByCategory('CAR'),
        pricingService.getByCategory('MOTORCYCLE'),
      ]);
      setRules([...(car.data.result || []), ...(motorcycle.data.result || [])]);
    } catch (err) {
      message.error(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const luu = async (body) => {
    try {
      if (dangSua) {
        await pricingService.update(dangSua.id, body);
        message.success('Đã lưu biểu giá');
      } else {
        await pricingService.create(body);
        message.success('Đã tạo biểu giá mới');
      }
      setFormOpen(false);
      setDangSua(null);
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setDangSua(null); setFormOpen(true); }}>
          Biểu giá mới
        </Button>
      </div>

      <PricingActive rules={rules} />

      <Card title="Toàn bộ biểu giá" size="small" style={{ marginTop: 16 }} styles={{ body: { padding: 0 } }}>
        <PricingHistory
          rules={rules}
          loading={loading}
          onRemove={remove}
          onEdit={(rule) => { setDangSua(rule); setFormOpen(true); }}
        />
      </Card>

      <PricingForm
        open={formOpen}
        sua={dangSua}
        onCancel={() => { setFormOpen(false); setDangSua(null); }}
        onSubmit={luu}
      />
    </div>
  );
}
