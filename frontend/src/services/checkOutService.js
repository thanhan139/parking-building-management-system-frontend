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
};

const ERROR_TEXT = {
  1050: 'Không tìm thấy vé này. Kiểm tra lại mã.',
  1055: 'Chưa có biểu giá cho loại xe này. Báo quản trị viên.',
  1065: 'Vé này đã dùng rồi — lượt gửi đã đóng.',
  1066: 'Còn thiếu ảnh lúc ra.',
  1067: 'Lượt gửi này đã thu tiền rồi.',
  QR_TOKEN_NOT_EXISTED: 'Mã QR không tồn tại.',
  QR_TOKEN_EXPIRED: 'Mã QR đã hết hạn.',
  QR_TOKEN_ALREADY_USED: 'Mã QR này đã được sử dụng.',
  PLATE_MISMATCH: 'Biển số xe không khớp với thông tin check-in.',
  SLOT_NOT_AVAILABLE: 'Slot hiện không còn sẵn sàng.',
  VEHICLE_NOT_ACTIVE: 'Vehicle chưa ACTIVE.',
  SUBSCRIPTION_NOT_ACTIVE: 'Subscription của vehicle chưa ACTIVE.',
  RESERVATION_ACTIVE_EXISTS: 'Vehicle đang có lượt gửi hoặc reservation đang hoạt động.',
};

export function errorText(err) {
  const body = err?.response?.data;
  if (err?.response?.status === 400 || err?.response?.status === 500) {
    console.error('Check-out backend/schema error:', err);
    return 'Hệ thống đang gặp lỗi dữ liệu, vui lòng thử lại sau hoặc liên hệ admin.';
  }
  return ERROR_TEXT[body?.code] || body?.message || 'Không gọi được máy chủ';
}

export function errorCode(err) {
  return err?.response?.data?.code;
}

export default checkOutService;
