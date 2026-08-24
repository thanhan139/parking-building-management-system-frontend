import { Button, Card, Empty, Spin, Tag, Tree } from 'antd';
import { AppstoreOutlined, BankOutlined, LayoutOutlined } from '@ant-design/icons';
import { CATEGORY, ICON, POWER } from './facilityLabels';

function NodeTitle({ icon, name, detail, count, full }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      {icon}
      <span style={{ fontWeight: 600 }}>{name}</span>
      <span style={{ color: '#8c8c8c', fontSize: 12 }}>{detail}</span>
      <Tag
        color={full ? 'red' : 'blue'}
        style={{ marginLeft: 'auto', marginInlineEnd: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        {count}
      </Tag>
    </span>
  );
}

export default function FacilityTree({ buildings, loading, selectedKey, onSelect, onAddBuilding }) {
  const treeData = buildings.map((building) => ({
    key: `building-${building.id}`,
    type: 'building',
    raw: building,
    title: (
      <NodeTitle
        icon={<BankOutlined style={ICON} />}
        name={building.name}
        detail={`${building.openTime?.slice(0, 5)}–${building.closeTime?.slice(0, 5)}`}
        count={`${building.floors.length} tầng`}
      />
    ),
    children: building.floors.map((floor) => {
      const used = floor.zones.length;
      const full = floor.zoneCount != null && used >= floor.zoneCount;
      return {
        key: `floor-${floor.id}`,
        type: 'floor',
        raw: floor,
        parent: building,
        title: (
          <NodeTitle
            icon={<LayoutOutlined style={ICON} />}
            name={floor.code}
            detail={`tầng ${floor.levelNo} · ${floor.guestAllowed ? 'khách vãng lai' : 'thành viên'}`}
            count={`${used}/${floor.zoneCount ?? '–'} khu`}
            full={full}
          />
        ),
        children: floor.zones.map((zone) => {
          const slots = zone.slots.length;
          const zoneFull = zone.slotCapacity != null && slots >= zone.slotCapacity;
          return {
            key: `zone-${zone.id}`,
            type: 'zone',
            raw: zone,
            parent: floor,
            title: (
              <NodeTitle
                icon={<AppstoreOutlined style={ICON} />}
                name={zone.code}
                detail={`${CATEGORY[zone.allowedCategory]} · ${POWER[zone.powerPolicy]}`}
                count={`${slots}/${zone.slotCapacity ?? '–'} ô`}
                full={zoneFull}
              />
            ),
          };
        }),
      };
    }),
  }));

  return (
    <Card title="Cây bãi" style={{ width: 460, flexShrink: 0 }}>
      <style>{`.facility-tree .ant-tree-node-content-wrapper { padding: 5px 8px; }`}</style>
      <Spin spinning={loading}>
        {treeData.length === 0 ? (
          <Empty description="Chưa có toà nhà nào" />
        ) : (
          <Tree
            className="facility-tree"
            treeData={treeData}
            defaultExpandAll
            blockNode
            selectedKeys={selectedKey ? [selectedKey] : []}
            onSelect={(_, info) => onSelect(info.node)}
          />
        )}
      </Spin>
      <Button block type="dashed" style={{ marginTop: 12 }} onClick={onAddBuilding}>
        + Thêm toà nhà
      </Button>
    </Card>
  );
}
