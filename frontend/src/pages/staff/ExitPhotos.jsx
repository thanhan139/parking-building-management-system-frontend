import { useEffect, useRef, useState } from 'react';
import { Button, Card, Modal, Typography } from 'antd';
import { CameraOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PHOTO_SLOTS = [
  { key: 'front', label: 'Trước' },
  { key: 'back', label: 'Sau' },
  { key: 'left', label: 'Trái' },
  { key: 'right', label: 'Phải' },
  { key: 'driverFace', label: 'Mặt tài xế' },
];

export default function ExitPhotos({ step = 2, onUpload, loading }) {
  const [photos, setPhotos] = useState({});
  const [urls, setUrls] = useState({});
  const [xem, setXem] = useState(null);
  const inputs = useRef({});
  const urlsRef = useRef({});
  const ready = PHOTO_SLOTS.every((slot) => photos[slot.key]);

  urlsRef.current = urls;
  useEffect(() => () => Object.values(urlsRef.current).forEach(URL.revokeObjectURL), []);

  const pick = (key, file) => {
    if (!file) return;
    setUrls((truoc) => {
      if (truoc[key]) URL.revokeObjectURL(truoc[key]);
      return { ...truoc, [key]: URL.createObjectURL(file) };
    });
    setPhotos((truoc) => ({ ...truoc, [key]: file }));
  };

  const chupLai = (key) => {
    setXem(null);
    inputs.current[key]?.click();
  };

  return (
    <Card title={`${step} · Chụp 5 ảnh lúc ra`}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        {PHOTO_SLOTS.map((slot) => {
          const url = urls[slot.key];
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
                onClick={() => (url ? setXem(slot) : inputs.current[slot.key]?.click())}
                style={{
                  position: 'relative', width: 150, height: 118, borderRadius: 10,
                  cursor: 'pointer', overflow: 'hidden', padding: 0,
                  background: url ? '#000' : '#fafafa',
                  border: url ? '2px solid #16a34a' : '1px dashed #bbb',
                  color: '#888', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13,
                }}
              >
                {url ? (
                  <img src={url} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <CameraOutlined style={{ fontSize: 20 }} />
                    {slot.label}
                  </>
                )}

                {url && (
                  <span style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0, padding: '3px 6px',
                    background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, fontWeight: 600,
                  }}>
                    {slot.label}
                  </span>
                )}
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
        Bấm ô trống để mở camera. Bấm vào ảnh đã chụp để xem to và kiểm lại trước khi tải lên.
      </Text>

      <Modal
        open={!!xem}
        title={xem ? `Ảnh ${xem.label}` : ''}
        onCancel={() => setXem(null)}
        width={720}
        footer={[
          <Button key="lai" danger onClick={() => chupLai(xem.key)}>Chụp lại</Button>,
          <Button key="ok" type="primary" onClick={() => setXem(null)}>Ảnh đạt</Button>,
        ]}
      >
        {xem && (
          <img
            src={urls[xem.key]}
            alt={xem.label}
            style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', background: '#000' }}
          />
        )}
      </Modal>
    </Card>
  );
}
