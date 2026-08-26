import api from './api';

const complaintService = {
  create: ({ title, description, sessionId, images }) => {
    const form = new FormData();
    form.append('title', title);
    form.append('description', description);
    if (sessionId !== null && sessionId !== undefined && sessionId !== '') {
      form.append('sessionId', sessionId);
    }
    images.forEach((file) => form.append('images', file));
    return api.post('/api/complaints', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMine: () => api.get('/api/complaints/my'),
  getMineById: (complaintId) => api.get(`/api/complaints/my/${complaintId}`),
  remove: (complaintId) => api.delete(`/api/complaints/${complaintId}`),
  getAll: () => api.get('/api/complaints'),
  getById: (complaintId) => api.get(`/api/complaints/${complaintId}`),
  updateStatus: (complaintId, status) =>
    api.patch(`/api/complaints/${complaintId}/status`, { status }),
};

export default complaintService;
