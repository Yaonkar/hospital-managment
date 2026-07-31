document.addEventListener('DOMContentLoaded', () => {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }
  renderAppointments();
  attachAppointmentUI();
});

function getFilteredAppointments() {
  const appointments = readJSON(STORAGE_KEYS.appointments, []);
  const search = document.getElementById('appointmentSearch')?.value.toLowerCase() || '';
  const status = document.getElementById('appointmentStatusFilter')?.value || '';
  const date = document.getElementById('appointmentDateFilter')?.value || '';
  const sort = document.getElementById('appointmentSort')?.value || 'date';
  return appointments
    .filter((appointment) => (!search || `${appointment.patient} ${appointment.doctor} ${appointment.department}`.toLowerCase().includes(search)) && (!status || appointment.status === status) && (!date || appointment.appointmentDate === date))
    .sort((a, b) => (sort === 'doctor' ? a.doctor.localeCompare(b.doctor) : new Date(a.appointmentDate + 'T' + a.appointmentTime) - new Date(b.appointmentDate + 'T' + b.appointmentTime)));
}

function renderAppointments() {
  const appointments = getFilteredAppointments();
  const tbody = document.getElementById('appointmentsTableBody');
  const emptyState = document.getElementById('appointmentsEmpty');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!appointments.length) {
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');
  appointments.forEach((appointment) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${escapeHtml(appointment.appointmentId)}</td><td>${escapeHtml(appointment.patient)}</td><td>${escapeHtml(appointment.doctor)}</td><td>${escapeHtml(appointment.department)}</td><td>${escapeHtml(appointment.appointmentDate)}</td><td>${escapeHtml(appointment.appointmentTime)}</td><td><span class="chip">${escapeHtml(appointment.status)}</span></td><td><button class="btn btn-sm btn-outline-primary me-2" onclick="editAppointment('${appointment.appointmentId}')"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteAppointment('${appointment.appointmentId}')"><i class="fa-solid fa-trash"></i></button></td>`;
    tbody.appendChild(row);
  });
}

function saveAppointment(event) {
  event.preventDefault();
  const form = event.target;
  const payload = Object.fromEntries(new FormData(form).entries());
  const appointments = readJSON(STORAGE_KEYS.appointments, []);
  const date = new Date(payload.appointmentDate);
  if (date < new Date(new Date().toDateString())) {
    showToast('Appointment date cannot be in the past.', 'danger');
    return;
  }
  const exists = appointments.some((item) => item.doctor === payload.doctor && item.appointmentDate === payload.appointmentDate && item.appointmentTime === payload.appointmentTime && item.appointmentId !== payload.appointmentId);
  if (exists) {
    showToast('This doctor already has an appointment at that time.', 'danger');
    return;
  }
  if (payload.appointmentId) {
    const index = appointments.findIndex((item) => item.appointmentId === payload.appointmentId);
    if (index >= 0) appointments[index] = { ...appointments[index], ...payload };
  } else {
    appointments.push({ appointmentId: generateId('APT'), ...payload });
  }
  saveJSON(STORAGE_KEYS.appointments, appointments);
  showToast('Appointment saved successfully.', 'success');
  form.reset();
  document.getElementById('appointmentModal').querySelector('.btn-close').click();
  renderAppointments();
}

function editAppointment(id) {
  const appointments = readJSON(STORAGE_KEYS.appointments, []);
  const appointment = appointments.find((item) => item.appointmentId === id);
  if (!appointment) return;
  const modalBody = document.getElementById('appointmentModalBody');
  modalBody.innerHTML = `
    <form id="appointmentForm" onsubmit="saveAppointment(event)">
      <input type="hidden" name="appointmentId" value="${appointment.appointmentId}">
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label">Patient</label><input class="form-control" name="patient" value="${appointment.patient}" required></div>
        <div class="col-md-6"><label class="form-label">Doctor</label><input class="form-control" name="doctor" value="${appointment.doctor}" required></div>
        <div class="col-md-6"><label class="form-label">Department</label><input class="form-control" name="department" value="${appointment.department}" required></div>
        <div class="col-md-6"><label class="form-label">Date</label><input class="form-control" type="date" name="appointmentDate" value="${appointment.appointmentDate}" required></div>
        <div class="col-md-6"><label class="form-label">Time</label><input class="form-control" type="time" name="appointmentTime" value="${appointment.appointmentTime}" required></div>
        <div class="col-md-6"><label class="form-label">Status</label><select class="form-select" name="status"><option ${appointment.status === 'Pending' ? 'selected' : ''}>Pending</option><option ${appointment.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option><option ${appointment.status === 'Completed' ? 'selected' : ''}>Completed</option><option ${appointment.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option></select></div>
        <div class="col-12"><label class="form-label">Symptoms</label><textarea class="form-control" name="symptoms">${appointment.symptoms || ''}</textarea></div>
      </div>
      <div class="mt-3 text-end"><button class="btn btn-primary" type="submit">Save Changes</button></div>
    </form>`;
  const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
  modal.show();
}

function deleteAppointment(id) {
  if (!confirm('Delete this appointment?')) return;
  const appointments = readJSON(STORAGE_KEYS.appointments, []);
  saveJSON(STORAGE_KEYS.appointments, appointments.filter((appointment) => appointment.appointmentId !== id));
  renderAppointments();
  showToast('Appointment deleted.', 'success');
}

function attachAppointmentUI() {
  const addButton = document.getElementById('addAppointmentBtn');
  if (addButton) {
    addButton.addEventListener('click', () => {
      const modalBody = document.getElementById('appointmentModalBody');
      modalBody.innerHTML = `
        <form id="appointmentForm" onsubmit="saveAppointment(event)">
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Patient</label><input class="form-control" name="patient" required></div>
            <div class="col-md-6"><label class="form-label">Doctor</label><input class="form-control" name="doctor" required></div>
            <div class="col-md-6"><label class="form-label">Department</label><input class="form-control" name="department" required></div>
            <div class="col-md-6"><label class="form-label">Date</label><input class="form-control" type="date" name="appointmentDate" required></div>
            <div class="col-md-6"><label class="form-label">Time</label><input class="form-control" type="time" name="appointmentTime" required></div>
            <div class="col-md-6"><label class="form-label">Status</label><select class="form-select" name="status"><option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option></select></div>
            <div class="col-12"><label class="form-label">Symptoms</label><textarea class="form-control" name="symptoms"></textarea></div>
          </div>
          <div class="mt-3 text-end"><button class="btn btn-primary" type="submit">Save Appointment</button></div>
        </form>`;
      const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
      modal.show();
    });
  }

  ['appointmentSearch', 'appointmentStatusFilter', 'appointmentDateFilter', 'appointmentSort'].forEach((id) => {
    const element = document.getElementById(id);
    element?.addEventListener('input', renderAppointments);
    element?.addEventListener('change', renderAppointments);
  });

  document.getElementById('printAppointmentsBtn')?.addEventListener('click', () => window.print());
}
