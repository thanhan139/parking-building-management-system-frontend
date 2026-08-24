import api from './api';

const userService = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.put('/api/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  changePassword: (oldPassword, newPassword) =>
    api.put('/api/users/password', { oldPassword, newPassword }),
};

export default userService;
