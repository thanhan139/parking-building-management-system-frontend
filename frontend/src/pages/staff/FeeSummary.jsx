import { useState } from 'react';
import { Button, Card, Descriptions, InputNumber, Modal, Select, Input, Typography } from 'antd';
import { REASON_LABEL, money } from './format';

const { Text } = Typography;

const REASONS = [
  { value: 'LOST_TICKET', label: 'Mất thẻ' },
  { value: 'WRONG_ZONE', label: 'Đỗ sai khu' },
  { value: 'OVERSTAY', label: 'Quá giờ' },
  { value: 'OTHER', label: 'Khác' },
];

export default function FeeSummary({ step = 3, result, onAddSurcharge }) {
  const [formOpen, setFormOpen] = useState(false);
  const [reason, setReason] = useState('LOST_TICKET');
  const [amount, setAmount] = useState(null);
  const [note, setNote] = useState('');

  const save = () => {
    onAddSurcharge({ reason: reason, amount: amount, note: note || null });
    setFormOpen(false);
    setAmount(null);
    setNote('');
  };

  return (
    <Card title={`${step} · Số tiền phải thu`}>
      <Descriptions size="small" column={2} style={{ marginBottom: 12 }}>
        <Descriptions.Item label="Biển số">{result.plateNumber || '–'}</Descriptions.Item>
        <Descriptions.Item label="Loại xe">
          {result.vehicleCategory === 'CAR' ? 'Ô tô' : 'Xe máy'} · {result.customerType === 'GUEST' ? 'khách vãng lai' : 'thành viên'}
        </Descriptions.Item>
        <Descriptions.Item label="Giờ vào">{result.entryTime?.replace('T', ' ').slice(0, 16)}</Descriptions.Item>
        <Descriptions.Item label="Gửi">{result.hours} giờ</Descriptions.Item>
      </Descriptions>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
        <span>Tiền gửi xe{result.freeParking && <Text type="secondary"> (miễn — còn hạn gói)</Text>}</span>
        <b>{money(result.amountParking)}</b>
      </div>

      {result.surcharges?.map((s, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#7a3e09' }}>
          <span>{REASON_LABEL[s.reason] || s.reason}{s.note ? ` — ${s.note}` : ''}</span>
          <b>{money(s.amount)}</b>
        </div>
      ))}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 12, padding: '14px 16px', borderRadius: 10,
        background: '#fff3d6', border: '2px solid #b45309',
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#7a3e09' }}>TỔNG</span>
        <span style={{ fontSize: 30, fontWeight: 700, color: '#7a3e09' }}>{money(result.amountTotal)}</span>
      </div>

      <Button block type="dashed" style={{ marginTop: 12 }} onClick={() => setFormOpen(true)}>
        + Thêm phụ phí
      </Button>

      <Modal open={formOpen} title="Thêm phụ phí" okText="Cộng vào" cancelText="Huỷ"
             onOk={save} onCancel={() => setFormOpen(false)} okButtonProps={{ disabled: !amount }}>
        <Select value={reason} onChange={setReason} options={REASONS} style={{ width: '100%', marginBottom: 12 }} />
        <InputNumber value={amount} onChange={setAmount} min={1} placeholder="Số tiền"
                     style={{ width: '100%', marginBottom: 12 }} />
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (không bắt buộc)" />
      </Modal>
    </Card>
  );
}
