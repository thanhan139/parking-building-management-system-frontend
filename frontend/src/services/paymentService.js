import api from './api';

const paymentService = {
  createPayment: (data) => api.post('/api/v1/payments/create', data),
  getPaymentHistory: () => api.get('/api/v1/payments/history'),

  getGatePayments: () => api.get('/api/check-out/payments'),
};

export function errorText(err) {
  const body = err?.response?.data;
  return body?.message || 'Không gọi được máy chủ';
}

export default paymentService;
