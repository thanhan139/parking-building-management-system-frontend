import dayjs from 'dayjs';

export const rangeArr = (start, end) =>
  Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i);

export const disabledPastDate = (current) =>
  current && current.isBefore(dayjs().startOf('day'));

export const pastTimeDisabled = (current) => {
  const now = dayjs();
  if (!current || !current.isSame(now, 'day')) return {};
  return {
    disabledHours: () => rangeArr(0, now.hour() - 1),
    disabledMinutes: (selectedHour) =>
      selectedHour === now.hour() ? rangeArr(0, now.minute() - 1) : [],
  };
};
