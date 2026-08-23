import api from './api';

const subscriptionService = {
  purchase: (vehicleId, data) =>
    api.post(`/api/vehicles/${vehicleId}/subscriptions`, data),
  getSubscriptions: (vehicleId) =>
    api.get(`/api/vehicles/${vehicleId}/subscriptions`),
  getActiveSubscription: (vehicleId) =>
    api.get(`/api/vehicles/${vehicleId}/subscriptions/active`),
  getPlans: () => api.get('/api/subscription-plans'),
  getPlansByVehicleType: (vehicleTypeId) =>
    api.get(`/api/subscription-plans/vehicle-type/${vehicleTypeId}`),
};

export default subscriptionService;