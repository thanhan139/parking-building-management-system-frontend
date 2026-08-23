import api from './api';

const reservationService = {
  createReservation: (vehicleId, data) =>
    api.post(`/api/vehicles/${vehicleId}/reservations`, data),
  getMyReservations: () => api.get('/api/reservations'),
  cancelReservation: (reservationId) =>
    api.put(`/api/reservations/${reservationId}/cancel`),
  // returns raw object (not ApiResponse-wrapped): {token, reservationId, vehicleId, plateNumber, expiresAt}
  createQrToken: (reservationId) =>
    api.post(`/api/reservations/${reservationId}/qr-token`),
};

export default reservationService;
