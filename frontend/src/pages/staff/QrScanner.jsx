import { useEffect, useState } from 'react';
import { Button, Divider, Empty, List, Modal, Spin, Tag, Typography } from 'antd';
import QRCode from 'qrcode';
import checkOutService from '../../services/checkOutService';
import QrCamera from './QrCamera';

const { Text } = Typography;

function TicketQr({ item, onClose }) {
  const [dataUrl, setPhotos] = useState(null);

  useEffect(() => {
    QRCode.toDataURL(item.ticketCode, { width: 260, margin: 2 }).then(setPhotos).catch(() => setPhotos(null));
  }, [item]);

  return (
    <Modal open title={`Vé ${item.plateNumber}`} onCancel={onClose} footer={null} width={340}>
      <div style={{ textAlign: 'center' }}>
        {dataUrl ? <img src={dataUrl} alt={item.ticketCode} style={{ width: 260, height: 260 }} /> : <Spin />}
        <div style={{ fontWeight: 700, letterSpacing: 1 }}>{item.ticketCode}</div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Mở màn này trên điện thoại rồi đưa vào camera để quét thật.
        </Text>
      </div>
    </Modal>
  );
}

export default function QrScanner({ open, onClose, onScanned }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrOf, setQrOf] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    checkOutService
      .parkedSessions()
      .then((res) => setList(res.data.result || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <Modal open={open} title="Quét mã QR trên vé" onCancel={onClose} footer={null} width={520}>
      <QrCamera active={open} onScanned={onScanned} />

      <Divider plain><Text type="secondary" style={{ fontSize: 12 }}>hoặc chọn xe đang gửi</Text></Divider>

      <Spin spinning={loading}>
        {list.length === 0 && !loading ? (
          <Empty description="Không có xe nào đang gửi" />
        ) : (
          <List
            size="small"
            dataSource={list}
            style={{ maxHeight: 240, overflowY: 'auto' }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="qr" size="small" onClick={() => setQrOf(item)}>Xem QR</Button>,
                  <Button key="pick" size="small" type="primary" onClick={() => onScanned(item.ticketCode)}>Chọn</Button>,
                ]}
              >
                <List.Item.Meta
                  title={<span style={{ fontWeight: 600 }}>{item.plateNumber}</span>}
                  description={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.ticketCode} · vào {item.entryTime?.replace('T', ' ').slice(0, 16)}
                    </Text>
                  }
                />
                <Tag color={item.vehicleCategory === 'CAR' ? 'blue' : 'green'}>
                  {item.vehicleCategory === 'CAR' ? 'Ô tô' : 'Xe máy'}
                </Tag>
              </List.Item>
            )}
          />
        )}
      </Spin>

      {qrOf && <TicketQr item={qrOf} onClose={() => setQrOf(null)} />}
    </Modal>
  );
}
