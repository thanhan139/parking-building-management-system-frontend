import { useEffect, useState } from 'react';
import { Alert, Card, Modal, Spin, Typography } from 'antd';
import checkOutService, { errorText } from '../../services/checkOutService';

const { Text } = Typography;

const NHAN = {
  FRONT: 'Trước',
  BACK: 'Sau',
  LEFT: 'Trái',
  RIGHT: 'Phải',
  DRIVER_FACE: 'Mặt tài xế',
};

const PHASE = { ENTRY: 'Ảnh lúc vào', EXIT: 'Ảnh lúc ra' };

function gioPhut(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function Hang({ tieuDe, anh, onXem }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <Text strong style={{ fontSize: 13 }}>{tieuDe}</Text>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
        {anh.map((tam) => (
          <button
            key={tam.phase + tam.photoType}
            onClick={() => onXem(tam)}
            style={{
              position: 'relative', width: 132, height: 100, borderRadius: 8, padding: 0,
              overflow: 'hidden', cursor: 'pointer', background: '#000', border: '1px solid #d9d9d9',
            }}
          >
            <img
              src={tam.url}
              alt={NHAN[tam.photoType] || tam.photoType}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, padding: '2px 6px',
              background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, fontWeight: 600,
            }}>
              {NHAN[tam.photoType] || tam.photoType}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EntryPhotos({ ticketCode }) {
  const [anh, setAnh] = useState(null);
  const [loi, setLoi] = useState(null);
  const [xem, setXem] = useState(null);

  useEffect(() => {
    let dungLai = false;
    setAnh(null);
    setLoi(null);

    checkOutService
      .getPhotos(ticketCode)
      .then((res) => !dungLai && setAnh(res.data.result || []))
      .catch((err) => !dungLai && setLoi(errorText(err)));

    return () => { dungLai = true; };
  }, [ticketCode]);

  const cua = (phase) => (anh || []).filter((tam) => tam.phase === phase);

  return (
    <Card size="small" title="Ảnh để đối chiếu">
      {loi && <Alert type="error" showIcon message={loi} />}
      {!loi && !anh && <Spin />}

      {anh && !anh.length && (
        <Alert type="warning" showIcon message="Lượt gửi này không có ảnh nào. Không đối chiếu được." />
      )}

      {anh && ['ENTRY', 'EXIT'].map((phase) => (
        cua(phase).length > 0 && (
          <Hang
            key={phase}
            tieuDe={`${PHASE[phase]} · cổng ${cua(phase)[0].gateCode} · ${gioPhut(cua(phase)[0].capturedAt)}`}
            anh={cua(phase)}
            onXem={setXem}
          />
        )
      ))}

      <Text type="secondary" style={{ fontSize: 12 }}>
        Bấm vào ảnh để xem to. So xe trước mặt với ảnh lúc vào trước khi mở barrier.
      </Text>

      <Modal
        open={!!xem}
        title={xem ? `${PHASE[xem.phase]} — ${NHAN[xem.photoType] || xem.photoType}` : ''}
        onCancel={() => setXem(null)}
        width={720}
        footer={null}
      >
        {xem && (
          <img
            src={xem.url}
            alt={NHAN[xem.photoType]}
            style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', background: '#000' }}
          />
        )}
      </Modal>
    </Card>
  );
}
