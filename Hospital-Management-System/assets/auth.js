document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('authForm');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');
  const authMode = document.getElementById('authMode');
  const currentPage = window.location.pathname.split('/').pop();

  const users = readJSON(STORAGE_KEYS.users, []);
  const settings = getSettings();
  applyTheme(settings.theme || 'light');

  if (currentPage === 'login.html' && getCurrentUser()) {
    window.location.href = 'dashboard.html';
    return;
  }

  if (currentPage === 'register.html' && getCurrentUser()) {
    window.location.href = 'dashboard.html';
    return;
  }

  if (currentPage === 'index.html' || currentPage === '') {
    if (getCurrentUser()) {
      window.location.href = 'dashboard.html';
    }
    return;
  }

  if (authForm) {
    authForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(authForm);
      const payload = Object.fromEntries(formData.entries());

      if (authMode && authMode.value === 'register') {
        const errors = [];
        if (!payload.fullName) errors.push('Full name is required.');
        if (!payload.email) {
          errors.push('Email is required.');
        } else if (validateEmail(payload.email)) {
          errors.push(validateEmail(payload.email));
        }
        if (!payload.mobile) {
          errors.push('Mobile number is required.');
        } else if (validatePhone(payload.mobile)) {
          errors.push(validatePhone(payload.mobile));
        }
        if (!payload.password) {
          errors.push('Password is required.');
        } else if (validatePassword(payload.password)) {
          errors.push(validatePassword(payload.password));
        }
        if (payload.confirmPassword !== payload.password) errors.push('Passwords do not match.');
        if (users.some((user) => user.email.toLowerCase() === String(payload.email).toLowerCase())) errors.push('Email already exists.');

        if (errors.length) {
          showToast(errors[0], 'danger');
          return;
        }

        users.push({
          id: generateId('USR'),
          fullName: payload.fullName,
          email: payload.email,
          mobile: payload.mobile,
          password: payload.password,
          createdAt: new Date().toISOString()
        });
        saveJSON(STORAGE_KEYS.users, users);
        showToast('Registration successful. Please log in.', 'success');
        setTimeout(() => window.location.href = 'login.html', 800);
      } else {
        const user = users.find((entry) => entry.email.toLowerCase() === String(payload.email).toLowerCase() && entry.password === payload.password);
        if (!user) {
          showToast('Invalid credentials.', 'danger');
          return;
        }
        setCurrentUser(user);
        showToast('Login successful. Redirecting...', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 800);
      }
    });
  }

  const togglePassword = document.getElementById('togglePassword');
  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const input = document.getElementById('password');
      const icon = togglePassword.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
      } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
      }
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearCurrentUser();
      window.location.href = 'login.html';
    });
  }

  if (authTitle) {
    authTitle.textContent = currentPage === 'register.html' ? 'Create account' : 'Welcome back';
  }
  if (authSubtitle) {
    authSubtitle.textContent = currentPage === 'register.html' ? 'Register a new admin account to access the hospital dashboard.' : 'Sign in to manage patients, doctors, appointments, and reports.';
  }
});
