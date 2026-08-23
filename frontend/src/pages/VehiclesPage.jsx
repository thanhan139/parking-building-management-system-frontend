import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Typography, message, Popconfirm, Image, Upload } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import vehicleService from '../services/vehicleService';

const { Title } = Typography;

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form] = Form.useForm();

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
      title: 'Thao tác', key: 'action', width: 120,
      render: (_, record) => (
        <Space>
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
    </div>
  );
}