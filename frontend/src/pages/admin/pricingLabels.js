import { money } from '../staff/format';

export const CATEGORY = { CAR: 'Ô tô', MOTORCYCLE: 'Xe máy' };

export const CUSTOMER = { GUEST: 'Khách vãng lai', MEMBER: 'Thành viên' };

// Backend quan ly gia theo vehicle_type cu the, khong theo category.
export const TYPE_LABELS = {
  X_MOTO: 'Xe máy xăng',
  E_MOTO: 'Xe máy điện',
  CAR_PETROL: 'Ô tô xăng',
  CAR_ELECTRIC: 'Ô tô điện',
  CAR_HYBRID: 'Ô tô hybrid',
};

const CODE_CATEGORY = {
  X_MOTO: 'MOTORCYCLE',
  E_MOTO: 'MOTORCYCLE',
  CAR_PETROL: 'CAR',
  CAR_ELECTRIC: 'CAR',
  CAR_HYBRID: 'CAR',
};

export function ruleCategory(rule) {
  return rule.vehicleCategory || CODE_CATEGORY[rule.vehicleTypeCode];
}

export function comboName(rule) {
  const cat = ruleCategory(rule);
  return `${TYPE_LABELS[rule.vehicleTypeCode] || CATEGORY[cat] || 'Không rõ loại'} · ${CUSTOMER[rule.customerType] || '—'}`;
}

export function ruleState(rule) {
  const now = Date.now();
  const from = new Date(rule.effectiveFrom).getTime();
  const to = rule.effectiveTo ? new Date(rule.effectiveTo).getTime() : null;

  if (from > now) return { key: 'SCHEDULED', label: 'Sắp áp dụng', color: 'blue' };
  if (to === null || to > now) return { key: 'RUNNING', label: 'Đang chạy', color: 'green' };
  return { key: 'CLOSED', label: 'Đã đóng', color: 'default' };
}

export function firstBlockText(rule) {
  return `${rule.firstBlockHours} giờ đầu — ${money(rule.firstBlockPrice)}`;
}

export function nextBlockText(rule) {
  if (!rule.blockHours) return 'Không tính thêm sau khối đầu';
  return `Mỗi ${rule.blockHours} giờ tiếp — ${money(rule.blockPrice)}`;
}

export function surchargeText(rule) {
  if (rule.overnightFee) return `Qua đêm (mốc ${String(rule.overnightHour).slice(0, 5)}) — ${money(rule.overnightFee)}`;
  if (rule.dailyFee) return `Theo ngày — ${money(rule.dailyFee)}`;
  return 'Không có phụ phí tự động';
}

function pad(so) {
  return String(so).padStart(2, '0');
}

export function dayText(value) {
  if (!value) return 'không giới hạn';
  const d = new Date(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function shortTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
