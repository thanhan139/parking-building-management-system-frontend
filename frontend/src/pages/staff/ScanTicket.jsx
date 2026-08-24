import { useState } from 'react';
import { Button, Card, Input, Space, Typography } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import QrScanner from './QrScanner';

const { Text } = Typography;

export default function ScanTicket({ onFind, finding, ticketCode, onNext }) {
  const [code, setCode] = useState('');
  const [scanOpen, setScanOpen] = useState(false);

  if (ticketCode) {
    return (
      <Card>
        <Space size="large" align="center">
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>MÃ VÉ</Text>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{ticketCode}</div>
          </div>
          {onNext && <Button size="large" onClick={onNext}>Xe tiếp theo</Button>}
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
        onClick={() => setScanOpen(true)}
        style={{ height: 64, fontSize: 17, fontWeight: 600, marginBottom: 12 }}
      >
        QUÉT MÃ QR
      </Button>

      <QrScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanned={(code) => { setScanOpen(false); onFind(code); }}
      />

      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        hoặc gõ tay mã vé
      </Text>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          size="large"
          autoFocus
          value={code}
          placeholder="GUEST-XXXXXXXX"
          onChange={(e) => setCode(e.target.value.trim().toUpperCase())}
          onPressEnter={() => code && onFind(code)}
          style={{ fontSize: 18, height: 48 }}
        />
        <Button size="large" loading={finding} disabled={!code}
                onClick={() => onFind(code)} style={{ height: 48, paddingInline: 24 }}>
          Tìm vé
        </Button>
      </Space.Compact>
    </Card>
  );
}
