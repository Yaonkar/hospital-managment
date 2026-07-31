document.addEventListener('DOMContentLoaded', () => {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }
  const settings = getSettings();
  document.getElementById('themeToggle').checked = settings.theme === 'dark';
  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    const nextSettings = { ...settings, theme: document.getElementById('themeToggle').checked ? 'dark' : 'light' };
    saveSettings(nextSettings);
    applyTheme(nextSettings.theme);
    showToast('Settings saved.', 'success');
  });

  document.getElementById('clearDataBtn').addEventListener('click', () => {
    if (!confirm('Clear all local data?')) return;
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    showToast('Data cleared.', 'success');
    window.location.href = 'login.html';
  });

  document.getElementById('resetAppBtn').addEventListener('click', () => {
    if (!confirm('Reset the application to default state?')) return;
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    window.location.href = 'login.html';
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const payload = {
      users: readJSON(STORAGE_KEYS.users, []),
      patients: readJSON(STORAGE_KEYS.patients, []),
      doctors: readJSON(STORAGE_KEYS.doctors, []),
      appointments: readJSON(STORAGE_KEYS.appointments, [])
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hospital-data.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('importBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('importFile');
    if (!fileInput.files.length) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        saveJSON(STORAGE_KEYS.users, payload.users || []);
        saveJSON(STORAGE_KEYS.patients, payload.patients || []);
        saveJSON(STORAGE_KEYS.doctors, payload.doctors || []);
        saveJSON(STORAGE_KEYS.appointments, payload.appointments || []);
        showToast('Import complete.', 'success');
      } catch (error) {
        showToast('Invalid JSON file.', 'danger');
      }
    };
    reader.readAsText(fileInput.files[0]);
  });
});
