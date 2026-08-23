import { Button, Descriptions, Empty, Popconfirm, Space, Tag } from 'antd';
import { AppstoreOutlined, BankOutlined, LayoutOutlined } from '@ant-design/icons';
import { CATEGORY, ICON, POWER, allowedCategories } from './facilityLabels';
import { SlotGrid } from './SlotGrid';

export default function FacilityDetail({ node, onEdit, onAdd, onRemove, onSlotClick }) {
  if (!node) return <Empty description="Chọn một nhánh bên trái" />;
  if (node.type === 'building') return <BuildingPanel node={node} onEdit={onEdit} onAdd={onAdd} onRemove={onRemove} />;
  if (node.type === 'floor') return <FloorPanel node={node} onEdit={onEdit} onAdd={onAdd} onRemove={onRemove} />;
  return <ZonePanel node={node} onEdit={onEdit} onAdd={onAdd} onRemove={onRemove} onSlotClick={onSlotClick} />;
}

function BuildingPanel({ node, onEdit, onAdd, onRemove }) {
  const building = node.raw;
  const floorCount = building.floors.length;

  return (
    <>
      <h3><BankOutlined style={{ ...ICON, marginRight: 8 }} />{building.name}</h3>
      <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Địa chỉ">{building.address || '–'}</Descriptions.Item>
        <Descriptions.Item label="Giờ mở cửa">{building.openTime} – {building.closeTime}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={building.status === 'ACTIVE' ? 'green' : 'default'}>{building.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Số tầng">{floorCount}</Descriptions.Item>
      </Descriptions>

      <Space wrap>
        <Button onClick={() => onEdit({ type: 'building', mode: 'edit', id: building.id, initial: building })}>
          Sửa toà nhà
        </Button>
        <Popconfirm title="Xoá toà nhà này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => onRemove('building', building.id)}>
          <Button danger disabled={floorCount > 0}>Xoá toà nhà</Button>
        </Popconfirm>
        {floorCount > 0 && <span style={{ color: '#c0392b' }}>còn {floorCount} tầng nên chưa xoá được</span>}
        <Button type="primary" onClick={() => onAdd({ type: 'floor', mode: 'create', parentId: building.id })}>
          + Thêm tầng
        </Button>
      </Space>
    </>
  );
}

function FloorPanel({ node, onEdit, onAdd, onRemove }) {
  const floor = node.raw;
  const zoneUsed = floor.zones.length;
  const full = floor.zoneCount != null && zoneUsed >= floor.zoneCount;

  return (
    <>
      <h3><LayoutOutlined style={{ ...ICON, marginRight: 8 }} />Tầng {floor.code}</h3>
      <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Số tầng">{floor.levelNo}</Descriptions.Item>
        <Descriptions.Item label="Cao tối đa">{floor.maxHeightCm ? `${floor.maxHeightCm} cm` : '–'}</Descriptions.Item>
        <Descriptions.Item label="Nhận xe">
          {floor.allowCar && <Tag>Ô tô</Tag>}
          {floor.allowMotorbike && <Tag>Xe máy</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Dành cho">
          <Tag color={floor.guestAllowed ? 'orange' : 'blue'}>
            {floor.guestAllowed ? 'Khách vãng lai' : 'Thành viên'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="ZonePanel">{zoneUsed}/{floor.zoneCount ?? '–'}</Descriptions.Item>
      </Descriptions>

      <Space wrap>
        <Button onClick={() => onEdit({ type: 'floor', mode: 'edit', id: floor.id, parentId: floor.buildingId, initial: floor })}>
          Sửa tầng
        </Button>
        <Popconfirm title="Xoá tầng này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => onRemove('floor', floor.id)}>
          <Button danger disabled={zoneUsed > 0}>Xoá tầng</Button>
        </Popconfirm>
        {zoneUsed > 0 && <span style={{ color: '#c0392b' }}>còn {zoneUsed} khu nên chưa xoá được</span>}
        <Button
          type="primary"
          disabled={full}
          onClick={() => onAdd({
            type: 'zone', mode: 'create', parentId: floor.id, categoryOptions: allowedCategories(floor),
          })}
        >
          + Thêm khu
        </Button>
        {full && <span style={{ color: '#c0392b' }}>đã đủ {floor.zoneCount} khu — nâng &quot;số khu tối đa&quot; trước</span>}
      </Space>
    </>
  );
}

function ZonePanel({ node, onEdit, onAdd, onRemove, onSlotClick }) {
  const zone = node.raw;
  const floor = node.parent;
  const slotUsed = zone.slots.length;

  return (
    <>
      <h3><AppstoreOutlined style={{ ...ICON, marginRight: 8 }} />ZonePanel {zone.code} {zone.name && `– ${zone.name}`}</h3>
      <Descriptions size="small" column={3} style={{ marginBottom: 12 }}>
        <Descriptions.Item label="Loại xe">{CATEGORY[zone.allowedCategory]}</Descriptions.Item>
        <Descriptions.Item label="Nguồn">{POWER[zone.powerPolicy]}</Descriptions.Item>
        <Descriptions.Item label="Ô">{slotUsed}/{zone.slotCapacity ?? '–'}</Descriptions.Item>
      </Descriptions>

      <Space wrap style={{ marginBottom: 16 }}>
        <Button onClick={() => onEdit({
          type: 'zone', mode: 'edit', id: zone.id, parentId: zone.floorId,
          initial: zone, categoryOptions: allowedCategories(floor),
        })}>
          Sửa khu
        </Button>
        <Popconfirm title="Xoá khu này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => onRemove('zone', zone.id)}>
          <Button danger disabled={slotUsed > 0}>Xoá khu</Button>
        </Popconfirm>
        {slotUsed > 0 && <span style={{ color: '#c0392b' }}>còn {slotUsed} ô nên chưa xoá được</span>}
      </Space>

      <SlotGrid
        zone={zone}
        onAddSlot={() => onAdd({ type: 'slot', mode: 'create', parentId: zone.id })}
        onSlotClick={onSlotClick}
      />
    </>
  );
}
