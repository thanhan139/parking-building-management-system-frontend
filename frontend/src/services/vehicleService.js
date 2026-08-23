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
};

export default vehicleService;