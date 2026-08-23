import api from './api';

const paymentService = {
  createPayment: (data) => api.post('/api/v1/payments/create', data),
  getPaymentHistory: () => api.get('/api/v1/payments/history'),
};

export default paymentService;
