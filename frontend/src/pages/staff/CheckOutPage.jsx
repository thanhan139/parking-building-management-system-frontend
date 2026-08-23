import { useState } from 'react';
import { App, Alert } from 'antd';
import checkOutService, { errorText, maLoi } from '../../services/checkOutService';
import QuetVe from './QuetVe';
import ChupAnhRa from './ChupAnhRa';
import BangTien from './BangTien';
import ThuTien from './ThuTien';

const CONG_RA = 'CONG-RA';

export default function CheckOutPage() {
  const { message } = App.useApp();
  const [ve, setVe] = useState(null);
  const [ketQua, setKetQua] = useState(null);
  const [daThu, setDaThu] = useState(false);
  const [dangChay, setDangChay] = useState(false);

  const xeTiepTheo = () => {
    setVe(null);
    setKetQua(null);
    setDaThu(false);
  };

  const timVe = async (ma) => {
    setDangChay(true);
    try {
      const res = await checkOutService.preview(ma);
      setVe(ma);
      setKetQua(res.data.result);
    } catch (err) {
      if (maLoi(err) === 1066) {
        setVe(ma);
        setKetQua(null);
        message.info('Vé hợp lệ — còn thiếu ảnh lúc ra');
      } else {
        message.error(errorText(err));
      }
    } finally {
      setDangChay(false);
    }
  };

  const taiAnh = async (anh) => {
    setDangChay(true);
    try {
      await checkOutService.uploadExitPhotos(ve, CONG_RA, anh);
      const res = await checkOutService.preview(ve);
      setKetQua(res.data.result);
    } catch (err) {
      message.error(errorText(err));
    } finally {
      setDangChay(false);
    }
  };

  const themPhuPhi = async (body) => {
    try {
      await checkOutService.addSurcharge({ ...body, ticketCode: ve });
      const res = await checkOutService.preview(ve);
      setKetQua(res.data.result);
    } catch (err) {
      message.error(errorText(err));
    }
  };

  const thuTien = async (method) => {
    setDangChay(true);
    try {
      const res = await checkOutService.checkOut({ ticketCode: ve, method, exitGate: CONG_RA });
      setKetQua(res.data.result);
      setDaThu(true);
    } catch (err) {
      message.error(errorText(err));
    } finally {
      setDangChay(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Xe ra — thu tiền</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <QuetVe onTim={timVe} dangTim={dangChay} veHienTai={ve} onXeTiepTheo={xeTiepTheo} />

        {ve && !ketQua && <ChupAnhRa onTaiLen={taiAnh} dangTai={dangChay} />}

        {ketQua && !daThu && (
          <>
            <Alert type="info" showIcon message="Chưa ghi gì vào sổ. Xem lại bao nhiêu lần cũng được." />
            <BangTien ketQua={ketQua} onThemPhuPhi={themPhuPhi} />
            <ThuTien ketQua={ketQua} daThu={false} dangThu={dangChay} onThu={thuTien} />
          </>
        )}

        {daThu && <ThuTien ketQua={ketQua} daThu onXeTiepTheo={xeTiepTheo} />}
      </div>
    </div>
  );
}
