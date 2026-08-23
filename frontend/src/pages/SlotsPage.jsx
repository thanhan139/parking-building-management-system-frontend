import { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Tag, Typography, Space, Empty, Spin, message } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import slotService from '../services/slotService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const vehicleTypes = [
  { id: 1, name: 'Motorbike' },
  { id: 2, name: 'Electric Bike' },
  { id: 3, name: 'Small Car' },
  { id: 4, name: 'Electric Car' },
];

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ vehicleTypeId: null, startTime: null, endTime: null });

  const handleSearch = async (f = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (f.vehicleTypeId) params.vehicleTypeId = f.vehicleTypeId;
      if (f.startTime) params.startTime = f.startTime.format('YYYY-MM-DDTHH:mm:ss');
      if (f.endTime) params.endTime = f.endTime.format('YYYY-MM-DDTHH:mm:ss');
      const res = await slotService.searchAvailable(params);
      setSlots(res.data?.result || []);
    } catch (err) {
      message.error('Không thể tìm slot');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { handleSearch(); }, []);

  return (
    <div>
      <Title level={4}>Tìm chỗ đỗ xe</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Select placeholder="Loại xe" allowClear style={{ width: 200 }} onChange={(v) => { const f = { ...filters, vehicleTypeId: v }; setFilters(f); }}>
            {vehicleTypes.map((vt) => <Select.Option key={vt.id} value={vt.id}>{vt.name}</Select.Option>)}
          </Select>
          <DatePicker showTime format="YYYY-MM-DD HH:mm" placeholder="Thời gian bắt đầu" onChange={(d) => setFilters({ ...filters, startTime: d })} />
          <DatePicker showTime format="YYYY-MM-DD HH:mm" placeholder="Thời gian kết thúc" onChange={(d) => setFilters({ ...filters, endTime: d })} />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>Tìm kiếm</Button>
        </Space>
      </Card>

      <Spin spinning={loading}>
        {slots.length === 0 ? (
          <Empty description="Không tìm thấy slot nào" />
        ) : (
          <Row gutter={[16, 16]}>
            {slots.map((slot) => (
              <Col key={slot.slotId} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  style={{ borderColor: slot.available ? '#52c41a' : '#ff4d4f' }}
                  title={
                    <Space>
                      <Tag color={slot.available ? 'green' : 'red'}>{slot.slotCode}</Tag>
                      {slot.available ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                    </Space>
                  }
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text>Tòa: <Text strong>{slot.buildingName}</Text></Text>
                    <Text>Tầng: <Text strong>{slot.floorCode}</Text> (Level {slot.levelNo})</Text>
                    <Text>Zone: <Text strong>{slot.zoneCode}</Text> - {slot.zoneName}</Text>
                    {slot.maxHeightCm && <Text>Chiều cao tối đa: {slot.maxHeightCm}cm</Text>}
                    <Text type={slot.available ? 'success' : 'danger'}>
                      {slot.available ? 'Có thể đặt' : slot.unavailableReason}
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
}
