import { useState } from 'react';
import { App, Alert } from 'antd';
import checkOutService, { errorText, errorCode } from '../../services/checkOutService';
import ScanTicket from './ScanTicket';
import ExitPhotos from './ExitPhotos';
import FeeSummary from './FeeSummary';
import PaymentStep from './PaymentStep';

const EXIT_GATE = 'CONG-RA';

export default function CheckOutPage() {
  const { message } = App.useApp();
  const [ticket, setTicket] = useState(null);
  const [result, setResult] = useState(null);
  const [paid, setPaid] = useState(false);
  const [busy, setBusy] = useState(false);

  const nextVehicle = () => {
    setTicket(null);
    setResult(null);
    setPaid(false);
  };

  const findTicket = async (code) => {
    setBusy(true);
    try {
      const res = await checkOutService.preview(code);
      setTicket(code);
      setResult(res.data.result);
    } catch (err) {
      if (errorCode(err) === 1066) {
        setTicket(code);
        setResult(null);
        message.info('Vé hợp lệ — còn thiếu ảnh lúc ra');
      } else {
        message.error(errorText(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const uploadPhotos = async (photos) => {
    setBusy(true);
    try {
      await checkOutService.uploadExitPhotos(ticket, EXIT_GATE, photos);
      const res = await checkOutService.preview(ticket);
      setResult(res.data.result);
    } catch (err) {
      message.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  const addSurcharge = async (body) => {
    try {
      await checkOutService.addSurcharge({ ...body, ticketCode: ticket });
      const res = await checkOutService.preview(ticket);
      setResult(res.data.result);
    } catch (err) {
      message.error(errorText(err));
    }
  };

  const pay = async (method) => {
    setBusy(true);
    try {
      const res = await checkOutService.checkOut({ ticketCode: ticket, method, exitGate: EXIT_GATE });
      setResult(res.data.result);
      setPaid(true);
    } catch (err) {
      message.error(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Xe ra — thu tiền</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ScanTicket onFind={findTicket} finding={busy} ticketCode={ticket} onNext={nextVehicle} />

        {ticket && !result && <ExitPhotos onUpload={uploadPhotos} loading={busy} />}

        {result && !paid && (
          <>
            <Alert type="info" showIcon message="Chưa ghi gì vào sổ. Xem lại bao nhiêu lần cũng được." />
            <FeeSummary result={result} onAddSurcharge={addSurcharge} />
            <PaymentStep result={result} paid={false} paying={busy} onPay={pay} />
          </>
        )}

        {paid && <PaymentStep result={result} paid onNext={nextVehicle} />}
      </div>
    </div>
  );
}
