import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Input, Modal, Result, Row, Space, Upload, message } from 'antd';
import { DeleteOutlined, InboxOutlined, RollbackOutlined, ScanOutlined, SendOutlined } from '@ant-design/icons';
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
  previewFile: (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
  }),
  onRemove: (file) => {
    if (file?.preview && String(file.preview).startsWith('blob:')) {
      URL.revokeObjectURL(file.preview);
    }
  },
  beforeUpload: (file) => {
    const validType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    const validSize = file.size <= 5 * 1024 * 1024;
    if (!validType) message.error('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP');
    if (!validSize) message.error('Ảnh không được vượt quá 5MB');
    if (validType && validSize && !file.preview) {
      file.preview = URL.createObjectURL(file);
    }
    return validType && validSize ? false : Upload.LIST_IGNORE;
  },
};

const getPreviewSrc = (file) => file.thumbUrl || file.url || file.preview;

const getFile = (value) =>
  (Array.isArray(value) ? value[0] : value?.fileList?.[0])?.originFileObj;

export default function MemberCheckInPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const navigate = useNavigate();

  const openImagePreview = (src, name) => {
    if (!src) return;
    setPreviewImage(src);
    setPreviewTitle(name || 'Xem ảnh');
    setPreviewOpen(true);
  };

  const renderUploadItem = (_, file, __, actions) => {
    const src = getPreviewSrc(file);
    return (
      <div style={{ width: '100%', border: '1px solid #f0f0f0', borderRadius: 8, padding: 8, background: '#fff', textAlign: 'center' }}>
        {src ? (
          <img
            src={src}
            alt={file.name}
            onClick={() => openImagePreview(src, file.name)}
            style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6, marginBottom: 8, cursor: 'zoom-in' }}
          />
        ) : null}
        <div style={{ fontSize: 12, lineHeight: 1.4, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.name}>{file.name}</div>
        <Space size={4}>
          <Button type="text" size="small" onClick={() => openImagePreview(src, file.name)} disabled={!src}>
            Xem rõ
          </Button>
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={actions.remove}>
            Xóa
          </Button>
        </Space>
      </div>
    );
  };

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
      setTicket(res.data?.result || res.data);
      message.success('Check-in thành viên thành công');
    } catch (err) {
      const code = err.response?.data?.code;
      const messages = {
        QR_TOKEN_NOT_EXISTED: 'Mã QR không tồn tại.',
        QR_TOKEN_EXPIRED: 'Mã QR đã hết hạn. Vui lòng tạo mã QR mới.',
        QR_TOKEN_ALREADY_USED: 'Mã QR này đã được sử dụng. Vui lòng tạo mã QR mới.',
        PLATE_MISMATCH: 'Biển số hiện tại không khớp với reservation.',
        SLOT_NOT_AVAILABLE: 'Slot không còn sẵn sàng. Vui lòng kiểm tra lại reservation.',
        VEHICLE_NOT_ACTIVE: 'Vehicle chưa ACTIVE, không thể check-in.',
        SUBSCRIPTION_NOT_ACTIVE: 'Subscription của vehicle chưa ACTIVE.',
        RESERVATION_ACTIVE_EXISTS: 'Vehicle đang có parking session hoặc reservation đang hoạt động.',
      };
      if (err.response?.status === 400 || err.response?.status === 500) {
        console.error('Member check-in failed:', err);
        message.error('Hệ thống đang gặp lỗi dữ liệu, vui lòng thử lại sau hoặc liên hệ admin.');
      } else {
        message.error(messages[code] || err.response?.data?.message || 'Check-in thành viên thất bại');
      }
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
                getValueFromEvent={(event) => event?.fileList || []}
                rules={[{ required: true, message: `Tải lên ${label.toLowerCase()}` }]}
              >
                <Upload
                  {...imageProps}
                  listType="text"
                  showUploadList={{ showPreviewIcon: false, showRemoveIcon: false }}
                  itemRender={renderUploadItem}
                  style={{ width: 180 }}
                >
                  <Button size="small" icon={<InboxOutlined />}>Chọn ảnh</Button>
                </Upload>
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

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
      >
        <img src={previewImage} alt={previewTitle} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
      </Modal>
    </Card>
  );
}
