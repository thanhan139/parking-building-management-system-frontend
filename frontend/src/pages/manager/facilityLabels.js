export const ICON = { color: '#8c8c8c' };

export const CATEGORY = { CAR: 'Ô tô', MOTORCYCLE: 'Xe máy' };

export const POWER = { PETROL_ONLY: 'Xăng', ELECTRIC_ONLY: 'Điện', MIXED: 'Hỗn hợp' };

export const SLOT_STYLE = {
  AVAILABLE: { bg: '#dcfce7', border: '#16a34a', label: 'Trống' },
  OCCUPIED: { bg: '#fee2e2', border: '#dc2626', label: 'Có xe' },
  RESERVED: { bg: '#dbeafe', border: '#2563eb', label: 'Đặt trước' },
  MAINTENANCE: { bg: '#fef3c7', border: '#d97706', label: 'Bảo trì' },
  LOCKED: { bg: '#e5e5e5', border: '#737373', label: 'Khoá' },
};

export function loaiXeChoPhep(floor) {
  return [
    floor.allowCar && { value: 'CAR', label: 'Ô tô' },
    floor.allowMotorbike && { value: 'MOTORCYCLE', label: 'Xe máy' },
  ].filter(Boolean);
}
