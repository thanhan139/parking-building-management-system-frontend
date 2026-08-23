import { useEffect, useState } from 'react';
import { Button, Modal, Spin, Typography } from 'antd';
import QRCode from 'qrcode';
import checkOutService, { errorText } from '../../services/checkOutService';
import { money } from './format';

const { Text } = Typography;

export default function PayosQr({ ticketCode, onPaid, onClose }) {
  const [order, setOrder] = useState(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stopped = false;

    checkOutService
      .startPayos(ticketCode)
      .then((res) => {
        if (stopped) return;
        const data = res.data.result;
        setOrder(data);
        return QRCode.toDataURL(data.qrCode, { width: 260, margin: 2 }).then(setImage);
      })
      .catch((err) => !stopped && setError(errorText(err)));

    return () => { stopped = true; };
  }, [ticketCode]);

  useEffect(() => {
    if (!order) return;

    const tick = setInterval(async () => {
      try {
        const res = await checkOutService.paymentStatus(ticketCode);
        if (res.data.result?.status === 'PAID') {
          clearInterval(tick);
          onPaid(res.data.result);
        }
      } catch {
        // mang chap chon thi lan sau hoi lai
      }
    }, 3000);

    return () => clearInterval(tick);
  }, [order, ticketCode, onPaid]);

  return (
    <Modal open title="Khách quét mã để trả" onCancel={onClose} footer={null} width={360}>
      <div style={{ textAlign: 'center' }}>
        {error && <Text type="danger">{error}</Text>}
        {!error && !image && <Spin />}

        {image && (
          <>
            <img src={image} alt="VietQR" style={{ width: 260, height: 260 }} />
            <div style={{ fontSize: 24, fontWeight: 700, color: '#7a3e09' }}>
              {money(order.amountTotal)}
            </div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              Mở app ngân hàng, quét mã. Màn hình tự chuyển khi tiền về.
            </Text>
            <Button block style={{ marginTop: 16 }} onClick={onClose}>
              Huỷ, trả tiền mặt
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
