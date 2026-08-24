import api from './api';

const subscriptionService = {
  purchase: (vehicleId, data) =>
    api.post(`/api/vehicles/${vehicleId}/subscriptions`, data),
  getSubscriptions: (vehicleId) =>
    api.get(`/api/vehicles/${vehicleId}/subscriptions`),
  getActiveSubscription: (vehicleId) =>
    api.get(`/api/vehicles/${vehicleId}/subscriptions/active`),
  getPlans: () => api.get('/api/subscription-plans'),
  // Lay TAT CA goi (ca goi da an) - danh cho ADMIN/MANAGER
  getAllPlans: () => api.get('/api/subscription-plans/all'),
  getPlansByVehicleType: (vehicleTypeId) =>
    api.get(`/api/subscription-plans/vehicle-type/${vehicleTypeId}`),
  createPlan: (body) => api.post('/api/subscription-plans', body),
  updatePlan: (planId, body) => api.put(`/api/subscription-plans/${planId}`, body),
  deletePlan: (planId) => api.delete(`/api/subscription-plans/${planId}`),
};

export default subscriptionService;