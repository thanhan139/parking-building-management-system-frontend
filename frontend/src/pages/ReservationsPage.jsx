import { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, Tag, Space, Typography, Popconfirm, Descriptions, App, Input } from 'antd';
import { PlusOutlined, CloseCircleOutlined, EyeOutlined, QrcodeOutlined, ReloadOutlined, CopyOutlined } from '@ant-design/icons';
import QRCode from 'react-qr-code';
import reservationService from '../services/reservationService';
import vehicleService from '../services/vehicleService';
import slotService from '../services/slotService';
import { disabledPastDate, pastTimeDisabled } from '../utils/timeUtils';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors = {
  PENDING: 'orange', CONFIRMED: 'green', USED: 'blue', EXPIRED: 'default', CANCELLED: 'red',
};

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
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [qrModal, setQrModal] = useState(null); // { reservationId, token, expiresAt }
  const [qrLoading, setQrLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const countdownRef = useRef(null);

  const resolveTypeId = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.vehicleId === vehicleId);
    return vehicleTypes.find((vt) => vt.code === vehicle?.vehicleTypeCode)?.id;
  };

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

  const fetchVehicleTypes = async () => {
    try {
      const res = await vehicleService.getVehicleTypes();
      setVehicleTypes(res.data?.result || []);
    } catch (err) {}
  };

  const loadSlots = async (startTime = null, endTime = null, vehicleId = selectedVehicleId) => {
    try {
      const params = {};
      // Da chon xe ma khong suy ra duoc loai xe -> danh sach trong thay vi hien tat ca.
      const vtId = resolveTypeId(vehicleId);
      if (vehicleId && !vtId) {
        setAvailableSlots([]);
        return;
      }
      if (vtId) params.vehicleTypeId = vtId;
      if (startTime) params.startTime = startTime.format('YYYY-MM-DDTHH:mm:ss');
      if (endTime) params.endTime = endTime.format('YYYY-MM-DDTHH:mm:ss');
      const res = await slotService.searchAvailable(params);
      const list = (res.data?.result || []).filter((s) => s.available);
      setAvailableSlots(list);
      return list;
    } catch (err) {
      setAvailableSlots([]);
      return [];
    }
  };

  const validateReservationDraft = (values) => {
    if (!values.vehicleId) return { field: 'vehicleId', message: 'Chọn xe!' };
    if (!values.slotId) return { field: 'slotId', message: 'Chọn slot!' };
    if (!values.startTime) return { field: 'startTime', message: 'Chọn thời gian bắt đầu!' };
    if (!values.endTime) return { field: 'endTime', message: 'Chọn thời gian kết thúc!' };
    if (values.startTime.isBefore(dayjs())) {
      return { field: 'startTime', message: 'Không được chọn thời gian trong quá khứ!' };
    }
    if (values.endTime.isBefore(dayjs())) {
      return { field: 'endTime', message: 'Không được chọn thời gian trong quá khứ!' };
    }
    if (!values.endTime.isAfter(values.startTime)) {
      return { field: 'endTime', message: 'Thời gian kết thúc phải sau thời gian bắt đầu!' };
    }
    return null;
  };

  const handleVehicleChange = async (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    form.setFieldValue('slotId', null);
    await loadSlots(form.getFieldValue('startTime'), form.getFieldValue('endTime'), vehicleId);
  };

  const handleTimeChange = async () => {
    const st = form.getFieldValue('startTime');
    const et = form.getFieldValue('endTime');
    const currentSlot = form.getFieldValue('slotId');
    const list = await loadSlots(st, et);
    if (currentSlot && !list.some((s) => s.slotId === currentSlot)) {
      form.setFieldValue('slotId', null);
      message.info('Slot đang chọn không còn trống với khung giờ mới, vui lòng chọn lại.');
    }
  };

  useEffect(() => { fetchReservations(); fetchVehicles(); fetchVehicleTypes(); }, []);

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
    if (submitting) return;
    const validation = validateReservationDraft(values);
    if (validation) {
      form.setFields([{ name: validation.field, errors: [validation.message] }]);
      message.error(validation.message);
      return;
    }
    setSubmitting(true);
    try {
      const vtId = resolveTypeId(selectedVehicleId);
      const checkParams = {};
      if (vtId) checkParams.vehicleTypeId = vtId;
      if (values.startTime) checkParams.startTime = values.startTime.format('YYYY-MM-DDTHH:mm:ss');
      if (values.endTime) checkParams.endTime = values.endTime.format('YYYY-MM-DDTHH:mm:ss');
      const checkRes = await slotService.searchAvailable(checkParams);
      const stillFree = (checkRes.data?.result || []).some(
        (s) => s.slotId === values.slotId && s.available
      );
      if (!stillFree) {
        message.error('Slot này vừa có người đặt hoặc không còn trống. Danh sách đã được cập nhật, vui lòng chọn slot khác!');
        form.setFieldValue('slotId', null);
        await loadSlots(values.startTime, values.endTime);
        return;
      }
      const data = {
        slotId: values.slotId,
        startTime: values.startTime ? values.startTime.format('YYYY-MM-DDTHH:mm:ss') : null,
        endTime: values.endTime ? values.endTime.format('YYYY-MM-DDTHH:mm:ss') : null,
      };
      const res = await reservationService.createReservation(selectedVehicleId, data);
      message.success(res.data.message || 'Đặt chỗ thành công');
      setModalOpen(false);
      form.resetFields();
      fetchReservations();
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
          <Form.Item name="slotId" label="Chọn slot" rules={[{ required: true, message: 'Chọn slot!' }]}>
            <Select
              placeholder={selectedVehicleId ? 'Chọn slot trống' : 'Chọn xe trước'}
              disabled={!selectedVehicleId}
              notFoundContent="Không có slot trống phù hợp với xe của bạn"
              onDropdownVisibleChange={(open) => {
                if (open) loadSlots(form.getFieldValue('startTime'), form.getFieldValue('endTime'));
              }}
            >
              {availableSlots.map((s) => <Select.Option key={s.slotId} value={s.slotId}>{s.slotCode} - {s.floorCode} ({s.zoneCode}) [{s.buildingName}]</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="startTime" label="Thời gian bắt đầu" rules={[
            { required: true, message: 'Chọn thời gian!' },
            () => ({
              validator(_, value) {
                if (!value || !value.isBefore(dayjs())) return Promise.resolve();
                return Promise.reject(new Error('Không được chọn thời gian trong quá khứ!'));
              },
            }),
          ]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} disabledDate={disabledPastDate} disabledTime={pastTimeDisabled} onChange={handleTimeChange} />
          </Form.Item>
          <Form.Item name="endTime" label="Thời gian kết thúc" rules={[
            { required: true, message: 'Chọn thời gian!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value) return Promise.resolve();
                const st = getFieldValue('startTime');
                if (value.isBefore(dayjs())) return Promise.reject(new Error('Không được chọn thời gian trong quá khứ!'));
                if (st && !value.isAfter(st)) return Promise.reject(new Error('Phải sau thời gian bắt đầu!'));
                return Promise.resolve();
              },
            }),
          ]}>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabledDate={(d) => d && d.isBefore((form.getFieldValue('startTime') || dayjs()).startOf('day'))}
              disabledTime={pastTimeDisabled}
              onChange={handleTimeChange}
            />
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
