document.addEventListener('DOMContentLoaded', () => {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }
  const currentUser = getCurrentUser();
  document.getElementById('profileName').value = currentUser.fullName || '';
  document.getElementById('profileEmail').value = currentUser.email || '';
  document.getElementById('profileMobile').value = currentUser.mobile || '';
  document.getElementById('profilePassword').value = currentUser.password || '';
  const form = document.getElementById('profileForm');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const users = readJSON(STORAGE_KEYS.users, []);
    const index = users.findIndex((user) => user.email === currentUser.email);
    users[index] = { ...users[index], fullName: document.getElementById('profileName').value, email: document.getElementById('profileEmail').value, mobile: document.getElementById('profileMobile').value, password: document.getElementById('profilePassword').value };
    saveJSON(STORAGE_KEYS.users, users);
    setCurrentUser(users[index]);
    showToast('Profile updated successfully.', 'success');
  });
});
