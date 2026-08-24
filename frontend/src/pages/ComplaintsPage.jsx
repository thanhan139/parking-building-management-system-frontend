import { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Modal, Select, Space, Table, Tag, Typography, Upload, App } from 'antd';
import { PlusOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import complaintService from '../services/complaintService';
import reservationService from '../services/reservationService';

const { Title, Text } = Typography;
const statusColors = { PENDING: 'gold', IN_PROGRESS: 'blue', RESOLVED: 'green', REJECTED: 'red', OVERTIME: 'volcano' };
const statusLabels = { PENDING: 'Đang chờ', IN_PROGRESS: 'Đang xử lý', RESOLVED: 'Đã giải quyết', REJECTED: 'Từ chối', OVERTIME: 'Quá hạn' };
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];

const responseList = (response) => response?.data?.result || response?.data || [];
const getId = (item) => item.id ?? item.complaintId;

function imageUploadProps(message) {
  return {
    accept: '.jpg,.jpeg,.png,.webp',
    multiple: true,
    maxCount: 5,
    beforeUpload: (file) => {
      if (!imageTypes.includes(file.type)) {
        message.error('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.');
        return Upload.LIST_IGNORE;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error('Mỗi ảnh không được vượt quá 5MB.');
        return Upload.LIST_IGNORE;
      }
      return false;
    },
  };
}

export default function ComplaintsPage() {
  const { message } = App.useApp();
  const [complaints, setComplaints] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [complaintResponse, reservationResponse] = await Promise.all([
        complaintService.getMine(),
        reservationService.getMyReservations(),
      ]);
      setComplaints(responseList(complaintResponse));
      setSessions(responseList(reservationResponse).filter((item) => item.status === 'USED'));
    } catch (error) {
      console.error('Failed to load member complaints:', error);
      message.error('Không thể tải danh sách khiếu nại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const submit = async (values) => {
    const files = (values.images || []).map((item) => item.originFileObj).filter(Boolean);
    if (!files.length) {
      form.setFields([{ name: 'images', errors: ['Vui lòng tải lên ít nhất 1 ảnh.'] }]);
      return;
    }
    setSubmitting(true);
    try {
      await complaintService.create({ title: values.title, description: values.description, sessionId: values.sessionId, images: files });
      message.success('Đã gửi khiếu nại.');
      setModalOpen(false);
      form.resetFields();
      await loadData();
    } catch (error) {
      console.error('Failed to create complaint:', error);
      const pendingLimit = error.response?.data?.message?.toLowerCase().includes('pending');
      message.error(pendingLimit ? 'Bạn đã có tối đa 5 khiếu nại đang chờ xử lý.' : 'Không thể gửi khiếu nại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (value) => <Text strong>{value}</Text> },
    { title: 'Phiên gửi xe', dataIndex: 'sessionId', key: 'sessionId', render: (value) => value || 'Không liên kết' },
    { title: 'Ngày gửi', dataIndex: 'createdAt', key: 'createdAt', render: (value) => value ? new Date(value).toLocaleString('vi-VN') : '-' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (value) => <Tag color={statusColors[value]}>{statusLabels[value] || value}</Tag> },
    { title: 'Nội dung', dataIndex: 'description', key: 'description', ellipsis: true },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Khiếu nại của tôi</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Tạo khiếu nại</Button>
        </Space>
      </div>
      <Alert type="info" showIcon message="Bạn có thể liên kết khiếu nại với một phiên đã hoàn tất hoặc gửi khiếu nại không liên kết." style={{ marginBottom: 16 }} />
      <Table rowKey={getId} columns={columns} dataSource={complaints} loading={loading} pagination={{ pageSize: 8 }} />

      <Modal title="Tạo khiếu nại" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} confirmLoading={submitting} okText="Gửi khiếu nại" cancelText="Hủy" width={620}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Nhập tiêu đề khiếu nại.' }]}>
            <Input maxLength={200} placeholder="Ví dụ: Sai thông tin phí gửi xe" />
          </Form.Item>
          <Form.Item name="description" label="Nội dung" rules={[{ required: true, message: 'Nhập nội dung khiếu nại.' }]}>
            <Input.TextArea rows={5} maxLength={2000} showCount placeholder="Mô tả chi tiết vấn đề bạn gặp phải" />
          </Form.Item>
          <Form.Item name="sessionId" label="Phiên gửi xe đã hoàn tất (không bắt buộc)">
            <Select allowClear placeholder="Không liên kết phiên gửi xe">
              {sessions.map((session) => <Select.Option key={session.sessionId || session.id} value={session.sessionId || session.id}>{session.ticketCode || `Session #${session.sessionId || session.id}`} - {session.plateNumber || ''}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="images" label="Ảnh minh chứng (1-5 ảnh)" rules={[{ required: true, message: 'Tải lên ít nhất 1 ảnh.' }]} valuePropName="fileList" getValueFromEvent={(event) => event?.fileList}>
            <Upload {...imageUploadProps(message)} listType="picture-card"><button type="button" style={{ border: 0, background: 'none' }}><UploadOutlined /><div>Thêm ảnh</div></button></Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
