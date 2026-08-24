import { useCallback, useEffect, useState } from 'react';
import { App, Button, Card, Popconfirm, Space, Statistic, Switch, Table, Tag, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import subscriptionService from '../../services/subscriptionService';
import { money } from '../staff/format';
import PlanForm from './PlanForm';

const { Text } = Typography;

const statusTag = (active) =>
  active ? <Tag color="green">Đang bán</Tag> : <Tag color="default">Đã ẩn</Tag>;

export default function PlanPage() {
  const { message } = App.useApp();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      setPlans((await subscriptionService.getPlans()).data.result || []);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách gói');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const submitForm = async (values) => {
    try {
      if (editing) {
        await subscriptionService.updatePlan(editing.id, values);
        message.success('Đã cập nhật gói');
      } else {
        await subscriptionService.createPlan(values);
        message.success('Đã tạo gói mới');
      }
      setFormOpen(false);
      setEditing(null);
      await loadAll();
      return true;
    } catch (err) {
      message.error(err.response?.data?.message || 'Không lưu được gói');
      return false;
    }
  };

  const toggleActive = async (plan) => {
    setTogglingId(plan.id);
    try {
      await subscriptionService.updatePlan(plan.id, { ...plan, isActive: !plan.isActive });
      message.success(plan.isActive ? `Đã ẩn gói "${plan.name}"` : `Đã mở bán gói "${plan.name}"`);
      await loadAll();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không đổi được trạng thái');
    } finally {
      setTogglingId(null);
    }
  };

  const remove = async (plan) => {
    try {
      await subscriptionService.deletePlan(plan.id);
      message.success(`Đã xoá gói "${plan.name}"`);
      await loadAll();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không xoá được gói');
    }
  };

  const columns = [
    { title: 'Tên gói', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
    {
      title: 'Loại xe',
      dataIndex: 'vehicleTypeName',
      key: 'vehicleTypeName',
      width: 140,
      render: (t, r) => <Tag>{t || r.vehicleTypeCode || '-'}</Tag>,
    },
    {
      title: 'Thời hạn',
      dataIndex: 'durationMonths',
      key: 'durationMonths',
      width: 100,
      render: (m) => `${m} tháng`,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      render: (p) => <Text strong style={{ color: '#b45309' }}>{money(p)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: (v) => statusTag(v !== false),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      render: (_, plan) => (
        <Space>
          <Button size="small" onClick={() => { setEditing(plan); setFormOpen(true); }}>
            Sửa
          </Button>
          <Switch
            size="small"
            checked={plan.isActive !== false}
            loading={togglingId === plan.id}
            onChange={() => toggleActive(plan)}
          />
          <Popconfirm
            title="Xoá gói này?"
            description="Gói đã bán sẽ không thể xoá nếu còn dữ liệu liên quan."
            onConfirm={() => remove(plan)}
          >
            <Button size="small" danger>Xoá</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const active = plans.filter((p) => p.isActive !== false);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Quản lý gói đăng ký</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadAll}>Tải lại</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            Gói mới
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Card size="small" style={{ minWidth: 160 }}>
          <Statistic title="Tổng số gói" value={plans.length} />
        </Card>
        <Card size="small" style={{ minWidth: 160 }}>
          <Statistic title="Đang bán" value={active.length} valueStyle={{ color: '#2e7d4f' }} />
        </Card>
        <Card size="small" style={{ minWidth: 200 }}>
          <Statistic title="Giá thấp nhất" value={money(plans.length ? Math.min(...plans.map((p) => Number(p.price || 0))) : 0)} />
        </Card>
      </div>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={plans}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <PlanForm
        open={formOpen}
        editing={editing}
        onCancel={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={submitForm}
      />
    </div>
  );
}
