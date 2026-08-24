import { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, Tag, Space, Typography, Popconfirm, Descriptions, App, Input } from 'antd';
import { PlusOutlined, CloseCircleOutlined, EyeOutlined, QrcodeOutlined, ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import QRCode from 'react-qr-code';
import reservationService from '../services/reservationService';
import vehicleService from '../services/vehicleService';
import slotService from '../services/slotService';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors = {
  PENDING: 'orange', CONFIRMED: 'green', USED: 'blue', EXPIRED: 'default', CANCELLED: 'red',
};

const getActiveReservation = (reservations, vehicleId) =>
  reservations.some((reservation) => {
    const sameVehicle = String(reservation.vehicleId ?? reservation.id) === String(vehicleId);
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
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    }
  };

  const validateReservationDraft = (values) => {
    const vehicleId = values.vehicleId ?? selectedVehicleId;
    const vehicle = vehicles.find((item) => String(item.vehicleId) === String(vehicleId));
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!vehicleId || !vehicle) {
      return { field: 'vehicleId', message: 'Vui lòng chọn xe hợp lệ trước khi đặt chỗ.' };
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

    if (!values.startTime) {
      return { field: 'startTime', message: 'Vui lòng chọn thời gian bắt đầu.' };
    }

    if (!values.endTime) {
      return { field: 'endTime', message: 'Vui lòng chọn thời gian kết thúc.' };
    }

    if (values.endTime.isBefore(values.startTime) || values.endTime.isSame(values.startTime)) {
      return { field: 'endTime', message: 'Thời gian kết thúc phải sau thời gian bắt đầu.' };
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

    if (!vehicleId) {
      return;
    }

    if (vehicle && String(vehicle.status || '').toUpperCase() !== 'ACTIVE') {
      form.setFields([{ name: 'vehicleId', errors: ['Xe hiện không ở trạng thái ACTIVE. Vui lòng kiểm tra lại xe của bạn.'] }]);
      message.warning('Xe hiện không ở trạng thái ACTIVE.');
      return;
    }

    try {
      const res = await slotService.searchAvailable({});
      const available = (res.data?.result || []).filter((slot) => slot.available);
      setAvailableSlots(available);
    } catch (err) {
      setAvailableSlots([]);
      console.error('Failed to load available slots:', err);
      message.error('Không thể tải danh sách slot trống. Vui lòng thử lại sau.');
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
    const validation = validateReservationDraft(values);
    if (validation) {
      form.setFields([{ name: validation.field, errors: [validation.message] }]);
      message.warning(validation.message);
      return;
    }

    const vehicleId = values.vehicleId ?? selectedVehicleId;
    const payload = {
      slotId: Number(values.slotId),
      startTime: values.startTime.format('YYYY-MM-DDTHH:mm:ss'),
      endTime: values.endTime.format('YYYY-MM-DDTHH:mm:ss'),
    };

    setSubmitting(true);
    try {
      const res = await reservationService.createReservation(vehicleId, payload);
      const responseCode = res?.data?.code;
      const success = res?.data?.success === true || Boolean(res?.data?.result || res?.data?.id || res?.data?.message);

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
      if (code === 1050) {
        message.warning('Phiên đậu xe không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại thông tin xe / phiên đặt chỗ.');
        setModalOpen(false);
        form.resetFields();
        setSelectedVehicleId(null);
        setAvailableSlots([]);
        return;
      }

      if (code === 1066) {
        form.setFields([{ name: 'slotId', errors: ['Bạn chưa upload đủ ảnh xác nhận ra khỏi bãi.'] }]);
        message.error('Bạn chưa upload đủ ảnh xác nhận ra khỏi bãi.');
        return;
      }

      const status = err.response?.status;
      if (status === 400 || status === 500) {
        console.error('Reservation creation failed due to backend schema/data issue:', err);
        message.error('Hệ thống đang gặp lỗi dữ liệu, vui lòng thử lại sau hoặc liên hệ admin.');
        return;
      }

      const fallback = err.response?.data?.message || 'Đặt chỗ thất bại';
      message.error(fallback);
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
            setAvailableSlots([]);
            setSelectedVehicleId(null);
            setModalOpen(true);
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
          <Form.Item name="slotId" label="Chọn slot" rules={[{ required: true, message: 'Chọn slot!' }]}>
            <Select placeholder={selectedVehicleId ? 'Chọn slot trống' : 'Chọn xe trước'}>
              {availableSlots.map((s) => <Select.Option key={s.slotId} value={s.slotId}>{s.slotCode} - {s.floorCode} ({s.zoneCode}) [{s.buildingName}]</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="startTime" label="Thời gian bắt đầu" rules={[{ required: true, message: 'Chọn thời gian!' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endTime" label="Thời gian kết thúc" rules={[{ required: true, message: 'Chọn thời gian kết thúc!' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>
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
