document.addEventListener('DOMContentLoaded', () => {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }

  const settings = getSettings();
  applyTheme(settings.theme || 'light');
  renderDashboard();
  attachCommonUI();
});

function renderDashboard() {
  const patients = readJSON(STORAGE_KEYS.patients, []);
  const doctors = readJSON(STORAGE_KEYS.doctors, []);
  const appointments = readJSON(STORAGE_KEYS.appointments, []);
  const today = new Date().toISOString().slice(0, 10);

  document.getElementById('patientCount').textContent = patients.length;
  document.getElementById('doctorCount').textContent = doctors.length;
  document.getElementById('appointmentCount').textContent = appointments.length;
  document.getElementById('todayAppointments').textContent = appointments.filter((item) => item.appointmentDate === today).length;
  document.getElementById('availableDoctors').textContent = doctors.filter((doctor) => doctor.status === 'Available').length;
  document.getElementById('departmentCount').textContent = new Set(doctors.map((doctor) => doctor.department)).size;

  const activityList = document.getElementById('activityList');
  if (activityList) {
    activityList.innerHTML = '';
    const recent = [...patients].slice(-4).reverse();
    recent.forEach((patient) => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      item.innerHTML = `<span>${patient.fullName} admitted for ${patient.disease}</span><small>${formatDate(patient.dateOfAdmission)}</small>`;
      activityList.appendChild(item);
    });
  }

  renderCharts(patients, doctors, appointments);
}

function attachCommonUI() {
  const searchInput = document.getElementById('globalSearch');
  const results = document.getElementById('searchResults');
  if (searchInput && results) {
    searchInput.addEventListener('input', () => {
      const keyword = searchInput.value.trim().toLowerCase();
      if (!keyword) {
        results.classList.remove('show');
        results.innerHTML = '';
        return;
      }
      const patients = readJSON(STORAGE_KEYS.patients, []);
      const doctors = readJSON(STORAGE_KEYS.doctors, []);
      const appointments = readJSON(STORAGE_KEYS.appointments, []);
      const combined = [
        ...patients.map((item) => ({ type: 'Patient', label: item.fullName, value: item })),
        ...doctors.map((item) => ({ type: 'Doctor', label: item.name, value: item })),
        ...appointments.map((item) => ({ type: 'Appointment', label: `${item.patient} • ${item.doctor}`, value: item }))
      ].filter((item) => item.label.toLowerCase().includes(keyword));
      results.innerHTML = combined.slice(0, 8).map((item) => `<div class="result-item"><strong>${escapeHtml(item.type)}</strong><div>${escapeHtml(item.label)}</div></div>`).join('');
      results.classList.toggle('show', combined.length > 0);
    });
  }

  document.addEventListener('click', () => {
    results?.classList.remove('show');
  });
}
