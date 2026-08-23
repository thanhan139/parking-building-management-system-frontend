import { useState } from 'react';
import { Button, Card, Input, Space, Typography } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import QuetQr from './QuetQr';

const { Text } = Typography;

export default function QuetVe({ onTim, dangTim, veHienTai, onXeTiepTheo }) {
  const [ma, setMa] = useState('');
  const [moQr, setMoQr] = useState(false);

  if (veHienTai) {
    return (
      <Card>
        <Space size="large" align="center">
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>MÃ VÉ</Text>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{veHienTai}</div>
          </div>
          <Button size="large" onClick={onXeTiepTheo}>Xe tiếp theo</Button>
        </Space>
      </Card>
    );
  }

  return (
    <Card title="1 · Quét vé">
      <Button
        type="primary"
        size="large"
        block
        icon={<QrcodeOutlined />}
        onClick={() => setMoQr(true)}
        style={{ height: 64, fontSize: 17, fontWeight: 600, marginBottom: 12 }}
      >
        QUÉT MÃ QR
      </Button>

      <QuetQr
        open={moQr}
        onDong={() => setMoQr(false)}
        onQuetTrung={(code) => { setMoQr(false); onTim(code); }}
      />

      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        hoặc gõ tay mã vé
      </Text>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          size="large"
          autoFocus
          value={ma}
          placeholder="GUEST-XXXXXXXX"
          onChange={(e) => setMa(e.target.value.trim().toUpperCase())}
          onPressEnter={() => ma && onTim(ma)}
          style={{ fontSize: 18, height: 48 }}
        />
        <Button size="large" loading={dangTim} disabled={!ma}
                onClick={() => onTim(ma)} style={{ height: 48, paddingInline: 24 }}>
          Tìm vé
        </Button>
      </Space.Compact>
    </Card>
  );
}
