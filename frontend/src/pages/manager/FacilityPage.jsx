import { useCallback, useEffect, useState } from 'react';
import { App, Card } from 'antd';
import facilityService, { errorText } from '../../services/facilityService';
import checkOutService from '../../services/checkOutService';
import FacilityTree from './FacilityTree';
import FacilityDetail from './FacilityDetail';
import FacilityForm from './FacilityForm';
import { SlotModal } from './SlotGrid';

export default function FacilityPage() {
  const { message } = App.useApp();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formState, setFormState] = useState(null);
  const [slotModal, setSlotModal] = useState(null);
  const [xeTheoO, setXeTheoO] = useState({});
  const [khachChuaGanO, setKhachChuaGanO] = useState(0);

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

  const submitForm = async (values) => {
    const { type, mode, id, parentId } = formState;
    try {
      if (type === 'building') {
        await (mode === 'create'
          ? facilityService.createBuilding(values)
          : facilityService.updateBuilding(id, values));
      } else if (type === 'floor') {
        const body = { ...values, buildingId: parentId };
        await (mode === 'create' ? facilityService.createFloor(body) : facilityService.updateFloor(id, body));
      } else if (type === 'zone') {
        const body = { ...values, floorId: parentId };
        await (mode === 'create' ? facilityService.createZone(body) : facilityService.updateZone(id, body));
      } else {
        const body = { ...values, zoneId: parentId };
        await (mode === 'create' ? facilityService.createSlot(body) : facilityService.updateSlot(id, body));
      }
      message.success('Đã lưu');
      setFormState(null);
      setSelected(null);
      await loadAll();
    } catch (err) {
      message.error(errorText(err));
    }
  };

  const remove = async (type, id) => {
    try {
      if (type === 'building') await facilityService.deleteBuilding(id);
      if (type === 'floor') await facilityService.deleteFloor(id);
      if (type === 'zone') await facilityService.deleteZone(id);
      if (type === 'slot') await facilityService.deleteSlot(id);
      message.success('Đã xoá');
      setSelected(null);
      setSlotModal(null);
      await loadAll();
    } catch (err) {
      message.error(errorText(err));
    }
  };

  const changeSlotStatus = async (id, status) => {
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
      <h2 style={{ marginTop: 0 }}>Hạ tầng bãi</h2>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <FacilityTree
          buildings={buildings}
          loading={loading}
          selectedKey={selected?.key}
          onSelect={setSelected}
          onAddBuilding={() => setFormState({ type: 'building', mode: 'create' })}
        />

        <Card style={{ flex: 1 }}>
          <FacilityDetail
            node={selected}
            onEdit={setFormState}
            onAdd={setFormState}
            onRemove={remove}
            onSlotClick={setSlotModal}
            khachChuaGanO={khachChuaGanO}
          />
        </Card>
      </div>

      <FacilityForm
        open={!!formState}
        type={formState?.type}
        mode={formState?.mode}
        initial={formState?.initial}
        categoryOptions={formState?.categoryOptions}
        onCancel={() => setFormState(null)}
        onSubmit={submitForm}
      />

      {slotModal && (
        <SlotModal
          key={slotModal.id}
          slot={slotModal}
          xe={xeTheoO[slotModal.id]}
          onClose={() => setSlotModal(null)}
          onStatus={changeSlotStatus}
          onRemove={remove}
        />
      )}
    </div>
  );
}
