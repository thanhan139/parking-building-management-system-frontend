import { Alert, DatePicker, Divider, Form, InputNumber, Modal, Select, TimePicker } from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import vehicleService from '../../services/vehicleService';
import { CUSTOMER, TYPE_LABELS } from './pricingLabels';

const TIME_FIELDS = [
  { name: 'firstBlockHours', label: 'Số giờ khối đầu', required: true, min: 1 },
  { name: 'firstBlockPrice', label: 'Giá khối đầu (đ)', required: true },
  { name: 'blockHours', label: 'Số giờ mỗi khối tiếp', hint: 'để trống = không tính thêm' },
  { name: 'blockPrice', label: 'Giá mỗi khối tiếp (đ)', hint: 'để trống = không tính thêm' },
  { name: 'dailyCap', label: 'Tối đa thu mỗi ngày (đ)', hint: 'để trống = không chặn trần' },
];

const MANUAL_FIELDS = [
  { name: 'lostTicketFee', label: 'Mất thẻ (đ)', required: true },
  { name: 'overstayFeePerHour', label: 'Quá giờ, mỗi giờ (đ)', required: true },
  { name: 'wrongZoneFee', label: 'Đỗ sai khu (đ)', required: true },
];

const GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 16px' };

function NumberFields({ fields }) {
  return (
    <div style={GRID}>
      {fields.map((field) => (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          extra={field.hint}
          rules={field.required ? [{ required: true, message: 'Bắt buộc' }] : []}
        >
          <InputNumber style={{ width: '100%' }} min={field.min ?? 0} step={1000} />
        </Form.Item>
      ))}
    </div>
  );
}

export default function PricingForm({ open, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const [vehicleTypes, setVehicleTypes] = useState([]);

  useEffect(() => {
    if (!open) return;
    vehicleService
      .getVehicleTypes()
      .then((res) => setVehicleTypes(res.data?.result || []))
      .catch(() => setVehicleTypes([]));
  }, [open]);

  const submit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    if (values.overnightFee && values.dailyFee) {
      form.setFields([{ name: 'dailyFee', errors: ['Chỉ được bật MỘT loại phụ phí tự động'] }]);
      return;
    }

    await onSubmit({
      ...values,
      overnightHour: values.overnightHour ? values.overnightHour.format('HH:mm:ss') : null,
      effectiveFrom: values.effectiveFrom.format('YYYY-MM-DDTHH:mm:ss'),
      effectiveTo: values.effectiveTo ? values.effectiveTo.format('YYYY-MM-DDTHH:mm:ss') : null,
    });
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title="Biểu giá mới"
      okText="Tạo"
      cancelText="Thôi"
      width={720}
      onCancel={onCancel}
      onOk={submit}
      destroyOnHidden
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Không sửa được biểu giá cũ"
        description="Biểu giá là bằng chứng số tiền đã thu. Muốn đổi giá thì tạo dòng mới — dòng đang chạy tự đóng lại tại ngày hiệu lực mới."
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          customerType: 'GUEST',
          firstBlockHours: 2,
          overnightHour: dayjs('07:00:00', 'HH:mm:ss'),
          effectiveFrom: dayjs().add(1, 'day').startOf('day'),
        }}
      >
        <div style={GRID}>
          <Form.Item name="vehicleTypeId" label="Loại xe" rules={[{ required: true, message: 'Chọn loại xe!' }]}>
            <Select
              placeholder="Chọn loại xe"
              options={vehicleTypes.map((vt) => ({
                value: vt.id,
                label: TYPE_LABELS[vt.code] || vt.name || vt.code,
              }))}
            />
          </Form.Item>
          <Form.Item name="customerType" label="Loại khách" rules={[{ required: true }]}>
            <Select options={Object.entries(CUSTOMER).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
        </div>

        <Divider orientation="left" plain>Tiền theo thời gian</Divider>
        <NumberFields fields={TIME_FIELDS} />

        <Divider orientation="left" plain>Phụ phí tự động — chỉ được chọn MỘT</Divider>
        <div style={GRID}>
          <Form.Item name="overnightHour" label="Mốc qua đêm">
            <TimePicker style={{ width: '100%' }} format="HH:mm:ss" />
          </Form.Item>
          <Form.Item name="overnightFee" label="Tiền mỗi đêm (đ)">
            <InputNumber style={{ width: '100%' }} min={0} step={1000} />
          </Form.Item>
          <Form.Item name="dailyFee" label="Phụ phí theo ngày (đ)" extra="bật cái này thì bỏ trống qua đêm">
            <InputNumber style={{ width: '100%' }} min={0} step={1000} />
          </Form.Item>
        </div>

        <Divider orientation="left" plain>Phụ phí staff tự bấm</Divider>
        <NumberFields fields={MANUAL_FIELDS} />

        <Divider orientation="left" plain>Thời gian áp dụng</Divider>
        <div style={GRID}>
          <Form.Item
            name="effectiveFrom"
            label="Hiệu lực từ"
            extra="sớm nhất là ngày mai"
            rules={[{ required: true, message: 'Bắt buộc' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="DD/MM/YYYY HH:mm"
              disabledDate={(current) => current && current < dayjs().endOf('day')}
            />
          </Form.Item>
          <Form.Item name="effectiveTo" label="Đến" extra="để trống = chạy tới khi có giá mới">
            <DatePicker style={{ width: '100%' }} showTime format="DD/MM/YYYY HH:mm" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
