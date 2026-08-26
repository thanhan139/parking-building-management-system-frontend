import { useCallback, useEffect, useState } from 'react';
import { App, Card } from 'antd';
import facilityService, { errorText } from '../../services/facilityService';
import checkOutService from '../../services/checkOutService';
import FacilityTree from '../manager/FacilityTree';
import FacilityDetail from '../manager/FacilityDetail';
import { SlotModal } from '../manager/SlotGrid';

export default function BaiDoPage() {
  const { message } = App.useApp();
  const [buildings, setBuildings] = useState([]);
  const [xeTheoO, setXeTheoO] = useState({});
  const [khachChuaGanO, setKhachChuaGanO] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [slotModal, setSlotModal] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const list = (await facilityService.getBuildings()).data.result || [];
      for (const building of list) {
        building.floors = (await facilityService.getFloors(building.id)).data.result || [];
        for (const floor of building.floors) {
          floor.zones = (await facilityService.getZones(floor.id)).data.result || [];
          for (const zone of floor.zones) {
            zone.slots = (await facilityService.getSlots(zone.id)).data.result || [];
          }
        }
      }

      const dangGui = (await checkOutService.parkedSessions()).data.result || [];
      const theoO = {};
      dangGui.forEach((xe) => {
        if (xe.slotId) theoO[xe.slotId] = xe;
      });

      setBuildings(list);
      setXeTheoO(theoO);
      setKhachChuaGanO(dangGui.filter((xe) => !xe.slotId).length);
    } catch (err) {
      message.error(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const doiTrangThai = async (id, status) => {
    try {
      await facilityService.changeSlotStatus(id, status);
      message.success('Đã đổi trạng thái');
      setSlotModal(null);
      await loadAll();
    } catch (err) {
      message.error(errorText(err));
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Sơ đồ bãi</h2>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <FacilityTree
          buildings={buildings}
          loading={loading}
          selectedKey={selected?.key}
          onSelect={setSelected}
        />

        <Card style={{ flex: 1 }}>
          <FacilityDetail
            node={selected}
            onSlotClick={setSlotModal}
            khachChuaGanO={khachChuaGanO}
          />
        </Card>
      </div>

      {slotModal && (
        <SlotModal
          key={slotModal.id}
          slot={slotModal}
          xe={xeTheoO[slotModal.id]}
          onClose={() => setSlotModal(null)}
          onStatus={doiTrangThai}
        />
      )}
    </div>
  );
}
