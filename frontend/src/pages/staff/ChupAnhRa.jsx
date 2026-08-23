import { useRef, useState } from 'react';
import { Button, Card, Typography } from 'antd';
import { CameraOutlined, CheckCircleFilled } from '@ant-design/icons';

const { Text } = Typography;

const O_ANH = [
  { key: 'front', nhan: 'Trước' },
  { key: 'back', nhan: 'Sau' },
  { key: 'left', nhan: 'Trái' },
  { key: 'right', nhan: 'Phải' },
  { key: 'driverFace', nhan: 'Mặt tài xế' },
];

export default function ChupAnhRa({ onTaiLen, dangTai }) {
  const [anh, setAnh] = useState({});
  const inputs = useRef({});
  const duAnh = O_ANH.every((o) => anh[o.key]);

  const chon = (key, file) => {
    if (file) setAnh((truoc) => ({ ...truoc, [key]: file }));
  };

  return (
    <Card title="2 · Chụp 5 ảnh lúc ra">
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        {O_ANH.map((o) => {
          const daChup = !!anh[o.key];
          return (
            <div key={o.key}>
              <input
                ref={(el) => { inputs.current[o.key] = el; }}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => chon(o.key, e.target.files?.[0])}
              />
              <button
                onClick={() => inputs.current[o.key]?.click()}
                style={{
                  width: 108, height: 92, borderRadius: 10, cursor: 'pointer',
                  background: daChup ? '#dcfce7' : '#fafafa',
                  border: daChup ? '1px solid #16a34a' : '1px dashed #bbb',
                  color: daChup ? '#14532d' : '#888',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: 6, fontSize: 13,
                }}
              >
                {daChup ? <CheckCircleFilled style={{ fontSize: 20 }} /> : <CameraOutlined style={{ fontSize: 20 }} />}
                {o.nhan}
              </button>
            </div>
          );
        })}
      </div>

      <Button
        type="primary"
        size="large"
        block
        disabled={!duAnh}
        loading={dangTai}
        onClick={() => onTaiLen(anh)}
        style={{ height: 52, fontWeight: 600 }}
      >
        {duAnh ? 'Tải ảnh lên và tính tiền' : `Còn thiếu ${O_ANH.filter((o) => !anh[o.key]).map((o) => o.nhan).join(', ')}`}
      </Button>
      <Text type="secondary" style={{ fontSize: 12 }}>
        Trên máy tính bảng, bấm ô nào sẽ mở camera ô đó.
      </Text>
    </Card>
  );
}
