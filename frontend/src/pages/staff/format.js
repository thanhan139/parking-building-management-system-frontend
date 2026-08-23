export const money = (so) => Number(so || 0).toLocaleString('vi-VN') + ' đ';

export const REASON_LABEL = {
  OVERNIGHT: 'Qua đêm',
  DAILY: 'Theo ngày',
  LOST_TICKET: 'Mất thẻ',
  OVERSTAY: 'Quá giờ',
  WRONG_ZONE: 'Đỗ sai khu',
  OTHER: 'Khác',
};
