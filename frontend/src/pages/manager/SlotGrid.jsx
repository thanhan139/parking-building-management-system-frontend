import { useState } from 'react';
import { Button, Descriptions, Modal, Popconfirm, Select, Space } from 'antd';
import { CATEGORY, SLOT_STYLE } from './facilityLabels';

function gioVao(t) {
  return t ? new Date(t).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '–';
}

export function SlotGrid({ zone, onAddSlot, onSlotClick, tangKhach, khachChuaGanO }) {
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

      {tangKhach && khachChuaGanO > 0 && (
        <p style={{ color: '#b8700f', fontSize: 12, margin: '0 0 8px' }}>
          Còn {khachChuaGanO} xe khách vãng lai không gắn ô — không hiện trên sơ đồ này.
        </p>
      )}

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

        {onAddSlot && !full && (
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

      {onAddSlot && full && (
        <p style={{ color: '#c0392b', marginTop: 12 }}>
          Đã đủ {zone.slotCapacity} ô — muốn thêm phải nâng sức chứa của khu trước.
        </p>
      )}
    </>
  );
}

export function SlotModal({ slot, onClose, onStatus, onRemove, xe }) {
  const [status, setStatus] = useState(slot.status);
  const occupied = slot.status === 'OCCUPIED';

  return (
    <Modal open title={`Ô ${slot.code}`} onCancel={onClose} footer={null}>
      {occupied ? (
        xe ? (
          <Descriptions size="small" column={1} bordered>
            <Descriptions.Item label="Mã vé">{xe.ticketCode}</Descriptions.Item>
            <Descriptions.Item label="Biển số">{xe.plateNumber}</Descriptions.Item>
            <Descriptions.Item label="Loại xe">{CATEGORY[xe.vehicleCategory] || xe.vehicleCategory}</Descriptions.Item>
            <Descriptions.Item label="Vào lúc">{gioVao(xe.entryTime)} · cổng {xe.entryGate}</Descriptions.Item>
          </Descriptions>
        ) : (
          <p style={{ color: '#c0392b' }}>
            Ô đang treo cờ &quot;có xe&quot; nhưng hệ thống không tìm thấy lượt gửi nào. Báo quản lý.
          </p>
        )
      ) : !onStatus ? (
        <p style={{ color: '#8c8c8c' }}>Ô đang trống.</p>
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
            {onRemove && (
              <Popconfirm title="Xoá ô này?" okText="Xoá" cancelText="Huỷ" onConfirm={() => onRemove('slot', slot.id)}>
                <Button danger>Xoá ô</Button>
              </Popconfirm>
            )}
          </Space>
        </>
      )}
    </Modal>
  );
}
