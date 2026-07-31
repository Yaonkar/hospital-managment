document.addEventListener('DOMContentLoaded', () => {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }
  renderDoctors();
  attachDoctorUI();
});

function getFilteredDoctors() {
  const doctors = readJSON(STORAGE_KEYS.doctors, []);
  const search = document.getElementById('doctorSearch')?.value.toLowerCase() || '';
  const department = document.getElementById('doctorDepartmentFilter')?.value || '';
  const sort = document.getElementById('doctorSort')?.value || 'name';
  return doctors
    .filter((doctor) => (!search || `${doctor.name} ${doctor.specialization} ${doctor.department}`.toLowerCase().includes(search)) && (!department || doctor.department === department))
    .sort((a, b) => (sort === 'department' ? a.department.localeCompare(b.department) : a.name.localeCompare(b.name)));
}

function renderDoctors() {
  const doctors = getFilteredDoctors();
  const tbody = document.getElementById('doctorsTableBody');
  const emptyState = document.getElementById('doctorsEmpty');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!doctors.length) {
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');
  doctors.forEach((doctor) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${escapeHtml(doctor.doctorId || doctor.id || '')}</td><td>${escapeHtml(doctor.name)}</td><td>${escapeHtml(doctor.specialization)}</td><td>${escapeHtml(doctor.department)}</td><td>${escapeHtml(doctor.mobile)}</td><td><span class="chip">${escapeHtml(doctor.status)}</span></td><td><button class="btn btn-sm btn-outline-primary me-2" onclick="editDoctor('${doctor.doctorId || doctor.id}')"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deleteDoctor('${doctor.doctorId || doctor.id}')"><i class="fa-solid fa-trash"></i></button></td>`;
    tbody.appendChild(row);
  });
}

function saveDoctor(event) {
  event.preventDefault();
  const form = event.target;
  const payload = Object.fromEntries(new FormData(form).entries());
  const doctors = readJSON(STORAGE_KEYS.doctors, []);
  if (!payload.name || !payload.specialization || !payload.department) {
    showToast('Please fill the required doctor fields.', 'danger');
    return;
  }
  if (payload.doctorId) {
    const index = doctors.findIndex((doctor) => doctor.doctorId === payload.doctorId);
    if (index >= 0) doctors[index] = { ...doctors[index], ...payload };
  } else {
    doctors.push({ doctorId: generateId('DOC'), ...payload });
  }
  saveJSON(STORAGE_KEYS.doctors, doctors);
  showToast('Doctor saved successfully.', 'success');
  form.reset();
  document.getElementById('doctorModal').querySelector('.btn-close').click();
  renderDoctors();
}

function editDoctor(id) {
  const doctors = readJSON(STORAGE_KEYS.doctors, []);
  const doctor = doctors.find((item) => (item.doctorId || item.id) === id);
  if (!doctor) return;
  const modalBody = document.getElementById('doctorModalBody');
  modalBody.innerHTML = `
    <form id="doctorForm" onsubmit="saveDoctor(event)">
      <input type="hidden" name="doctorId" value="${doctor.doctorId || doctor.id}">
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label">Name</label><input class="form-control" name="name" value="${doctor.name}" required></div>
        <div class="col-md-6"><label class="form-label">Specialization</label><input class="form-control" name="specialization" value="${doctor.specialization}" required></div>
        <div class="col-md-6"><label class="form-label">Qualification</label><input class="form-control" name="qualification" value="${doctor.qualification || ''}"></div>
        <div class="col-md-6"><label class="form-label">Experience</label><input class="form-control" name="experience" value="${doctor.experience || ''}"></div>
        <div class="col-md-6"><label class="form-label">Mobile</label><input class="form-control" name="mobile" value="${doctor.mobile || ''}"></div>
        <div class="col-md-6"><label class="form-label">Email</label><input class="form-control" name="email" value="${doctor.email || ''}"></div>
        <div class="col-md-6"><label class="form-label">Department</label><input class="form-control" name="department" value="${doctor.department || ''}"></div>
        <div class="col-md-6"><label class="form-label">Available Days</label><input class="form-control" name="availableDays" value="${doctor.availableDays || ''}"></div>
        <div class="col-md-6"><label class="form-label">Consultation Fee</label><input class="form-control" name="consultationFee" value="${doctor.consultationFee || ''}"></div>
        <div class="col-md-6"><label class="form-label">Status</label><select class="form-select" name="status"><option ${doctor.status === 'Available' ? 'selected' : ''}>Available</option><option ${doctor.status === 'On Leave' ? 'selected' : ''}>On Leave</option><option ${doctor.status === 'Busy' ? 'selected' : ''}>Busy</option></select></div>
      </div>
      <div class="mt-3 text-end"><button class="btn btn-primary" type="submit">Save Changes</button></div>
    </form>`;
  const modal = new bootstrap.Modal(document.getElementById('doctorModal'));
  modal.show();
}

function deleteDoctor(id) {
  if (!confirm('Delete this doctor?')) return;
  const doctors = readJSON(STORAGE_KEYS.doctors, []);
  saveJSON(STORAGE_KEYS.doctors, doctors.filter((doctor) => (doctor.doctorId || doctor.id) !== id));
  renderDoctors();
  showToast('Doctor deleted.', 'success');
}

function attachDoctorUI() {
  const addButton = document.getElementById('addDoctorBtn');
  if (addButton) {
    addButton.addEventListener('click', () => {
      const modalBody = document.getElementById('doctorModalBody');
      modalBody.innerHTML = `
        <form id="doctorForm" onsubmit="saveDoctor(event)">
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Name</label><input class="form-control" name="name" required></div>
            <div class="col-md-6"><label class="form-label">Specialization</label><input class="form-control" name="specialization" required></div>
            <div class="col-md-6"><label class="form-label">Qualification</label><input class="form-control" name="qualification"></div>
            <div class="col-md-6"><label class="form-label">Experience</label><input class="form-control" name="experience"></div>
            <div class="col-md-6"><label class="form-label">Mobile</label><input class="form-control" name="mobile"></div>
            <div class="col-md-6"><label class="form-label">Email</label><input class="form-control" name="email"></div>
            <div class="col-md-6"><label class="form-label">Department</label><input class="form-control" name="department"></div>
            <div class="col-md-6"><label class="form-label">Available Days</label><input class="form-control" name="availableDays"></div>
            <div class="col-md-6"><label class="form-label">Consultation Fee</label><input class="form-control" name="consultationFee"></div>
            <div class="col-md-6"><label class="form-label">Status</label><select class="form-select" name="status"><option>Available</option><option>On Leave</option><option>Busy</option></select></div>
          </div>
          <div class="mt-3 text-end"><button class="btn btn-primary" type="submit">Save Doctor</button></div>
        </form>`;
      const modal = new bootstrap.Modal(document.getElementById('doctorModal'));
      modal.show();
    });
  }

  ['doctorSearch', 'doctorDepartmentFilter', 'doctorSort'].forEach((id) => {
    const element = document.getElementById(id);
    element?.addEventListener('input', renderDoctors);
    element?.addEventListener('change', renderDoctors);
  });

  const departments = [...new Set(readJSON(STORAGE_KEYS.doctors, []).map((doctor) => doctor.department).filter(Boolean))];
  const departmentFilter = document.getElementById('doctorDepartmentFilter');
  if (departmentFilter) {
    departments.forEach((department) => {
      const option = document.createElement('option');
      option.value = department;
      option.textContent = department;
      departmentFilter.appendChild(option);
    });
  }
}
