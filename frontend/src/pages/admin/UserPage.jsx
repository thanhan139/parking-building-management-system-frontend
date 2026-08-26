import { useCallback, useEffect, useState } from 'react';
import { App, Button, Card, Select, Space, Table, Tag, Typography } from 'antd';
import adminUserService from '../../services/adminUserService';

const { Text } = Typography;

const ROLE_OPTIONS = [
  { value: 'DRIVER', label: 'DRIVER' },
  { value: 'STAFF', label: 'STAFF' },
  { value: 'MANAGER', label: 'MANAGER' },
  { value: 'ADMIN', label: 'ADMIN' },
];

const roleColor = {
  DRIVER: 'blue',
  STAFF: 'green',
  MANAGER: 'orange',
  ADMIN: 'purple',
};

export default function UserPage() {
  const { message } = App.useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [draftRoles, setDraftRoles] = useState({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminUserService.getAllUsers();
      const list = res.data?.result || [];
      setUsers(list);
      setDraftRoles(Object.fromEntries(list.map((u) => [u.userId, u.role || 'DRIVER'])));
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể tải danh sách user');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const saveRole = async (userId) => {
    const role = draftRoles[userId];
    if (!role) return;
    setSavingId(userId);
    try {
      await adminUserService.updateUserRole(userId, role);
      message.success('Đã cập nhật role');
      await loadUsers();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không đổi được role');
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'userId', key: 'userId', width: 80 },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', render: (t) => <Text strong>{t || '-'}</Text> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    {
      title: 'Role hiện tại',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role) => <Tag color={roleColor[role] || 'default'}>{role || '-'}</Tag>,
    },
    {
      title: 'Đổi role',
      key: 'changeRole',
      width: 240,
      render: (_, record) => (
        <Space>
          <Select
            style={{ width: 140 }}
            value={draftRoles[record.userId] || record.role || 'DRIVER'}
            options={ROLE_OPTIONS}
            onChange={(value) => setDraftRoles((prev) => ({ ...prev, [record.userId]: value }))}
          />
          <Button type="primary" onClick={() => saveRole(record.userId)} loading={savingId === record.userId}>
            Lưu
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý user"
        extra={<Button onClick={loadUsers}>Tải lại</Button>}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="userId"
          loading={loading}
          dataSource={users}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
