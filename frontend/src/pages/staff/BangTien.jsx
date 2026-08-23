import { useState } from 'react';
import { Button, Card, Descriptions, InputNumber, Modal, Select, Input, Typography } from 'antd';
import { TEN_LY_DO, tien } from './dinhDang';

const { Text } = Typography;

const LY_DO = [
  { value: 'LOST_TICKET', label: 'Mất thẻ' },
  { value: 'WRONG_ZONE', label: 'Đỗ sai khu' },
  { value: 'OVERSTAY', label: 'Quá giờ' },
  { value: 'OTHER', label: 'Khác' },
];

export default function BangTien({ ketQua, onThemPhuPhi }) {
  const [moForm, setMoForm] = useState(false);
  const [lyDo, setLyDo] = useState('LOST_TICKET');
  const [soTien, setSoTien] = useState(null);
  const [ghiChu, setGhiChu] = useState('');

  const luu = () => {
    onThemPhuPhi({ reason: lyDo, amount: soTien, note: ghiChu || null });
    setMoForm(false);
    setSoTien(null);
    setGhiChu('');
  };

  return (
    <Card title="3 · Số tiền phải thu">
      <Descriptions size="small" column={2} style={{ marginBottom: 12 }}>
        <Descriptions.Item label="Biển số">{ketQua.plateNumber || '–'}</Descriptions.Item>
        <Descriptions.Item label="Loại xe">
          {ketQua.vehicleCategory === 'CAR' ? 'Ô tô' : 'Xe máy'} · {ketQua.customerType === 'GUEST' ? 'khách vãng lai' : 'thành viên'}
        </Descriptions.Item>
        <Descriptions.Item label="Giờ vào">{ketQua.entryTime?.replace('T', ' ').slice(0, 16)}</Descriptions.Item>
        <Descriptions.Item label="Gửi">{ketQua.hours} giờ</Descriptions.Item>
      </Descriptions>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
        <span>Tiền gửi xe{ketQua.freeParking && <Text type="secondary"> (miễn — còn hạn gói)</Text>}</span>
        <b>{tien(ketQua.amountParking)}</b>
      </div>

      {ketQua.surcharges?.map((s, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#7a3e09' }}>
          <span>{TEN_LY_DO[s.reason] || s.reason}{s.note ? ` — ${s.note}` : ''}</span>
          <b>{tien(s.amount)}</b>
        </div>
      ))}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 12, padding: '14px 16px', borderRadius: 10,
        background: '#fff3d6', border: '2px solid #b45309',
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#7a3e09' }}>TỔNG</span>
        <span style={{ fontSize: 30, fontWeight: 700, color: '#7a3e09' }}>{tien(ketQua.amountTotal)}</span>
      </div>

      <Button block type="dashed" style={{ marginTop: 12 }} onClick={() => setMoForm(true)}>
        + Thêm phụ phí
      </Button>

      <Modal open={moForm} title="Thêm phụ phí" okText="Cộng vào" cancelText="Huỷ"
             onOk={luu} onCancel={() => setMoForm(false)} okButtonProps={{ disabled: !soTien }}>
        <Select value={lyDo} onChange={setLyDo} options={LY_DO} style={{ width: '100%', marginBottom: 12 }} />
        <InputNumber value={soTien} onChange={setSoTien} min={1} placeholder="Số tiền"
                     style={{ width: '100%', marginBottom: 12 }} />
        <Input value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="Ghi chú (không bắt buộc)" />
      </Modal>
    </Card>
  );
}
