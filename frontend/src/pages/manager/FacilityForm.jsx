import { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, TimePicker } from 'antd';
import dayjs from 'dayjs';

const TIME = 'HH:mm:ss';

const TITLE = {
  building: 'Toà nhà',
  floor: 'Tầng',
  zone: 'Khu',
  slot: 'Ô đỗ',
};

export default function FacilityForm({ open, type, mode, initial, categoryOptions, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    const value = { ...initial };
    if (type === 'building' && value.openTime) {
      value.openTime = dayjs(value.openTime, TIME);
      value.closeTime = dayjs(value.closeTime, TIME);
    }
    form.setFieldsValue(value);
  }, [open, initial, type, form]);

  const submit = async () => {
    const value = await form.validateFields();
    if (type === 'building') {
      value.openTime = value.openTime.format(TIME);
      value.closeTime = value.closeTime.format(TIME);
    }
    onSubmit(value);
  };

  return (
    <Modal
      open={open}
      title={`${mode === 'create' ? 'Thêm' : 'Sửa'} ${TITLE[type] || ''}`}
      okText="Lưu"
      cancelText="Huỷ"
      onOk={submit}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        {type === 'building' && (
          <>
            <Form.Item name="name" label="Tên toà nhà" rules={[{ required: true, message: 'Chưa nhập tên' }]}>
              <Input placeholder="Toà A" />
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ">
              <Input />
            </Form.Item>
            <Form.Item name="openTime" label="Giờ mở cửa" rules={[{ required: true, message: 'Chưa chọn giờ mở' }]}>
              <TimePicker format={TIME} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="closeTime" label="Giờ đóng cửa" rules={[{ required: true, message: 'Chưa chọn giờ đóng' }]}>
              <TimePicker format={TIME} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
              <Select options={[{ value: 'ACTIVE', label: 'Đang hoạt động' }, { value: 'CLOSED', label: 'Đóng cửa' }]} />
            </Form.Item>
          </>
        )}

        {type === 'floor' && (
          <>
            <Form.Item name="code" label="Mã tầng" rules={[{ required: true, message: 'Chưa nhập mã' }]}>
              <Input placeholder="B1" />
            </Form.Item>
            <Form.Item name="levelNo" label="Số tầng" rules={[{ required: true, message: 'Chưa nhập số tầng' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="-1" />
            </Form.Item>
            <Form.Item name="maxHeightCm" label="Chiều cao tối đa (cm)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="220" />
            </Form.Item>
            <Form.Item name="zoneCount" label="Số khu tối đa">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="4" />
            </Form.Item>
            <Form.Item name="allowCar" label="Nhận ô tô" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item name="allowMotorbike" label="Nhận xe máy" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item
              name="guestAllowed"
              label="Dành cho khách vãng lai"
              valuePropName="checked"
              initialValue={false}
              extra="Bật: tầng của khách vãng lai. Tắt: tầng của thành viên."
            >
              <Switch />
            </Form.Item>
          </>
        )}

        {type === 'zone' && (
          <>
            <Form.Item name="code" label="Mã khu" rules={[{ required: true, message: 'Chưa nhập mã' }]}>
              <Input placeholder="Z1" />
            </Form.Item>
            <Form.Item name="name" label="Tên khu">
              <Input />
            </Form.Item>
            <Form.Item
              name="allowedCategory"
              label="Loại xe"
              rules={[{ required: true, message: 'Chưa chọn loại xe' }]}
              extra="Chỉ hiện loại xe mà tầng cha cho phép"
            >
              <Select options={categoryOptions} />
            </Form.Item>
            <Form.Item name="powerPolicy" label="Nguồn năng lượng" rules={[{ required: true, message: 'Chưa chọn' }]}>
              <Select
                options={[
                  { value: 'PETROL_ONLY', label: 'Chỉ xe xăng' },
                  { value: 'ELECTRIC_ONLY', label: 'Chỉ xe điện' },
                  { value: 'MIXED', label: 'Hỗn hợp' },
                ]}
              />
            </Form.Item>
            <Form.Item name="slotCapacity" label="Sức chứa (số ô)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="20" />
            </Form.Item>
          </>
        )}

        {type === 'slot' && (
          <>
            <Form.Item name="code" label="Mã ô" rules={[{ required: true, message: 'Chưa nhập mã' }]}>
              <Input placeholder="B1-Z1-001" />
            </Form.Item>
            <Form.Item name="maxHeightCm" label="Chiều cao tối đa (cm)">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
