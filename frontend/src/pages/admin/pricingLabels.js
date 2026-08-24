import { money } from '../staff/format';

export const CATEGORY = { CAR: 'Ô tô', MOTORCYCLE: 'Xe máy' };

export const CUSTOMER = { GUEST: 'Khách vãng lai', MEMBER: 'Thành viên' };

export const COMBOS = [
  { vehicleCategory: 'CAR', customerType: 'GUEST' },
  { vehicleCategory: 'CAR', customerType: 'MEMBER' },
  { vehicleCategory: 'MOTORCYCLE', customerType: 'GUEST' },
  { vehicleCategory: 'MOTORCYCLE', customerType: 'MEMBER' },
];

export function comboName(rule) {
  return `${CATEGORY[rule.vehicleCategory]} · ${CUSTOMER[rule.customerType]}`;
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
