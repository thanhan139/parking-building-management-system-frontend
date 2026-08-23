import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Typography, message, Popconfirm, Image, Upload, List, Avatar, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined, TeamOutlined, UserOutlined, CrownFilled } from '@ant-design/icons';
import vehicleService from '../services/vehicleService';

const { Title, Text } = Typography;

const driverRoles = [
  { code: 'FAMILY_MEMBER', name: 'Thành viên gia đình' },
  { code: 'OWNER', name: 'Chủ sở hữu' },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form] = Form.useForm();
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [driverVehicle, setDriverVehicle] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [addingDriver, setAddingDriver] = useState(false);
  const [driverForm] = Form.useForm();

  const vehicleTypes = [
    { code: 'MOTORBIKE', name: 'Motorbike' },
    { code: 'ELECTRIC_BIKE', name: 'Electric Bike' },
    { code: 'CAR', name: 'Small Car' },
    { code: 'CAR_ELECTRIC', name: 'Electric Car' },
  ];

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehicleService.getMyVehicles();
      setVehicles(res.data?.result || []);
    } catch (err) {
      message.error('Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleTypes = async () => {};

  useEffect(() => { fetchVehicles(); }, []);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('plateNumber', values.plateNumber);
      formData.append('vehicleTypeCode', values.vehicleTypeCode);
      formData.append('brand', values.brand || '');
      formData.append('color', values.color || '');
      if (values.chassisNumber) formData.append('chassisNumber', values.chassisNumber);
      if (values.cardToken) formData.append('cardToken', values.cardToken);
      if (values.plateImage?.fileList?.[0]?.originFileObj) {
        formData.append('plateImage', values.plateImage.fileList[0].originFileObj);
      }

      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.vehicleId, formData);
        message.success('Cập nhật xe thành công');
      } else {
        await vehicleService.createVehicle(formData);
        message.success('Thêm xe thành công');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingVehicle(null);
      fetchVehicles();
    } catch (err) {
      message.error(err.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (id) => {
    try {
      await vehicleService.deleteVehicle(id);
      message.success('Xóa xe thành công');
      fetchVehicles();
    } catch (err) {
      message.error('Không thể xóa xe');
    }
  };

  const openDriverModal = async (vehicle) => {
    setDriverVehicle(vehicle);
    setDriverModalOpen(true);
    fetchDrivers(vehicle.vehicleId);
  };

  const fetchDrivers = async (vehicleId) => {
    try {
      setDriversLoading(true);
      const res = await vehicleService.getVehicleDrivers(vehicleId);
      setDrivers(res.data?.result || []);
    } catch (err) {
      message.error('Không thể tải danh sách người lái');
    } finally {
      setDriversLoading(false);
    }
  };

  const handleAddDriver = async (values) => {
    try {
      setAddingDriver(true);
      await vehicleService.addVehicleDriver(driverVehicle.vehicleId, values);
      message.success('Nhượng quyền thành công!');
      driverForm.resetFields();
      fetchDrivers(driverVehicle.vehicleId);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể thêm người lái');
    } finally {
      setAddingDriver(false);
    }
  };

  const handleRemoveDriver = async (driverId) => {
    try {
      await vehicleService.removeVehicleDriver(driverVehicle.vehicleId, driverId);
      message.success('Đã thu hồi quyền');
      fetchDrivers(driverVehicle.vehicleId);
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể xóa người lái');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'vehicleId', key: 'vehicleId', width: 60 },
    { title: 'Biển số', dataIndex: 'plateNumber', key: 'plateNumber', render: (t) => <Tag color="blue">{t}</Tag> },
    { title: 'Loại xe', dataIndex: 'vehicleTypeName', key: 'vehicleTypeName', render: (t) => t || '-' },
    { title: 'Hãng', dataIndex: 'brand', key: 'brand', render: (t) => t || '-' },
    { title: 'Màu', dataIndex: 'color', key: 'color', render: (t) => t || '-' },
    { title: 'Năng lượng', dataIndex: 'powerSource', key: 'powerSource', render: (t) => t ? <Tag>{t}</Tag> : '-' },
    { title: 'Ảnh biển số', dataIndex: 'plateImageUrl', key: 'plateImageUrl', render: (t) => t ? <Image src={t} width={60} /> : '-' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (t) => <Tag color={t === 'ACTIVE' ? 'green' : 'red'}>{t}</Tag>,
    },
    {
      title: 'Thao tác', key: 'action', width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<TeamOutlined />} onClick={() => openDriverModal(record)} title="Nhượng quyền" />
          <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingVehicle(record); form.setFieldsValue(record); setModalOpen(true); }} />
          <Popconfirm title="Xóa xe này?" onConfirm={() => handleDelete(record.vehicleId)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Xe của tôi</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingVehicle(null); form.resetFields(); setModalOpen(true); }}>
          Thêm xe
        </Button>
      </div>
      <Table columns={columns} dataSource={vehicles} rowKey="vehicleId" loading={loading} pagination={{ pageSize: 10 }} />

      <Modal
        title={editingVehicle ? 'Cập nhật xe' : 'Thêm xe mới'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingVehicle(null); }}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="plateNumber" label="Biển số xe" rules={[{ required: true, message: 'Nhập biển số!' }]}>
            <Input placeholder="VD: 29A-12345" />
          </Form.Item>
          <Form.Item name="vehicleTypeCode" label="Loại xe" rules={[{ required: true, message: 'Chọn loại xe!' }]}>
            <Select placeholder="Chọn loại xe">
              {vehicleTypes.map((vt) => (
                <Select.Option key={vt.code} value={vt.code}>{vt.name} ({vt.code})</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="brand" label="Hãng xe">
            <Input placeholder="VD: Honda, Toyota" />
          </Form.Item>
          <Form.Item name="color" label="Màu xe">
            <Input placeholder="VD: Đỏ, Xanh" />
          </Form.Item>
          <Form.Item name="chassisNumber" label="Số khung">
            <Input placeholder="VD: RLHHC12345" />
          </Form.Item>
          <Form.Item name="plateImage" label="Ảnh biển số">
            <Upload maxCount={1} beforeUpload={() => false} listType="picture">
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={driverVehicle ? `Nhượng quyền xe ${driverVehicle.plateNumber}` : 'Nhượng quyền xe'}
        open={driverModalOpen}
        onCancel={() => { setDriverModalOpen(false); setDriverVehicle(null); setDrivers([]); driverForm.resetFields(); }}
        footer={null}
        width={640}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Chia sẻ quyền sử dụng xe cho thành viên khác (người thân, tài xế). Họ có thể dùng xe này để đặt chỗ đỗ.
        </Text>

        <List
          loading={driversLoading}
          dataSource={drivers.filter((d) => d.driverRole !== 'OWNER')}
          locale={{ emptyText: <Empty description="Chưa nhượng quyền cho ai" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Popconfirm title="Thu hồi quyền sử dụng xe?" onConfirm={() => handleRemoveDriver(item.id)}>
                  <Button type="link" danger size="small" icon={<DeleteOutlined />}>Thu hồi</Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg, #1677ff, #69b1ff)' }} />}
                title={
                  <Space>
                    <span>{item.fullName || item.phone || 'Người dùng'}</span>
                    <Tag color={item.driverRole === 'OWNER' ? 'gold' : 'blue'}>
                      {item.driverRole === 'OWNER' ? 'Chủ sở hữu' : 'Thành viên'}
                    </Tag>
                  </Space>
                }
                description={
                  <Space split={<span>·</span>}>
                    {item.phone && <span>{item.phone}</span>}
                    {item.email && <span>{item.email}</span>}
                    {item.idCardNo && <span>CCCD: {item.idCardNo}</span>}
                  </Space>
                }
              />
            </List.Item>
          )}
          style={{ marginBottom: 24, maxHeight: 300, overflowY: 'auto' }}
        />

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <Title level={5} style={{ marginTop: 0 }}>Thêm người lái mới</Title>
          <Form form={driverForm} layout="vertical" onFinish={handleAddDriver}>
            <Space size={12} style={{ display: 'flex' }} wrap>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Nhập SĐT!' }]}
                style={{ marginBottom: 0, minWidth: 160 }}
              >
                <Input placeholder="0912345678" />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
                style={{ marginBottom: 0, minWidth: 180 }}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
              <Form.Item
                name="driverRole"
                label="Vai trò"
                initialValue="FAMILY_MEMBER"
                rules={[{ required: true, message: 'Chọn vai trò!' }]}
                style={{ marginBottom: 0, minWidth: 170 }}
              >
                <Select options={driverRoles.map((r) => ({ value: r.code, label: `${r.name} (${r.code})` }))} />
              </Form.Item>
            </Space>
            <Space size={12} style={{ marginTop: 12 }} wrap>
              <Form.Item name="idCardNo" style={{ marginBottom: 0, minWidth: 200 }}>
                <Input placeholder="Số CCCD (tùy chọn)" maxLength={20} />
              </Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={addingDriver}>
                Nhượng quyền
              </Button>
            </Space>
          </Form>
        </div>
      </Modal>
    </div>
  );
}