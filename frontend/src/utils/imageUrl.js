import { API_BASE_URL } from '../services/api';

export const resolveImageUrl = (url, { bust = false } = {}) => {
  if (!url) return null;
  const absolute = /^https?:\/\//i.test(url)
    ? url
    : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  if (!bust) return absolute;
  const sep = absolute.includes('?') ? '&' : '?';
  return `${absolute}${sep}t=${Date.now()}`;
};
