document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearCurrentUser();
      window.location.href = 'login.html';
    });
  }

  const settings = getSettings();
  applyTheme(settings.theme || 'light');
});
