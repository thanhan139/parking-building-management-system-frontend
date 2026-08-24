import { useEffect, useRef, useState } from 'react';
import { Alert, Typography } from 'antd';
import jsQR from 'jsqr';

const { Text } = Typography;

export default function QrCamera({ active, onScanned }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!active) return;

    let stream = null;
    let stopped = false;
    let frame = null;
    const video = videoRef.current;

    const scan = () => {
      if (stopped) return;
      const canvas = canvasRef.current;

      if (video?.readyState === video?.HAVE_ENOUGH_DATA && canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const found = jsQR(frame.data, frame.width, frame.height);
        if (found?.data) {
          stopped = true;
          onScanned(found.data.trim().toUpperCase());
          return;
        }
      }
      frame = requestAnimationFrame(scan);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        stream = s;
        if (!video) return;
        video.srcObject = s;
        video.play();
        frame = requestAnimationFrame(scan);
      })
      .catch((e) => setError(e.name === 'NotAllowedError' ? 'Bạn chưa cho phép dùng camera.' : 'Không mở được camera.'));

    return () => {
      stopped = true;
      if (frame) cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active, onScanned]);

  if (error) return <Alert type="warning" showIcon message={error} description="Chọn xe từ danh sách bên dưới." style={{ marginBottom: 16 }} />;

  return (
    <div style={{
      position: 'relative', height: 240, borderRadius: 12, marginBottom: 16,
      background: '#0f172a', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <video ref={videoRef} playsInline muted
             style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{
        position: 'absolute', width: 150, height: 150, borderRadius: 10,
        border: '3px solid #22c55e', boxShadow: '0 0 0 9999px rgba(15,23,42,0.45)',
      }} />
      <Text style={{ position: 'absolute', bottom: 10, color: '#e2e8f0', fontSize: 12 }}>
        Đưa mã QR trên vé vào khung xanh
      </Text>
    </div>
  );
}
