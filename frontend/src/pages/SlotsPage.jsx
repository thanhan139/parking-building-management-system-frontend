import { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Tag, Typography, Space, Empty, Spin, App } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, CarOutlined } from '@ant-design/icons';
import slotService from '../services/slotService';
import vehicleService from '../services/vehicleService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function SlotsPage() {
  const { message } = App.useApp();
  const [slots, setSlots] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ vehicleTypeId: null, startTime: null, endTime: null });
  const [myVehicles, setMyVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  const codeToType = (code) => vehicleTypes.find((vt) => vt.code === code);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [vRes, tRes] = await Promise.all([
          vehicleService.getMyVehicles(),
          vehicleService.getVehicleTypes(),
        ]);
        setMyVehicles(vRes.data?.result || []);
        setVehicleTypes(tRes.data?.result || []);
      } catch { }
    };
    fetchInit();
  }, []);

  const doSearch = async (f) => {
    if (!f.vehicleTypeId) {
      message.warning('Vui lòng chọn loại xe trước khi tìm!');
      return;
    }
    setLoading(true);
    try {
      const params = { vehicleTypeId: f.vehicleTypeId };
      if (f.startTime) params.startTime = f.startTime.format('YYYY-MM-DDTHH:mm:ss');
      if (f.endTime) params.endTime = f.endTime.format('YYYY-MM-DDTHH:mm:ss');
      const res = await slotService.searchAvailable(params);
      setSlots(res.data?.result || []);
      setSearched(true);
    } catch (err) {
      message.error('Không thể tìm slot');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (vehicleId) => {
    const vehicle = myVehicles.find((v) => v.vehicleId === vehicleId);
    const vt = codeToType(vehicle?.vehicleTypeCode);
    if (!vt) {
      setSelectedVehicleId(null);
      message.warning('Xe này chưa có loại xe hợp lệ');
      return;
    }
    setSelectedVehicleId(vehicleId);
    const f = { ...filters, vehicleTypeId: vt.id };
    setFilters(f);
    doSearch(f);
  };

  const handleTypeChange = (typeId) => {
    setSelectedVehicleId(null);
    const f = { ...filters, vehicleTypeId: typeId };
    setFilters(f);
    if (typeId) doSearch(f);
  };

  const selectedType = vehicleTypes.find((vt) => vt.id === filters.vehicleTypeId);

  return (
    <div>
      <Title level={4}>Tìm chỗ đỗ xe</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          <Select
            placeholder="Tìm theo xe của tôi"
            style={{ width: 240 }}
            value={selectedVehicleId}
            onChange={handleVehicleSelect}
            allowClear
            onClear={() => setSelectedVehicleId(null)}
          >
            {myVehicles.map((v) => (
              <Select.Option key={v.vehicleId} value={v.vehicleId}>
                {v.plateNumber} {v.vehicleTypeName ? `- ${v.vehicleTypeName}` : ''}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Loại xe *"
            style={{ width: 200 }}
            value={filters.vehicleTypeId}
            onChange={handleTypeChange}
            status={!filters.vehicleTypeId ? 'warning' : undefined}
          >
            {vehicleTypes.map((vt) => (
              <Select.Option key={vt.id} value={vt.id}>{vt.name}</Select.Option>
            ))}
          </Select>
          <DatePicker showTime format="YYYY-MM-DD HH:mm" placeholder="Thời gian bắt đầu" onChange={(d) => setFilters({ ...filters, startTime: d })} />
          <DatePicker showTime format="YYYY-MM-DD HH:mm" placeholder="Thời gian kết thúc" onChange={(d) => setFilters({ ...filters, endTime: d })} />
          <Button type="primary" icon={<SearchOutlined />} onClick={() => doSearch(filters)} loading={loading}>Tìm kiếm</Button>
        </Space>
        {!filters.vehicleTypeId && (
          <div style={{ marginTop: 12 }}>
            <Text type="warning">⚠️ Vui lòng chọn loại xe (hoặc xe của bạn) để chỉ hiển thị chỗ đỗ phù hợp</Text>
          </div>
        )}
      </Card>

      <Spin spinning={loading}>
        {slots.length === 0 ? (
          <Empty
            description={
              searched && selectedType
                ? `Không có chỗ đỗ phù hợp cho ${selectedType.name}`
                : 'Chọn loại xe để tìm chỗ đỗ'
            }
          />
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <Tag color="blue" icon={<CarOutlined />}>
                Tìm thấy {slots.length} chỗ phù hợp cho {selectedType?.name}
              </Tag>
            </div>
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
          </>
        )}
      </Spin>
    </div>
  );
}
