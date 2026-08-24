import { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Select, Tag, Space, Typography, Popconfirm, Descriptions, App, Input, Alert, Card, Spin } from 'antd';
import { PlusOutlined, CloseCircleOutlined, EyeOutlined, QrcodeOutlined, ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import QRCode from 'react-qr-code';
import reservationService from '../services/reservationService';
import vehicleService from '../services/vehicleService';
import slotService from '../services/slotService';
import subscriptionService from '../services/subscriptionService';
import { disabledPastDate, pastTimeDisabled } from '../utils/timeUtils';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors = {
  PENDING: 'orange', CONFIRMED: 'green', USED: 'blue', EXPIRED: 'default', CANCELLED: 'red',
};

const getActiveReservation = (reservations, vehicleId) =>
  reservations.some((reservation) => {
    const sameVehicle = reservation.vehicleId != null && String(reservation.vehicleId) === String(vehicleId);
    const activeStatus = ['PENDING', 'CONFIRMED', 'USED'].includes(reservation.status);
    return sameVehicle && activeStatus;
  });

export default function ReservationsPage() {
  const { message } = App.useApp();
  const [reservations, setReservations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [form] = Form.useForm();
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [qrModal, setQrModal] = useState(null); // { reservationId, token, expiresAt }
  const [qrLoading, setQrLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const countdownRef = useRef(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await reservationService.getMyReservations();
      setReservations(res.data?.result || []);
    } catch (err) {
      message.error('Không thể tải danh sách đặt chỗ');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await vehicleService.getMyVehicles();
      setVehicles(res.data?.result || []);
    } catch (err) {}
  };

  const validateReservationDraft = (values) => {
    const vehicleId = values.vehicleId ?? selectedVehicleId;
    const vehicle = vehicles.find((item) => String(item.vehicleId) === String(vehicleId));
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!vehicleId || !vehicle) {
      return { field: 'vehicleId', message: 'Vui lòng chọn xe hợp lệ trước khi đặt chỗ.' };
    }

    if (!activeSubscription || String(activeSubscription.status || '').toUpperCase() !== 'ACTIVE') {
      return { field: 'vehicleId', message: 'Xe này chưa có subscription ACTIVE phù hợp. Vui lòng đăng ký hoặc gia hạn gói trước.' };
    }

    const vehicleTypeMatches = [vehicle.vehicleTypeId, vehicle.vehicleTypeCode].filter(Boolean)
      .some((value) => [activeSubscription.vehicleTypeId, activeSubscription.vehicleTypeCode, activeSubscription.plan?.vehicleTypeId, activeSubscription.plan?.vehicleTypeCode].filter(Boolean)
        .some((subscriptionType) => String(subscriptionType) === String(value)));
    if (!vehicleTypeMatches) {
      return { field: 'vehicleId', message: 'Loại xe không phù hợp với subscription ACTIVE đang áp dụng.' };
    }

    const vehicleStatus = String(vehicle.status || '').toUpperCase();
    if (vehicleStatus && vehicleStatus !== 'ACTIVE') {
      return { field: 'vehicleId', message: 'Xe hiện không ở trạng thái ACTIVE. Vui lòng kiểm tra lại xe của bạn.' };
    }

    const ownerId = vehicle.userId ?? vehicle.ownerId ?? vehicle.driverId;
    if (currentUser?.userId && ownerId && String(ownerId) !== String(currentUser.userId)) {
      return { field: 'vehicleId', message: 'Bạn không có quyền đặt chỗ cho xe này.' };
    }

    if (!values.slotId) {
      return { field: 'slotId', message: 'Vui lòng chọn vị trí đỗ xe.' };
    }

    const slot = availableSlots.find((item) => String(item.slotId) === String(values.slotId));
    if (!slot || slot.available === false) {
      return { field: 'slotId', message: 'Slot đã không còn trống. Vui lòng chọn vị trí khác.' };
    }

    if (getActiveReservation(reservations, vehicleId)) {
      return { field: 'vehicleId', message: 'Xe này đang có một reservation đang hoạt động. Vui lòng hoàn tất hoặc hủy đặt chỗ hiện tại trước.' };
    }
    return null;
  };

  const handleVehicleChange = async (vehicleId) => {
    const vehicle = vehicles.find((item) => String(item.vehicleId) === String(vehicleId));
    setSelectedVehicleId(vehicleId);
    form.setFieldsValue({ slotId: undefined });
    setAvailableSlots([]);
    setActiveSubscription(null);

    if (!vehicleId) {
      return;
    }

    if (vehicle && String(vehicle.status || '').toUpperCase() !== 'ACTIVE') {
      form.setFields([{ name: 'vehicleId', errors: ['Xe hiện không ở trạng thái ACTIVE. Vui lòng kiểm tra lại xe của bạn.'] }]);
      message.warning('Xe hiện không ở trạng thái ACTIVE.');
      return;
    }

    setSubscriptionLoading(true);
    try {
      const subscriptionResponse = await subscriptionService.getActiveSubscription(vehicleId);
      const subscription = subscriptionResponse.data?.result || subscriptionResponse.data;
      const subscriptionStatus = String(subscription?.status || '').toUpperCase();
      const vehicleTypeMatches = [vehicle?.vehicleTypeId, vehicle?.vehicleTypeCode].filter(Boolean)
        .some((value) => [subscription?.vehicleTypeId, subscription?.vehicleTypeCode, subscription?.plan?.vehicleTypeId, subscription?.plan?.vehicleTypeCode].filter(Boolean)
          .some((subscriptionType) => String(subscriptionType) === String(value)));

      if (!subscription || subscriptionStatus !== 'ACTIVE') {
        form.setFields([{ name: 'vehicleId', errors: ['Xe này chưa có subscription ACTIVE.'] }]);
        message.warning('Xe này chưa có subscription ACTIVE.');
        return;
      }
      if (!vehicleTypeMatches) {
        form.setFields([{ name: 'vehicleId', errors: ['Subscription không phù hợp với loại xe đã chọn.'] }]);
        message.warning('Subscription không phù hợp với loại xe đã chọn.');
        return;
      }

      setActiveSubscription(subscription);
      const subscriptionVehicleTypeId = subscription.vehicleTypeId || subscription.plan?.vehicleTypeId;
      const res = await slotService.searchAvailable(subscriptionVehicleTypeId ? { vehicleTypeId: subscriptionVehicleTypeId } : {});
      const available = (res.data?.result || []).filter((slot) => slot.available && (!subscriptionVehicleTypeId || String(slot.vehicleTypeId || subscriptionVehicleTypeId) === String(subscriptionVehicleTypeId)));
      setAvailableSlots(available);
    } catch (err) {
      setAvailableSlots([]);
      console.error('Failed to load available slots:', err);
      const code = err.response?.data?.code;
      message.error(code === 'SUBSCRIPTION_NOT_ACTIVE' ? 'Xe này chưa có subscription ACTIVE.' : 'Không thể tải subscription hoặc slot trống. Vui lòng thử lại sau.');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); fetchVehicles(); }, []);

  const startCountdown = (expiresAt) => {
    clearInterval(countdownRef.current);
    const tick = () => {
      const secs = Math.max(0, Math.round((new Date(expiresAt) - Date.now()) / 1000));
      setCountdown(secs);
      if (secs === 0) clearInterval(countdownRef.current);
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);
  };

  const handleCreateQr = async (reservationId) => {
    setQrLoading(true);
    try {
      const res = await reservationService.createQrToken(reservationId);
      const data = res.data;
      setQrModal({ reservationId, token: data.token, expiresAt: data.expiresAt });
      startCountdown(data.expiresAt);
    } catch (err) {
      const code = err.response?.data?.code;
      const msgs = {
        1031: 'Xe chưa có subscription active.',
        1061: 'Xe của bạn đang bị khóa hoặc chưa kích hoạt, không thể check-in.',
        1062: 'Chưa đến giờ hoặc đã quá giờ check-in của reservation này.',
        RESERVATION_NOT_IN_TIME_WINDOW: 'Reservation chưa nằm trong thời hạn được phép check-in.',
        1032: 'Reservation không hợp lệ.',
      };
      message.error(msgs[code] || err.response?.data?.message || 'Không thể tạo mã QR');
    } finally {
      setQrLoading(false);
    }
  };

  const handleCloseQr = () => {
    clearInterval(countdownRef.current);
    setQrModal(null);
    setCountdown(0);
  };

  const handleSubmit = async (values) => {
    if (submitting) return;
    const validation = validateReservationDraft(values);
    if (validation) {
      form.setFields([{ name: validation.field, errors: [validation.message] }]);
      message.error(validation.message);
      return;
    }

    const vehicleId = values.vehicleId ?? selectedVehicleId;
    const payload = {
      slotId: Number(values.slotId),
    };

    setSubmitting(true);
    try {
      const res = await reservationService.createReservation(vehicleId, payload);
      const responseCode = res?.data?.code;
      const success = res?.data?.success === true;

      if (responseCode === 1050) {
        message.warning('Phiên đậu xe không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại thông tin xe / phiên đặt chỗ.');
        setModalOpen(false);
        form.resetFields();
        setSelectedVehicleId(null);
        setAvailableSlots([]);
        return;
      }

      if (responseCode === 1066) {
        form.setFields([{ name: 'slotId', errors: ['Bạn chưa upload đủ ảnh xác nhận ra khỏi bãi.'] }]);
        message.error('Bạn chưa upload đủ ảnh xác nhận ra khỏi bãi.');
        return;
      }

      if (responseCode === 'SUBSCRIPTION_NOT_ACTIVE') {
        form.setFields([{ name: 'vehicleId', errors: ['Xe này chưa có subscription ACTIVE phù hợp.'] }]);
        message.error('Xe này chưa có subscription ACTIVE phù hợp.');
        return;
      }

      if (success) {
        message.success(res.data?.message || 'Đặt chỗ thành công');
        setModalOpen(false);
        form.resetFields();
        setSelectedVehicleId(null);
        setAvailableSlots([]);
        await fetchReservations();
        return;
      }

      message.error('Hệ thống đang gặp lỗi dữ liệu, vui lòng thử lại sau hoặc liên hệ admin.');
    } catch (err) {
      const code = err.response?.data?.code;
      const msgs = {
        1032: 'Đặt chỗ không tồn tại hoặc đã bị xử lý.',
        1033: 'Xe này đang có một đặt chỗ chưa hoàn tất (chưa check-in/hủy). Vui lòng hoàn tất hoặc hủy nó trước!',
        1034: 'Không còn slot phù hợp cho xe của bạn trong khung giờ này.',
        1043: 'Slot này vừa có người đặt hoặc không phù hợp với xe của bạn. Danh sách slot đã được cập nhật, vui lòng chọn slot khác!',
      };
      if ([1032, 1033, 1034, 1043].includes(code)) {
        message.error(msgs[code]);
        form.setFieldValue('slotId', null);
        await loadSlots(values.startTime, values.endTime);
      } else {
        message.error(err.response?.data?.message || 'Đặt chỗ thất bại');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await reservationService.cancelReservation(id);
      message.success('Hủy đặt chỗ thành công');
      fetchReservations();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể hủy');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Biển số', dataIndex: 'plateNumber', key: 'plateNumber', render: (t) => <Tag>{t}</Tag> },
    { title: 'Slot', dataIndex: 'slotCode', key: 'slotCode', render: (t, r) => `${t || '-'} (${r.zoneCode || ''})` },
    { title: 'Tầng', dataIndex: 'floorCode', key: 'floorCode' },
    { title: 'Bắt đầu', dataIndex: 'startTime', key: 'startTime', render: (t) => t ? dayjs(t).format('DD/MM/YYYY HH:mm') : '-' },
    { title: 'Kết thúc', dataIndex: 'endTime', key: 'endTime', render: (t) => t ? dayjs(t).format('DD/MM/YYYY HH:mm') : '-' },
    { title: 'Subscription', dataIndex: 'hasActiveSubscription', key: 'hasActiveSubscription', render: (v) => v ? <Tag color="green">Có</Tag> : <Tag color="orange">Không</Tag> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (t) => <Tag color={statusColors[t]}>{t}</Tag> },
    {
      title: 'Thao tác', key: 'action', width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setDetailModal(record)} />
          {record.status === 'CONFIRMED' && (
            <Button
              type="link"
              icon={<QrcodeOutlined />}
              loading={qrLoading}
              onClick={() => handleCreateQr(record.id)}
              title="Tạo mã QR check-in"
            />
          )}
          {['PENDING', 'CONFIRMED'].includes(record.status) && (
            <Popconfirm title="Hủy đặt chỗ này?" onConfirm={() => handleCancel(record.id)}>
              <Button type="link" danger icon={<CloseCircleOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Đặt chỗ đỗ xe</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setSelectedVehicleId(null);
            setActiveSubscription(null);
            setAvailableSlots([]);
            setModalOpen(true);
            loadSlots();
          }}
        >
          Đặt chỗ mới
        </Button>
      </div>
      <Table columns={columns} dataSource={reservations} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title="Đặt chỗ mới"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Đặt chỗ"
        cancelText="Hủy"
        width={600}
        confirmLoading={submitting}
        okButtonProps={{ disabled: submitting }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="vehicleId" label="Chọn xe" rules={[{ required: true, message: 'Chọn xe!' }]}>
            <Select placeholder="Chọn xe" onChange={handleVehicleChange}>
              {vehicles.map((v) => <Select.Option key={v.vehicleId} value={v.vehicleId}>{v.plateNumber} - {v.vehicleTypeName || 'N/A'}</Select.Option>)}
            </Select>
          </Form.Item>
          {selectedVehicleId && (
            <Spin spinning={subscriptionLoading}>
              {activeSubscription ? (
                <Card size="small" title="Subscription đang áp dụng" style={{ marginBottom: 16, background: '#f6ffed' }}>
                  <Space direction="vertical" size={4}>
                    <span><strong>Tên gói:</strong> {activeSubscription.planName || activeSubscription.plan?.name || activeSubscription.name || '-'}</span>
                    <span><strong>Loại vehicle:</strong> {activeSubscription.vehicleTypeName || activeSubscription.plan?.vehicleTypeName || activeSubscription.vehicleTypeCode || activeSubscription.plan?.vehicleTypeCode || '-'}</span>
                    <span><strong>Ngày bắt đầu:</strong> {activeSubscription.startDate ? dayjs(activeSubscription.startDate).format('DD/MM/YYYY') : '-'}</span>
                    <span><strong>Ngày kết thúc:</strong> {activeSubscription.endDate ? dayjs(activeSubscription.endDate).format('DD/MM/YYYY') : '-'}</span>
                  </Space>
                </Card>
              ) : (
                <Alert type="warning" showIcon message="Xe chưa có subscription ACTIVE phù hợp" style={{ marginBottom: 16 }} />
              )}
            </Spin>
          )}
          <Form.Item name="slotId" label="Chọn slot" rules={[{ required: true, message: 'Chọn slot!' }]}>
            <Select disabled={!activeSubscription || subscriptionLoading} placeholder={selectedVehicleId ? 'Chọn slot trống' : 'Chọn xe trước'}>
              {availableSlots.map((s) => <Select.Option key={s.slotId} value={s.slotId}>{s.slotCode} - {s.floorCode} ({s.zoneCode}) [{s.buildingName}]</Select.Option>)}
            </Select>
          </Form.Item>
          <Alert
            type="info"
            showIcon
            message="Thời hạn reservation lấy tự động từ subscription"
            description="Backend sẽ sử dụng ngày bắt đầu lúc 00:00 và đầu ngày kế tiếp sau ngày kết thúc của subscription."
          />
        </Form>
      </Modal>

      <Modal title="Chi tiết đặt chỗ" open={!!detailModal} onCancel={() => setDetailModal(null)} footer={null} width={600}>
        {detailModal && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">{detailModal.id}</Descriptions.Item>
            <Descriptions.Item label="Biển số">{detailModal.plateNumber}</Descriptions.Item>
            <Descriptions.Item label="Slot">{detailModal.slotCode} - {detailModal.zoneCode} ({detailModal.floorCode})</Descriptions.Item>
            <Descriptions.Item label="Bắt đầu">{detailModal.startTime ? dayjs(detailModal.startTime).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Kết thúc">{detailModal.endTime ? dayjs(detailModal.endTime).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Subscription">{detailModal.hasActiveSubscription ? 'Có' : 'Không'}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={statusColors[detailModal.status]}>{detailModal.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Ghi chú">{detailModal.message || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Mã QR Check-in"
        open={!!qrModal}
        onCancel={handleCloseQr}
        footer={null}
        width={480}
      >
        {qrModal && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 13,
              color: '#666',
              marginBottom: 12,
            }}>
              Quét mã QR này bằng camera để staff xác nhận check-in
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              background: '#fff',
              padding: 18,
              borderRadius: 12,
              border: '1px solid #f0f0f0',
              marginBottom: 16,
            }}>
              <QRCode
                value={qrModal.token}
                size={220}
                bgColor="#ffffff"
                fgColor="#111827"
                level="H"
              />
            </div>
            <div style={{ marginBottom: 12, fontSize: 12, color: '#666' }}>
              Hoặc copy token bên dưới nếu cần dùng thủ công
            </div>
            <Input.TextArea
              value={qrModal.token}
              readOnly
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ fontFamily: 'monospace', fontSize: 13, marginBottom: 12 }}
            />
            <Space style={{ marginBottom: 16 }}>
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(qrModal.token);
                  message.success('Đã copy token');
                }}
              >
                Copy token
              </Button>
            </Space>
            <div style={{ marginBottom: 16 }}>
              {countdown > 0 ? (
                <Tag color={countdown <= 30 ? 'red' : 'blue'} style={{ fontSize: 15, padding: '4px 12px' }}>
                  Hết hạn sau: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                </Tag>
              ) : (
                <Tag color="red" style={{ fontSize: 15, padding: '4px 12px' }}>Token đã hết hạn</Tag>
              )}
            </div>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              loading={qrLoading}
              onClick={() => handleCreateQr(qrModal.reservationId)}
            >
              Tạo token mới
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
