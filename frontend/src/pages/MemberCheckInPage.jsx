import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Input, Result, Row, Space, Upload, message } from 'antd';
import { InboxOutlined, RollbackOutlined, ScanOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import checkingService from '../services/checkingService';

const imageFields = [
  { key: 'front', label: 'Ảnh mặt trước xe' },
  { key: 'back', label: 'Ảnh mặt sau xe' },
  { key: 'left', label: 'Ảnh hông trái xe' },
  { key: 'right', label: 'Ảnh hông phải xe' },
  { key: 'driverFace', label: 'Ảnh mặt tài xế' },
];

const imageProps = {
  accept: '.jpg,.jpeg,.png,.webp',
  maxCount: 1,
  beforeUpload: (file) => {
    const validType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    const validSize = file.size <= 5 * 1024 * 1024;
    if (!validType) message.error('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP');
    if (!validSize) message.error('Ảnh không được vượt quá 5MB');
    return validType && validSize ? false : Upload.LIST_IGNORE;
  },
};

const getFile = (value) =>
  (Array.isArray(value) ? value[0] : value?.fileList?.[0])?.originFileObj;

export default function MemberCheckInPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const images = Object.fromEntries(imageFields.map(({ key }) => [key, getFile(values[key])]));
    setLoading(true);
    try {
      const res = await checkingService.memberCheckIn({
        qrToken: values.qrToken,
        currentPlateNumber: values.currentPlateNumber,
        entryGate: values.entryGate,
        images,
      });
      setTicket(res.data);
      message.success('Check-in thành viên thành công');
    } catch (err) {
      const code = err.response?.data?.code;
      const messages = {
        INVALID_QR_TOKEN: 'Mã QR không hợp lệ hoặc đã hết hạn.',
        INVALID_PLATE_NUMBER: 'Biển số hiện tại không khớp với thông tin member.',
        INVALID_ENTRY_GATE: 'Cổng vào không hợp lệ cho member này.',
        INVALID_IMAGE: 'Vui lòng cung cấp đủ 5 ảnh hợp lệ.',
        MEMBER_ALREADY_CHECKED_IN: 'Thành viên này đã check-in và chưa checkout.',
      };
      message.error(messages[code] || err.response?.data?.message || 'Check-in thành viên thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (ticket) {
    return (
      <Card title="Check-in thành viên" style={{ maxWidth: 720, margin: '0 auto' }}>
        <Result
          status="success"
          title="Check-in thành công"
          subTitle="Member đã được cập nhật trạng thái vào bãi thành công."
          extra={[
            <Card key="ticket" size="small" style={{ textAlign: 'left', background: '#f6ffed' }}>
              <Space direction="vertical" size={4}>
                <strong>Mã vé: {ticket.ticketCode || ticket.id || 'Đã tạo'}</strong>
                <span>Biển số: {ticket.plateNumber || '—'}</span>
                <span>Cổng vào: {ticket.entryGate || '—'}</span>
                <span>Thời gian vào: {ticket.entryTime || '—'}</span>
              </Space>
            </Card>,
            <Button key="new" type="primary" onClick={() => { setTicket(null); form.resetFields(); }}>
              Check-in tiếp
            </Button>,
            <Button key="back" icon={<RollbackOutlined />} onClick={() => navigate('/')}>
              Về trang tổng quan
            </Button>,
          ]}
        />
      </Card>
    );
  }

  return (
    <Card title="Check-in thành viên" style={{ maxWidth: 920, margin: '0 auto' }}>
      <Alert
        type="info"
        showIcon
        message="Check-in theo mã QR thành viên"
        description="Quét mã QR, xác nhận biển số và tải ảnh xác thực để hoàn tất check-in."
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="qrToken"
              label="Mã QR thành viên"
              rules={[{ required: true, whitespace: true, message: 'Nhập mã QR thành viên' }]}
            >
              <Input placeholder="Ví dụ: MEMBER-QR-001" prefix={<ScanOutlined />} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="currentPlateNumber"
              label="Biển số hiện tại"
              rules={[{ required: true, whitespace: true, message: 'Nhập biển số hiện tại' }]}
            >
              <Input placeholder="Ví dụ: 51A-123.45" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="entryGate"
              label="Cổng vào"
              rules={[{ required: true, whitespace: true, message: 'Nhập mã cổng vào' }]}
            >
              <Input placeholder="Ví dụ: GATE-A" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 8]}>
          {imageFields.map(({ key, label }) => (
            <Col xs={24} sm={12} md={8} key={key}>
              <Form.Item
                name={key}
                label={label}
                valuePropName="fileList"
                getValueFromEvent={(event) => event?.fileList}
                rules={[{ required: true, message: `Tải lên ${label.toLowerCase()}` }]}
              >
                <Upload.Dragger {...imageProps}>
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p className="ant-upload-text">Chọn ảnh</p>
                  <p className="ant-upload-hint">JPG, PNG, WEBP tối đa 5MB</p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading}>
            Thực hiện check-in
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
