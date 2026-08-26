import api from './api';

const adminUserService = {
  getAllUsers: () => api.get('/api/admin/users'),
  updateUserRole: (userId, role) => api.put(`/api/admin/users/${userId}/role`, null, { params: { role } }),
};

export default adminUserService;
