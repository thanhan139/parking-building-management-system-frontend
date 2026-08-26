import { useCallback, useEffect, useState } from 'react';
import { App, Button, Card, Form, Input, Modal, Select, Space, Table, Tag, Typography, Popconfirm } from 'antd';
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
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
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

  const createUser = async (values) => {
    setCreating(true);
    try {
      await adminUserService.createStaff(values);
      message.success('Đã tạo user mới');
      setCreateOpen(false);
      createForm.resetFields();
      await loadUsers();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không tạo được user');
    } finally {
      setCreating(false);
    }
  };

  const lockUser = async (userId) => {
    try {
      await adminUserService.lockUser(userId);
      message.success('Đã khóa user');
      await loadUsers();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không khóa được user');
    }
  };

  const unlockUser = async (userId) => {
    try {
      await adminUserService.unlockUser(userId);
      message.success('Đã mở khóa user');
      await loadUsers();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không mở khóa được user');
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status || 'ACTIVE'}</Tag>
      ),
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
    {
      title: 'Khóa / Mở khóa',
      key: 'lock',
      width: 140,
      render: (_, record) => {
        const isActive = record.status === 'ACTIVE';
        return isActive ? (
          <Popconfirm
            title="Khóa user này?"
            description="User sẽ bị chuyển sang trạng thái INACTIVE."
            onConfirm={() => lockUser(record.userId)}
          >
            <Button danger size="small">Khóa</Button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="Mở khóa user này?"
            description="User sẽ được chuyển lại trạng thái ACTIVE."
            onConfirm={() => unlockUser(record.userId)}
          >
            <Button type="primary" size="small">Mở khóa</Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Quản lý user"
        extra={(
          <Space>
            <Button onClick={loadUsers}>Tải lại</Button>
            <Button type="primary" onClick={() => setCreateOpen(true)}>Tạo user</Button>
          </Space>
        )}
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

      <Modal
        title="Tạo user"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => createForm.submit()}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={creating}
      >
        <Form form={createForm} layout="vertical" onFinish={createUser}>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="SĐT" rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleChoice" label="Role" initialValue="STAFF" rules={[{ required: true }]}>
            <Select options={ROLE_OPTIONS.filter((r) => r.value !== 'ADMIN')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
