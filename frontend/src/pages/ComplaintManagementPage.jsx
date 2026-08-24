import { useEffect, useState } from 'react';
import { Alert, App, Button, Select, Table, Tag, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import complaintService from '../services/complaintService';

const { Title, Text } = Typography;
const statuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'OVERTIME'];
const statusColors = { PENDING: 'gold', IN_PROGRESS: 'blue', RESOLVED: 'green', REJECTED: 'red', OVERTIME: 'volcano' };
const statusLabels = { PENDING: 'Đang chờ', IN_PROGRESS: 'Đang xử lý', RESOLVED: 'Đã giải quyết', REJECTED: 'Từ chối', OVERTIME: 'Quá hạn' };
const responseList = (response) => response?.data?.result || response?.data || [];
const getId = (item) => item.id ?? item.complaintId;

export default function ComplaintManagementPage() {
  const { message } = App.useApp();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintService.getAll();
      setComplaints(responseList(response));
    } catch (error) {
      console.error('Failed to load complaints:', error);
      message.error('Không thể tải danh sách khiếu nại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComplaints(); }, []);

  const updateStatus = async (complaint, status) => {
    const complaintId = getId(complaint);
    setUpdatingId(complaintId);
    try {
      await complaintService.updateStatus(complaintId, status);
      message.success('Đã cập nhật trạng thái khiếu nại.');
      await loadComplaints();
    } catch (error) {
      console.error('Failed to update complaint status:', error);
      message.error('Không thể cập nhật trạng thái khiếu nại.');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    { title: 'ID', key: 'id', width: 70, render: (_, record) => getId(record) },
    { title: 'Người gửi', key: 'user', render: (_, record) => record.userName || record.fullName || record.user?.fullName || record.userId || '-' },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', render: (value) => <Text strong>{value}</Text> },
    { title: 'Phiên', dataIndex: 'sessionId', key: 'sessionId', render: (value) => value || 'Không liên kết' },
    { title: 'Nội dung', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Ngày gửi', dataIndex: 'createdAt', key: 'createdAt', render: (value) => value ? new Date(value).toLocaleString('vi-VN') : '-' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (value) => <Tag color={statusColors[value]}>{statusLabels[value] || value}</Tag> },
    {
      title: 'Cập nhật', key: 'update', width: 190, render: (_, record) => (
        <Select
          value={record.status}
          disabled={updatingId === getId(record)}
          loading={updatingId === getId(record)}
          style={{ width: 175 }}
          onChange={(status) => updateStatus(record, status)}
          options={statuses.map((status) => ({ value: status, label: statusLabels[status] }))}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý khiếu nại</Title>
        <Button icon={<ReloadOutlined />} onClick={loadComplaints} loading={loading}>Làm mới</Button>
      </div>
      <Alert type="info" showIcon message="Theo dõi và cập nhật các khiếu nại của khách hàng" style={{ marginBottom: 16 }} />
      <Table rowKey={getId} columns={columns} dataSource={complaints} loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: 1100 }} />
    </div>
  );
}
