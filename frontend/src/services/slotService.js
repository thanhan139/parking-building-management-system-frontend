import api from './api';

const slotService = {
  searchAvailable: (params) => api.get('/api/slots/available', { params }),
  getSlotsByZone: (zoneId) => api.get(`/api/slots/zone/${zoneId}`),
};

export default slotService;
