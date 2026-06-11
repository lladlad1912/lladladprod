const API_ROOT = (process.env.REACT_APP_API_URL || 'http://localhost:8080').replace(/\/$/, '');

export const API_BASE_URL = `${API_ROOT}/api`;
export const UPLOADS_BASE_URL = `${API_ROOT}/uploads`;
export const SITE_URL = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';

export function uploadUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/uploads/') ? path.slice('/uploads/'.length) : path;
  return `${UPLOADS_BASE_URL}/${normalized}`;
}

export function resolveUploadUrl(urlOrPath) {
  if (!urlOrPath) return null;
  if (urlOrPath.startsWith('http')) return urlOrPath;
  if (urlOrPath.startsWith('/uploads/')) return `${API_ROOT}${urlOrPath}`;
  return uploadUrl(urlOrPath);
}
