import { useEffect, useState } from 'react';
import { Alert, Card, Checkbox, Modal, Spin, Typography } from 'antd';
import checkOutService, { errorText } from '../../services/checkOutService';

const { Text } = Typography;

const NHAN = { FRONT: 'Trước', BACK: 'Sau', LEFT: 'Trái', RIGHT: 'Phải', DRIVER_FACE: 'Mặt tài xế' };
const DOI_CHIEU = [
  { loai: 'FRONT', ten: 'Biển số xe' },
  { loai: 'DRIVER_FACE', ten: 'Mặt tài xế' },
];
const QUAY_XE = ['BACK', 'LEFT', 'RIGHT'];

function gioPhut(v) {
  if (!v) return '';
  const d = new Date(v);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function Anh({ tam, cao, onXem }) {
  if (!tam) {
    return (
      <div style={{
        height: cao, borderRadius: 8, background: '#f5f5f5', border: '1px dashed #d9d9d9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c', fontSize: 12,
      }}>
        không có ảnh
      </div>
    );
  }
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onXem(tam); }}
      style={{
        display: 'block', width: '100%', height: cao, borderRadius: 8, padding: 0,
        overflow: 'hidden', cursor: 'pointer', background: '#000', border: '1px solid #d9d9d9',
      }}
    >
      <img src={tam.url} alt={NHAN[tam.photoType]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </button>
  );
}

export default function EntryPhotos({ ticketCode, onXacNhan }) {
  const [anh, setAnh] = useState(null);
  const [loi, setLoi] = useState(null);
  const [xem, setXem] = useState(null);
  const [tick, setTick] = useState({});

  useEffect(() => {
    let dungLai = false;
    setAnh(null); setLoi(null); setTick({});
    onXacNhan?.(false);
    checkOutService.getPhotos(ticketCode)
      .then((res) => !dungLai && setAnh(res.data.result || []))
      .catch((err) => !dungLai && setLoi(errorText(err)));
    return () => { dungLai = true; };
  }, [ticketCode, onXacNhan]);

  const tim = (phase, loai) => (anh || []).find((t) => t.phase === phase && t.photoType === loai);
  const cua = (phase) => (anh || []).filter((t) => t.phase === phase);

  const danhDau = (loai, on) => {
    const moi = { ...tick, [loai]: on };
    setTick(moi);
    onXacNhan?.(DOI_CHIEU.every((d) => moi[d.loai]));
  };

  return (
    <Card size="small" title="Ảnh để đối chiếu">
      {loi && <Alert type="error" showIcon message={loi} />}
      {!loi && !anh && <Spin />}
      {anh && !anh.length && (
        <Alert type="warning" showIcon message="Lượt gửi này không có ảnh nào. Không đối chiếu được." />
      )}

      {anh && anh.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
            {DOI_CHIEU.map((d) => (
              <div
                key={d.loai}
                role="button"
                tabIndex={0}
                onClick={() => danhDau(d.loai, !tick[d.loai])}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && danhDau(d.loai, !tick[d.loai])}
                style={{
                  border: `2px solid ${tick[d.loai] ? '#2e7d4f' : '#ffbb96'}`,
                  borderRadius: 10, padding: 12, cursor: 'pointer', userSelect: 'none',
                  background: tick[d.loai] ? '#f6ffed' : '#fff7f0',
                  transition: 'background .15s, border-color .15s',
                }}
              >
                <Text strong style={{ fontSize: 14 }}>{d.ten}</Text>

                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Lúc vào</Text>
                  <Anh tam={tim('ENTRY', d.loai)} cao={132} onXem={setXem} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Lúc ra</Text>
                  <Anh tam={tim('EXIT', d.loai)} cao={132} onXem={setXem} />
                </div>

                <Checkbox
                  checked={!!tick[d.loai]}
                  readOnly
                  style={{ marginTop: 12, fontWeight: 600, pointerEvents: 'none' }}
                >
                  {tick[d.loai] ? `${d.ten} khớp` : `Bấm vào đây nếu ${d.ten.toLowerCase()} khớp`}
                </Checkbox>
              </div>
            ))}
          </div>

          {['ENTRY', 'EXIT'].map((phase) => (
            cua(phase).length > 0 && (
              <div key={phase} style={{ marginBottom: 10 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {phase === 'ENTRY' ? 'Quây xe lúc vào' : 'Quây xe lúc ra'}
                  {' · cổng '}{cua(phase)[0].gateCode}{' · '}{gioPhut(cua(phase)[0].capturedAt)}
                </Text>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {QUAY_XE.map((loai) => (
                    <div key={loai} style={{ width: 108 }}>
                      <Anh tam={tim(phase, loai)} cao={74} onXem={setXem} />
                      <div style={{ fontSize: 11, textAlign: 'center', color: '#8c8c8c' }}>{NHAN[loai]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          <Text type="secondary" style={{ fontSize: 12 }}>
            Bấm vào ảnh để xem to. Bấm vào thẻ để xác nhận — đủ hai thẻ xanh mới mở được barrier.
          </Text>
        </>
      )}

      <Modal
        open={!!xem}
        title={xem ? `${xem.phase === 'ENTRY' ? 'Lúc vào' : 'Lúc ra'} — ${NHAN[xem.photoType]}` : ''}
        onCancel={() => setXem(null)}
        width={720}
        footer={null}
      >
        {xem && (
          <img src={xem.url} alt={NHAN[xem.photoType]}
               style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', background: '#000' }} />
        )}
      </Modal>
    </Card>
  );
}
