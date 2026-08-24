import { useState } from 'react';
import { Button, Modal, Popconfirm, Select, Space } from 'antd';
import { SLOT_STYLE } from './facilityLabels';

export function SlotGrid({ zone, onAddSlot, onSlotClick }) {
  const used = zone.slots.length;
  const full = zone.slotCapacity != null && used >= zone.slotCapacity;

  return (
    <>
      <div style={{ marginBottom: 8 }}>
        {Object.entries(SLOT_STYLE).map(([key, style]) => (
          <span key={key} style={{ marginRight: 16, fontSize: 12 }}>
            <span
              style={{
                display: 'inline-block', width: 12, height: 12, marginRight: 4,
                background: style.bg, border: `1px solid ${style.border}`,
                borderRadius: 3, verticalAlign: 'middle',
              }}
            />
            {style.label}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {zone.slots.map((slot) => {
          const style = SLOT_STYLE[slot.status] || SLOT_STYLE.LOCKED;
          return (
            <button
              key={slot.id}
              onClick={() => onSlotClick(slot)}
              style={{
                width: 88, height: 56, cursor: 'pointer', borderRadius: 8,
                background: style.bg, border: `1px solid ${style.border}`,
                fontSize: 12, lineHeight: 1.3,
              }}
            >
              <div style={{ fontWeight: 600 }}>{slot.code}</div>
              <div>{style.label}</div>
            </button>
          );
        })}

        {!full && (
          <button
            onClick={onAddSlot}
            style={{
              width: 88, height: 56, cursor: 'pointer', borderRadius: 8,
              background: '#fff', border: '1px dashed #4f46e5', color: '#4f46e5', fontSize: 12,
            }}
          >
            + Thêm ô
          </button>
        )}
      </div>

      {full && (
        <p style={{ color: '#c0392b', marginTop: 12 }}>
          Đã đủ {zone.slotCapacity} ô — muốn thêm phải nâng sức chứa của khu trước.
        </p>
      )}
    </>
  );
}

export function SlotModal({ slot, onClose, onStatus, onRemove }) {
  const [status, setStatus] = useState(slot.status);
  const occupied = slot.status === 'OCCUPIED';

  return (
    <Modal open title={`Ô ${slot.code}`} onCancel={onClose} footer={null}>
      {occupied ? (
        <p style={{ color: '#c0392b' }}>
          Ô này đang có xe. Không đổi trạng thái và không xoá được — cho xe ra trước đã.
        </p>
      ) : (
        <>
          <p>Đổi trạng thái:</p>
          <Select
            value={status}
            onChange={setStatus}
            style={{ width: '100%', marginBottom: 16 }}
            options={[
              { value: 'AVAILABLE', label: 'Trống' },
              { value: 'MAINTENANCE', label: 'Bảo trì' },
              { value: 'LOCKED', label: 'Khoá' },
            ]}
          />
          <Space>
            <Button type="primary" onClick={() => onStatus(slot.id, status)} disabled={status === slot.status}>
              Lưu trạng thái
            </Button>
            <Popconfirm title="Xoá ô này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => onRemove('slot', slot.id)}>
              <Button danger>Xoá ô</Button>
            </Popconfirm>
          </Space>
        </>
      )}
    </Modal>
  );
}
