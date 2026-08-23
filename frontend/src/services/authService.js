import api from './api';

const authService = {
  login: (phoneNumber, password) =>
    api.post('/auth/login', { phoneNumber, password }),

  register: (data) =>
    api.post('/api/register', data),

  getProfile: () =>
    api.get('/api/users/profile'),
};

export default authService;