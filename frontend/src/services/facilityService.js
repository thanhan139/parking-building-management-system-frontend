import api from './api';

const facilityService = {
  getBuildings: () => api.get('/api/buildings'),
  createBuilding: (body) => api.post('/api/buildings', body),
  updateBuilding: (id, body) => api.put(`/api/buildings/${id}`, body),
  deleteBuilding: (id) => api.delete(`/api/buildings/${id}`),

  getFloors: (buildingId) => api.get(`/api/floors/building/${buildingId}`),
  createFloor: (body) => api.post('/api/floors', body),
  updateFloor: (id, body) => api.put(`/api/floors/${id}`, body),
  deleteFloor: (id) => api.delete(`/api/floors/${id}`),

  getZones: (floorId) => api.get(`/api/zones/floor/${floorId}`),
  createZone: (body) => api.post('/api/zones', body),
  updateZone: (id, body) => api.put(`/api/zones/${id}`, body),
  deleteZone: (id) => api.delete(`/api/zones/${id}`),

  getSlots: (zoneId) => api.get(`/api/slots/zone/${zoneId}`),
  createSlot: (body) => api.post('/api/slots', body),
  updateSlot: (id, body) => api.put(`/api/slots/${id}`, body),
  changeSlotStatus: (id, status) => api.patch(`/api/slots/${id}/status`, { status }),
  deleteSlot: (id) => api.delete(`/api/slots/${id}`),
};

const ERROR_TEXT = {
  1019: 'Mã tầng này đã có trong toà nhà. Đổi mã khác.',
  1036: 'Số tầng này đã có trong toà nhà. Chọn số khác.',
  1037: 'Tầng đã đủ số khu cho phép. Nâng "số khu" của tầng trước.',
  1038: 'Khu đã đủ sức chứa. Nâng "sức chứa" của khu trước.',
  1039: 'Tầng này không nhận loại xe đó. Sửa tầng hoặc chọn loại khác.',
  1040: 'Toà nhà còn tầng bên trong. Xoá hết tầng trước.',
  1041: 'Tầng còn khu bên trong. Xoá hết khu trước.',
  1042: 'Khu còn ô bên trong. Xoá hết ô trước.',
  1043: 'Ô đang có xe. Cho xe ra rồi mới sửa hoặc xoá được.',
  1044: 'Sức chứa mới nhỏ hơn số đã tạo. Xoá bớt trước.',
};

export function errorText(err) {
  const body = err?.response?.data;
  return ERROR_TEXT[body?.code] || body?.message || 'Không gọi được máy chủ';
}

export default facilityService;
