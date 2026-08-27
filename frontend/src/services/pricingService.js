import api from './api';

const pricingService = {
  getByCategory: (vehicleCategory) => api.get(`/api/pricing-rules/category/${vehicleCategory}`),
  create: (body) => api.post('/api/pricing-rules', body),
  update: (id, body) => api.put(`/api/pricing-rules/${id}`, body),
  remove: (id) => api.delete(`/api/pricing-rules/${id}`),
};

const ERROR_TEXT = {
  1055: 'Không tìm thấy biểu giá này.',
  1056: 'Đã có biểu giá khác phủ khoảng thời gian này. Chọn ngày hiệu lực khác.',
  1057: 'Giá mới chỉ được áp dụng từ NGÀY MAI trở đi.',
  1058: 'Chỉ được bật MỘT loại phụ phí tự động: qua đêm hoặc theo ngày.',
  1059: 'Ngày kết thúc phải sau ngày bắt đầu.',
  1060: 'Biểu giá đã tới ngày hiệu lực nên không xoá được.',
};

export function errorText(err) {
  const body = err?.response?.data;
  return ERROR_TEXT[body?.code] || body?.message || 'Không gọi được máy chủ';
}

export default pricingService;
