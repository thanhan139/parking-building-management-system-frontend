import api from './api';

const vehicleService = {
  getMyVehicles: () => api.get('/api/vehicles'),
  createVehicle: (formData) => api.post('/api/vehicles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateVehicle: (id, formData) => api.put(`/api/vehicles/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteVehicle: (id) => api.delete(`/api/vehicles/${id}`),
  getVehicleTypes: () => api.get('/api/vehicle-types'),
  getVehicleDrivers: (vehicleId) => api.get(`/api/vehicles/${vehicleId}/drivers`),
  addVehicleDriver: (vehicleId, data) => api.post(`/api/vehicles/${vehicleId}/drivers`, data),
  removeVehicleDriver: (vehicleId, driverId) => api.delete(`/api/vehicles/${vehicleId}/drivers/${driverId}`),
};

export default vehicleService;