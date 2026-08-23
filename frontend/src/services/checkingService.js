import api from './api';

// Builds FormData with the 5 required check-in images
const buildCheckInForm = (fields, images) => {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  ['front', 'back', 'left', 'right', 'driverFace'].forEach((key) => {
    if (images[key]) form.append(key, images[key]);
  });
  return form;
};

const checkingService = {
  // images: { front, back, left, right, driverFace } — File objects
  guestCheckIn: ({ plateNumber, vehicleCategory, gateCode, images }) =>
    api.post(
      '/api/guest-checking/check-in',
      buildCheckInForm({ plateNumber, vehicleCategory, gateCode }, images),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  // images: { front, back, left, right, driverFace } — File objects
  memberCheckIn: ({ qrToken, currentPlateNumber, entryGate, images }) =>
    api.post(
      `/api/member-checking/check-in?entryGate=${encodeURIComponent(entryGate)}`,
      buildCheckInForm({ qrToken, currentPlateNumber }, images),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),
};

export default checkingService;
