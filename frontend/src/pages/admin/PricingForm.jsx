import { useEffect } from 'react';
import { Alert, DatePicker, Divider, Form, InputNumber, Modal, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';
import { CATEGORY, CUSTOMER } from './pricingLabels';

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

const options = (map) => Object.entries(map).map(([value, label]) => ({ value, label }));

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

export default function PricingForm({ open, onCancel, onSubmit, sua }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    if (!sua) { form.resetFields(); return; }
    form.setFieldsValue({
      ...sua,
      overnightHour: sua.overnightHour ? dayjs(sua.overnightHour, 'HH:mm:ss') : null,
      effectiveFrom: sua.effectiveFrom ? dayjs(sua.effectiveFrom) : null,
      effectiveTo: sua.effectiveTo ? dayjs(sua.effectiveTo) : null,
    });
  }, [open, sua, form]);

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
      title={sua ? `Sửa biểu giá #${sua.id}` : 'Biểu giá mới'}
      okText={sua ? 'Lưu' : 'Tạo'}
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
        message={sua ? 'Chỉ sửa được biểu giá chưa tới lịch' : 'Không sửa được biểu giá đã chạy'}
        description={sua
          ? 'Biểu giá này chưa tới ngày hiệu lực nên còn sửa được. Tới ngày rồi thì nó thành bằng chứng số tiền đã thu, chỉ có thể tạo dòng mới đè lên.'
          : 'Biểu giá là bằng chứng số tiền đã thu. Muốn đổi giá thì tạo dòng mới — dòng đang chạy tự đóng lại tại ngày hiệu lực mới.'}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          vehicleCategory: 'CAR',
          customerType: 'GUEST',
          firstBlockHours: 2,
          overnightHour: dayjs('07:00:00', 'HH:mm:ss'),
          effectiveFrom: dayjs().add(1, 'day').startOf('day'),
        }}
      >
        <div style={GRID}>
          <Form.Item name="vehicleCategory" label="Loại xe" rules={[{ required: true }]}>
            <Select options={options(CATEGORY)} />
          </Form.Item>
          <Form.Item name="customerType" label="Loại khách" rules={[{ required: true }]}>
            <Select options={options(CUSTOMER)} />
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
