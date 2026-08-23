import api from './api';

const reservationService = {
  createReservation: (vehicleId, data) =>
    api.post(`/api/vehicles/${vehicleId}/reservations`, data),
  getMyReservations: () => api.get('/api/reservations'),
  cancelReservation: (reservationId) =>
    api.put(`/api/reservations/${reservationId}/cancel`),
};

export default reservationService;
