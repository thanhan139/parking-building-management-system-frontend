import { Button, Descriptions, Empty, Popconfirm, Space, Tag } from 'antd';
import { AppstoreOutlined, BankOutlined, LayoutOutlined } from '@ant-design/icons';
import { CATEGORY, ICON, POWER, loaiXeChoPhep } from './facilityLabels';
import { SlotGrid } from './SlotGrid';

export default function FacilityDetail({ node, onEdit, onAdd, onRemove, onSlotClick }) {
  if (!node) return <Empty description="Chọn một nhánh bên trái" />;
  if (node.type === 'building') return <ToaNha node={node} onEdit={onEdit} onAdd={onAdd} onRemove={onRemove} />;
  if (node.type === 'floor') return <Tang node={node} onEdit={onEdit} onAdd={onAdd} onRemove={onRemove} />;
  return <Khu node={node} onEdit={onEdit} onAdd={onAdd} onRemove={onRemove} onSlotClick={onSlotClick} />;
}

function ToaNha({ node, onEdit, onAdd, onRemove }) {
  const building = node.raw;
  const soTang = building.floors.length;

  return (
    <>
      <h3><BankOutlined style={{ ...ICON, marginRight: 8 }} />{building.name}</h3>
      <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Địa chỉ">{building.address || '–'}</Descriptions.Item>
        <Descriptions.Item label="Giờ mở cửa">{building.openTime} – {building.closeTime}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={building.status === 'ACTIVE' ? 'green' : 'default'}>{building.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Số tầng">{soTang}</Descriptions.Item>
      </Descriptions>

      <Space wrap>
        <Button onClick={() => onEdit({ type: 'building', mode: 'edit', id: building.id, initial: building })}>
          Sửa toà nhà
        </Button>
        <Popconfirm title="Xoá toà nhà này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => onRemove('building', building.id)}>
          <Button danger disabled={soTang > 0}>Xoá toà nhà</Button>
        </Popconfirm>
        {soTang > 0 && <span style={{ color: '#c0392b' }}>còn {soTang} tầng nên chưa xoá được</span>}
        <Button type="primary" onClick={() => onAdd({ type: 'floor', mode: 'create', parentId: building.id })}>
          + Thêm tầng
        </Button>
      </Space>
    </>
  );
}

function Tang({ node, onEdit, onAdd, onRemove }) {
  const floor = node.raw;
  const soKhu = floor.zones.length;
  const day = floor.zoneCount != null && soKhu >= floor.zoneCount;

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
        <Descriptions.Item label="Khu">{soKhu}/{floor.zoneCount ?? '–'}</Descriptions.Item>
      </Descriptions>

      <Space wrap>
        <Button onClick={() => onEdit({ type: 'floor', mode: 'edit', id: floor.id, parentId: floor.buildingId, initial: floor })}>
          Sửa tầng
        </Button>
        <Popconfirm title="Xoá tầng này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => onRemove('floor', floor.id)}>
          <Button danger disabled={soKhu > 0}>Xoá tầng</Button>
        </Popconfirm>
        {soKhu > 0 && <span style={{ color: '#c0392b' }}>còn {soKhu} khu nên chưa xoá được</span>}
        <Button
          type="primary"
          disabled={day}
          onClick={() => onAdd({
            type: 'zone', mode: 'create', parentId: floor.id, categoryOptions: loaiXeChoPhep(floor),
          })}
        >
          + Thêm khu
        </Button>
        {day && <span style={{ color: '#c0392b' }}>đã đủ {floor.zoneCount} khu — nâng &quot;số khu tối đa&quot; trước</span>}
      </Space>
    </>
  );
}

function Khu({ node, onEdit, onAdd, onRemove, onSlotClick }) {
  const zone = node.raw;
  const floor = node.parent;
  const soO = zone.slots.length;

  return (
    <>
      <h3><AppstoreOutlined style={{ ...ICON, marginRight: 8 }} />Khu {zone.code} {zone.name && `– ${zone.name}`}</h3>
      <Descriptions size="small" column={3} style={{ marginBottom: 12 }}>
        <Descriptions.Item label="Loại xe">{CATEGORY[zone.allowedCategory]}</Descriptions.Item>
        <Descriptions.Item label="Nguồn">{POWER[zone.powerPolicy]}</Descriptions.Item>
        <Descriptions.Item label="Ô">{soO}/{zone.slotCapacity ?? '–'}</Descriptions.Item>
      </Descriptions>

      <Space wrap style={{ marginBottom: 16 }}>
        <Button onClick={() => onEdit({
          type: 'zone', mode: 'edit', id: zone.id, parentId: zone.floorId,
          initial: zone, categoryOptions: loaiXeChoPhep(floor),
        })}>
          Sửa khu
        </Button>
        <Popconfirm title="Xoá khu này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => onRemove('zone', zone.id)}>
          <Button danger disabled={soO > 0}>Xoá khu</Button>
        </Popconfirm>
        {soO > 0 && <span style={{ color: '#c0392b' }}>còn {soO} ô nên chưa xoá được</span>}
      </Space>

      <SlotGrid
        zone={zone}
        onAddSlot={() => onAdd({ type: 'slot', mode: 'create', parentId: zone.id })}
        onSlotClick={onSlotClick}
      />
    </>
  );
}
