import { useEffect, useState } from 'react';
import { Button, Divider, Empty, List, Modal, Spin, Tag, Typography } from 'antd';
import QRCode from 'qrcode';
import checkOutService from '../../services/checkOutService';
import CameraQr from './CameraQr';

const { Text } = Typography;

function VeQr({ ve, onDong }) {
  const [anh, setAnh] = useState(null);

  useEffect(() => {
    QRCode.toDataURL(ve.ticketCode, { width: 260, margin: 2 }).then(setAnh).catch(() => setAnh(null));
  }, [ve]);

  return (
    <Modal open title={`Vé ${ve.plateNumber}`} onCancel={onDong} footer={null} width={340}>
      <div style={{ textAlign: 'center' }}>
        {anh ? <img src={anh} alt={ve.ticketCode} style={{ width: 260, height: 260 }} /> : <Spin />}
        <div style={{ fontWeight: 700, letterSpacing: 1 }}>{ve.ticketCode}</div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Mở màn này trên điện thoại rồi đưa vào camera để quét thật.
        </Text>
      </div>
    </Modal>
  );
}

export default function QuetQr({ open, onDong, onQuetTrung }) {
  const [danhSach, setDanhSach] = useState([]);
  const [dangTai, setDangTai] = useState(false);
  const [xemVe, setXemVe] = useState(null);

  useEffect(() => {
    if (!open) return;
    setDangTai(true);
    checkOutService
      .parkedSessions()
      .then((res) => setDanhSach(res.data.result || []))
      .catch(() => setDanhSach([]))
      .finally(() => setDangTai(false));
  }, [open]);

  return (
    <Modal open={open} title="Quét mã QR trên vé" onCancel={onDong} footer={null} width={520}>
      <CameraQr dangBat={open} onQuetTrung={onQuetTrung} />

      <Divider plain><Text type="secondary" style={{ fontSize: 12 }}>hoặc chọn xe đang gửi</Text></Divider>

      <Spin spinning={dangTai}>
        {danhSach.length === 0 && !dangTai ? (
          <Empty description="Không có xe nào đang gửi" />
        ) : (
          <List
            size="small"
            dataSource={danhSach}
            style={{ maxHeight: 240, overflowY: 'auto' }}
            renderItem={(ve) => (
              <List.Item
                actions={[
                  <Button key="qr" size="small" onClick={() => setXemVe(ve)}>Xem QR</Button>,
                  <Button key="chon" size="small" type="primary" onClick={() => onQuetTrung(ve.ticketCode)}>Chọn</Button>,
                ]}
              >
                <List.Item.Meta
                  title={<span style={{ fontWeight: 600 }}>{ve.plateNumber}</span>}
                  description={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {ve.ticketCode} · vào {ve.entryTime?.replace('T', ' ').slice(0, 16)}
                    </Text>
                  }
                />
                <Tag color={ve.vehicleCategory === 'CAR' ? 'blue' : 'green'}>
                  {ve.vehicleCategory === 'CAR' ? 'Ô tô' : 'Xe máy'}
                </Tag>
              </List.Item>
            )}
          />
        )}
      </Spin>

      {xemVe && <VeQr ve={xemVe} onDong={() => setXemVe(null)} />}
    </Modal>
  );
}
