import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd';
import vehicleService from '../../services/vehicleService';

export default function PlanForm({ open, editing, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [types, setTypes] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    vehicleService.getVehicleTypes()
      .then((res) => setTypes(res.data?.result || []))
      .catch(() => setTypes([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        code: editing.code,
        name: editing.name,
        vehicleTypeCode: editing.vehicleTypeCode,
        durationMonths: editing.durationMonths,
        price: Number(editing.price),
        maxSold: editing.maxSold ?? undefined,
        description: editing.description,
        isActive: editing.isActive !== false,
      });
    } else {
      form.resetFields();
      form.setFieldValue('isActive', true);
    }
  }, [open, editing, form]);

  const submit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={editing ? 'Sửa gói đăng ký' : 'Gói đăng ký mới'}
      onCancel={onCancel}
      onOk={submit}
      okText="Lưu"
      cancelText="Huỷ"
      confirmLoading={saving}
    >
      <Form form={form} layout="vertical">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0 16px' }}>
          <Form.Item name="name" label="Tên gói" rules={[{ required: true, whitespace: true, message: 'Nhập tên gói' }]}>
            <Input placeholder="Ví dụ: Gói xe máy 3 tháng" maxLength={100} />
          </Form.Item>

          <Form.Item name="code" label="Mã gói" rules={[{ required: true, whitespace: true, message: 'Nhập mã gói' }]}>
            <Input placeholder="VD: BIKE_3M" maxLength={50} />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Form.Item name="vehicleTypeCode" label="Loại xe" rules={[{ required: true, message: 'Chọn loại xe' }]}>
            <Select placeholder="Chọn loại xe" options={types.map((t) => ({ value: t.vehicleTypeCode || t.code, label: t.vehicleTypeName || t.name }))} />
          </Form.Item>

          <Form.Item name="durationMonths" label="Thời hạn (tháng)" rules={[{ required: true, message: 'Nhập thời hạn' }]}>
            <InputNumber style={{ width: '100%' }} min={1} max={36} step={1} />
          </Form.Item>

          <Form.Item name="price" label="Giá (VND)" rules={[{ required: true, message: 'Nhập giá' }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={10000} />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Đang bán" unCheckedChildren="Ẩn" />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea placeholder="Mô tả ngắn về gói (không bắt buộc)" rows={2} maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
