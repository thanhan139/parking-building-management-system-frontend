import { useRef, useState } from 'react';
import { Button, Card, Typography } from 'antd';
import { CameraOutlined, CheckCircleFilled } from '@ant-design/icons';

const { Text } = Typography;

const PHOTO_SLOTS = [
  { key: 'front', label: 'Trước' },
  { key: 'back', label: 'Sau' },
  { key: 'left', label: 'Trái' },
  { key: 'right', label: 'Phải' },
  { key: 'driverFace', label: 'Mặt tài xế' },
];

export default function ExitPhotos({ onUpload, loading }) {
  const [photos, setPhotos] = useState({});
  const inputs = useRef({});
  const ready = PHOTO_SLOTS.every((slot) => photos[slot.key]);

  const pick = (key, file) => {
    if (file) setPhotos((truoc) => ({ ...truoc, [key]: file }));
  };

  return (
    <Card title="2 · Chụp 5 ảnh lúc ra">
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        {PHOTO_SLOTS.map((slot) => {
          const taken = !!photos[slot.key];
          return (
            <div key={slot.key}>
              <input
                ref={(el) => { inputs.current[slot.key] = el; }}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => pick(slot.key, e.target.files?.[0])}
              />
              <button
                onClick={() => inputs.current[slot.key]?.click()}
                style={{
                  width: 108, height: 92, borderRadius: 10, cursor: 'pointer',
                  background: taken ? '#dcfce7' : '#fafafa',
                  border: taken ? '1px solid #16a34a' : '1px dashed #bbb',
                  color: taken ? '#14532d' : '#888',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 6, fontSize: 13,
                }}
              >
                {taken ? <CheckCircleFilled style={{ fontSize: 20 }} /> : <CameraOutlined style={{ fontSize: 20 }} />}
                {slot.label}
              </button>
            </div>
          );
        })}
      </div>

      <Button
        type="primary"
        size="large"
        block
        disabled={!ready}
        loading={loading}
        onClick={() => onUpload(photos)}
        style={{ height: 52, fontWeight: 600 }}
      >
        {ready ? 'Tải ảnh lên và tính tiền' : `Còn thiếu ${PHOTO_SLOTS.filter((slot) => !photos[slot.key]).map((slot) => slot.label).join(', ')}`}
      </Button>
      <Text type="secondary" style={{ fontSize: 12 }}>
        Trên máy tính bảng, bấm ô nào sẽ mở camera ô đó.
      </Text>
    </Card>
  );
}
