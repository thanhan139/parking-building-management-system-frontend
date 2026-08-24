import api from './api';

const checkOutService = {
  parkedSessions: () => api.get('/api/check-out/parked'),

  preview: (ticketCode) => api.get('/api/check-out/preview', { params: { ticketCode } }),

  uploadExitPhotos: (ticketCode, gateCode, photos) => {
    const form = new FormData();
    Object.entries(photos).forEach(([field, file]) => form.append(field, file));
    return api.post('/api/check-out/photos', form, {
      params: { ticketCode, gateCode },
    });
  },

  addSurcharge: (body) => api.post('/api/check-out/surcharge', body),

  checkOut: (body) => api.post('/api/check-out', body),

  startPayos: (ticketCode) => api.post('/api/check-out/payos', null, { params: { ticketCode } }),

  paymentStatus: (ticketCode) => api.get('/api/check-out/payment-status', { params: { ticketCode } }),

  getPhotos: (ticketCode) => api.get('/api/check-out/photos', { params: { ticketCode } }),
};

const ERROR_TEXT = {
  1050: 'Không tìm thấy vé này. Kiểm tra lại mã.',
  1055: 'Chưa có biểu giá cho loại xe này. Báo quản trị viên.',
  1070: 'Vé này đã dùng rồi — lượt gửi đã đóng.',
  1066: 'Còn thiếu ảnh lúc ra.',
  1067: 'Lượt gửi này đã thu tiền rồi.',
  1051: 'Mã QR không tồn tại.',
  1052: 'Mã QR đã hết hạn.',
  1053: 'Mã QR này đã được sử dụng.',
  1054: 'Biển số xe không khớp với thông tin check-in.',
  1061: 'Xe chưa ở trạng thái ACTIVE.',
  1062: 'Đặt chỗ chưa tới giờ check-in.',
  1031: 'Gói của xe chưa ở trạng thái ACTIVE.',
  1033: 'Xe đang có lượt gửi hoặc đặt chỗ khác.',
  1043: 'Ô đỗ này hiện không còn trống.',
};

export function errorText(err) {
  const body = err?.response?.data;

  // Tra ma TRUOC: ma nao minh biet thi noi ro cho staff.
  if (ERROR_TEXT[body?.code]) return ERROR_TEXT[body.code];

  // Khong nhan ra ma, lai la 500 -> loi ngoai du kien, dung noi ky thuat voi staff.
  if (err?.response?.status === 500) {
    console.error('Check-out: loi ngoai du kien', err);
    return 'Hệ thống đang gặp lỗi, thử lại hoặc báo quản trị viên.';
  }

  return body?.message || 'Không gọi được máy chủ';
}

export function errorCode(err) {
  return err?.response?.data?.code;
}

export default checkOutService;
