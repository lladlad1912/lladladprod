const STORAGE_KEY = 'lladlad-guest-comment';

export function loadGuestIdentity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { name: '', key: '' };
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || '',
      key: parsed.key || ''
    };
  } catch {
    return { name: '', key: '' };
  }
}

export function saveGuestIdentity(name, key) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, key }));
}

export function generateGuestKey() {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 8; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
