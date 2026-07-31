const STORAGE_KEYS = {
  users: 'hms_users',
  patients: 'hms_patients',
  doctors: 'hms_doctors',
  appointments: 'hms_appointments',
  settings: 'hms_settings',
  currentUser: 'hms_current_user',
  theme: 'hms_theme'
};

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readJSON(key, fallback = []) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function getCurrentUser() {
  const user = readJSON(STORAGE_KEYS.currentUser, null);
  return user || null;
}

function setCurrentUser(user) {
  saveJSON(STORAGE_KEYS.currentUser, user);
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

function getDefaultSettings() {
  return { theme: 'light', darkMode: false };
}

function getSettings() {
  return { ...getDefaultSettings(), ...readJSON(STORAGE_KEYS.settings, {}) };
}

function saveSettings(settings) {
  saveJSON(STORAGE_KEYS.settings, settings);
}

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  document.documentElement.setAttribute('data-bs-theme', theme === 'dark' ? 'dark' : 'light');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'success'} border-0 show`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
