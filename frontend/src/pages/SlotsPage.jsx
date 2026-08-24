import { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Button, Tag, Typography, Space, Empty, Spin, App } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, CarOutlined } from '@ant-design/icons';
import slotService from '../services/slotService';
import vehicleService from '../services/vehicleService';
import facilityService from '../services/facilityService';
import reservationService from '../services/reservationService';
import { disabledPastDate, pastTimeDisabled } from '../utils/timeUtils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function SlotsPage() {
  const { message } = App.useApp();
  const [slots, setSlots] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ buildingId: null, floorId: null, vehicleTypeId: null, startTime: null, endTime: null });
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [myVehicles, setMyVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [reservedByMeIds, setReservedByMeIds] = useState(new Set());

  useEffect(() => {
    reservationService
      .getMyReservations()
      .then((res) => setMyReservations(res.data?.result || []))
      .catch(() => {});
  }, []);

  const codeToType = (code) => vehicleTypes.find((vt) => vt.code === code);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [vRes, tRes, bRes] = await Promise.all([
          vehicleService.getMyVehicles(),
          vehicleService.getVehicleTypes(),
          facilityService.getBuildings(),
        ]);
        setMyVehicles(vRes.data?.result || []);
        setVehicleTypes(tRes.data?.result || []);
        setBuildings(bRes.data?.result || []);
      } catch { }
    };
    fetchInit();
  }, []);

  const doSearch = async (f) => {
    if (!f.vehicleTypeId) {
      message.warning('Vui lòng chọn loại xe trước khi tìm!');
      return;
    }
    const now = dayjs();
    if (f.startTime && f.startTime.isBefore(now)) {
      message.warning('Thời gian bắt đầu không được ở trong quá khứ!');
      return;
    }
    if (f.endTime && f.endTime.isBefore(now)) {
      message.warning('Thời gian kết thúc không được ở trong quá khứ!');
      return;
    }
    if (f.startTime && f.endTime && !f.endTime.isAfter(f.startTime)) {
      message.warning('Thời gian kết thúc phải sau thời gian bắt đầu!');
      return;
    }
    setLoading(true);
    try {
      const params = { vehicleTypeId: f.vehicleTypeId };
      if (f.buildingId) params.buildingId = f.buildingId;
      if (f.floorId) params.floorId = f.floorId;
      if (f.startTime) params.startTime = f.startTime.format('YYYY-MM-DDTHH:mm:ss');
      if (f.endTime) params.endTime = f.endTime.format('YYYY-MM-DDTHH:mm:ss');
      const res = await slotService.searchAvailable(params);
      let list = res.data?.result || [];

      // Xe dang chon da co dat cho active -> chi hien dung slot minh da dat.
      const mine = selectedVehicleId
        ? myReservations.filter(
            (r) => r.vehicleId === selectedVehicleId && ['PENDING', 'CONFIRMED'].includes(r.status)
          )
        : [];
      let mineIds = new Set();
      if (mine.length > 0) {
        const overlaps = (rStart, rEnd) =>
          (!f.startTime || dayjs(rEnd || rStart).isAfter(f.startTime)) &&
          (!f.endTime || dayjs(rStart).isBefore(f.endTime));
        const relevant = mine.filter((r) =>
          !f.startTime && !f.endTime ? true : overlaps(r.startTime, r.endTime)
        );
        if (relevant.length > 0) {
          mineIds = new Set(relevant.map((r) => r.slotId));
          list = list.filter((s) => mineIds.has(s.slotId));
        }
      }
      setReservedByMeIds(mineIds);
      setSlots(list);
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

  const handleBuildingChange = async (buildingId) => {
    const f = { ...filters, buildingId, floorId: null };
    setFloors([]);
    setFilters(f);
    if (buildingId) {
      try {
        const res = await facilityService.getFloors(buildingId);
        setFloors(res.data?.result || []);
      } catch {
        setFloors([]);
      }
    }
    if (f.vehicleTypeId) doSearch(f);
  };

  const handleFloorChange = (floorId) => {
    const f = { ...filters, floorId };
    setFilters(f);
    if (f.vehicleTypeId) doSearch(f);
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
          <Select
            placeholder="Tòa nhà"
            style={{ width: 180 }}
            value={filters.buildingId}
            onChange={handleBuildingChange}
            allowClear
            onClear={() => handleBuildingChange(null)}
          >
            {buildings.map((b) => (
              <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Tầng"
            style={{ width: 140 }}
            value={filters.floorId}
            onChange={handleFloorChange}
            disabled={!filters.buildingId}
            allowClear
            onClear={() => handleFloorChange(null)}
          >
            {floors.map((fl) => (
              <Select.Option key={fl.id} value={fl.id}>{fl.code || fl.name}</Select.Option>
            ))}
          </Select>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            placeholder="Thời gian bắt đầu"
            disabledDate={disabledPastDate}
            disabledTime={pastTimeDisabled}
            onChange={(d) => setFilters({ ...filters, startTime: d })}
          />
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            placeholder="Thời gian kết thúc"
            disabledDate={(d) => d && d.isBefore((filters.startTime || dayjs()).startOf('day'))}
            disabledTime={pastTimeDisabled}
            onChange={(d) => setFilters({ ...filters, endTime: d })}
          />
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
                    style={{ borderColor: reservedByMeIds.has(slot.slotId) || slot.available ? '#52c41a' : '#ff4d4f' }}
                    title={
                      <Space>
                        <Tag color={reservedByMeIds.has(slot.slotId) ? 'gold' : slot.available ? 'green' : 'red'}>{slot.slotCode}</Tag>
                        {reservedByMeIds.has(slot.slotId) ? (
                          <Tag color="gold">Của bạn</Tag>
                        ) : slot.available ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                      </Space>
                    }
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text>Tòa: <Text strong>{slot.buildingName}</Text></Text>
                      <Text>Tầng: <Text strong>{slot.floorCode}</Text> (Level {slot.levelNo})</Text>
                      <Text>Zone: <Text strong>{slot.zoneCode}</Text> - {slot.zoneName}</Text>
                      {slot.maxHeightCm && <Text>Chiều cao tối đa: {slot.maxHeightCm}cm</Text>}
                      {reservedByMeIds.has(slot.slotId) ? (
                        <Text type="warning">Xe của bạn đã đặt chỗ slot này</Text>
                      ) : (
                        <Text type={slot.available ? 'success' : 'danger'}>
                          {slot.available ? 'Có thể đặt' : slot.unavailableReason}
                        </Text>
                      )}
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
