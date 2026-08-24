import { useState } from 'react';
import { Button, Card, Result, Space } from 'antd';
import { money } from './format';

const METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
  { value: 'VNPAY', label: 'Quét mã QR' },
];

const METHOD_GOI = [{ value: 'SUBSCRIPTION', label: 'Gói tháng' }];

export default function PaymentStep({ step = 4, result, paid, paying, onPay, onNext, onVnPay }) {
  // Xe con han goi thi tien gui da la 0. Neu khong con phu phi nao thi
  // khong thu gi ca — chi ghi nhan tra bang goi roi mo barrier.
  const traBangGoi = !!result?.freeParking && Number(result?.amountTotal || 0) === 0;
  const danhSach = traBangGoi ? METHOD_GOI : METHODS;
  const [method, setMethod] = useState(traBangGoi ? 'SUBSCRIPTION' : 'CASH');

  if (paid) {
    return (
      <Card>
        <Result
          status="success"
          title={`Đã thu ${money(result.amountTotal)}`}
          subTitle={`Phiếu thu #${result.paymentId} · ${result.paidAt?.replace('T', ' ').slice(0, 19)} · đã mở barrier`}
          extra={
            <Button type="primary" size="large" onClick={onNext} style={{ height: 48 }}>
              Xe tiếp theo
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card title={`${step} · Khách trả tiền`}>
      <Space wrap style={{ marginBottom: 16 }}>
        {danhSach.map((h) => (
          <Button
            key={h.value}
            type={method === h.value ? 'primary' : 'default'}
            size="large"
            onClick={() => setMethod(h.value)}
            style={{ height: 48, minWidth: 140 }}
          >
            {h.label}
          </Button>
        ))}
      </Space>

      <Button
        block
        size="large"
        loading={paying}
        onClick={() => (method === 'VNPAY' ? onVnPay() : onPay(method))}
        style={{
          height: 60, fontSize: 17, fontWeight: 700,
          background: '#2e7d4f', borderColor: '#2e7d4f', color: '#fff',
        }}
      >
        {method === 'VNPAY' ? 'HIỆN MÃ QR CHO KHÁCH QUÉT'
          : traBangGoi ? 'MỞ BARRIER — KHÁCH CÓ GÓI'
          : 'ĐÃ THU TIỀN — MỞ BARRIER'}
      </Button>
      <p style={{ color: '#c0392b', fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 0 }}>
        {method === 'VNPAY' ? 'Khách quét xong, màn hình tự chuyển.'
          : traBangGoi ? 'Không thu tiền — xe còn hạn gói.'
          : 'Bấm xong không rút lại được.'}
      </p>
    </Card>
  );
}
