import api from './api';

const adminUserService = {
  getAllUsers: () => api.get('/api/admin/users'),
  updateUserRole: (userId, role) => api.put(`/api/admin/users/${userId}/role`, null, { params: { role } }),
  createStaff: (body) => api.post('/api/admin/staff/create', body),
  lockUser: (userId) => api.put(`/api/admin/users/${userId}/lock`),
  unlockUser: (userId) => api.put(`/api/admin/users/${userId}/unlock`),
};

export default adminUserService;
