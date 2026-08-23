import { useState } from 'react';
import { Button, Card, Result, Space } from 'antd';
import { tien } from './dinhDang';

const HINH_THUC = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
  { value: 'VNPAY', label: 'VNPay' },
];

export default function ThuTien({ ketQua, daThu, dangThu, onThu, onXeTiepTheo }) {
  const [hinhThuc, setHinhThuc] = useState('CASH');

  if (daThu) {
    return (
      <Card>
        <Result
          status="success"
          title={`Đã thu ${tien(ketQua.amountTotal)}`}
          subTitle={`Phiếu thu #${ketQua.paymentId} · ${ketQua.paidAt?.replace('T', ' ').slice(0, 19)} · đã mở barrier`}
          extra={
            <Button type="primary" size="large" onClick={onXeTiepTheo} style={{ height: 48 }}>
              Xe tiếp theo
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card title="4 · Khách trả tiền">
      <Space wrap style={{ marginBottom: 16 }}>
        {HINH_THUC.map((h) => (
          <Button
            key={h.value}
            type={hinhThuc === h.value ? 'primary' : 'default'}
            size="large"
            onClick={() => setHinhThuc(h.value)}
            style={{ height: 48, minWidth: 140 }}
          >
            {h.label}
          </Button>
        ))}
      </Space>

      <Button
        block
        size="large"
        loading={dangThu}
        onClick={() => onThu(hinhThuc)}
        style={{
          height: 60, fontSize: 17, fontWeight: 700,
          background: '#2e7d4f', borderColor: '#2e7d4f', color: '#fff',
        }}
      >
        ĐÃ THU TIỀN — MỞ BARRIER
      </Button>
      <p style={{ color: '#c0392b', fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 0 }}>
        Bấm xong không rút lại được.
      </p>
    </Card>
  );
}
