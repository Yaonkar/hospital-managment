document.addEventListener('DOMContentLoaded', () => {
  if (!getCurrentUser()) {
    window.location.href = 'login.html';
    return;
  }
  attachCommonUI();
  renderPatients();
});

function getFilteredPatients() {
  const patients = readJSON(STORAGE_KEYS.patients, []);
  const search = document.getElementById('patientSearch')?.value.toLowerCase() || '';
  const status = document.getElementById('patientStatusFilter')?.value || '';
  const sort = document.getElementById('patientSort')?.value || 'name';
  return patients
    .filter((patient) => (!search || `${patient.fullName} ${patient.disease} ${patient.patientId}`.toLowerCase().includes(search)) && (!status || patient.status === status))
    .sort((a, b) => (sort === 'date' ? new Date(b.dateOfAdmission || 0) - new Date(a.dateOfAdmission || 0) : a.fullName.localeCompare(b.fullName)));
}

function renderPatients() {
  const patients = getFilteredPatients();
  const tbody = document.getElementById('patientsTableBody');
  const emptyState = document.getElementById('patientsEmpty');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!patients.length) {
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');
  patients.forEach((patient) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${escapeHtml(patient.patientId)}</td><td>${escapeHtml(patient.fullName)}</td><td>${escapeHtml(patient.age)}</td><td>${escapeHtml(patient.gender)}</td><td>${escapeHtml(patient.disease)}</td><td><span class="chip">${escapeHtml(patient.status)}</span></td><td>${formatDate(patient.dateOfAdmission)}</td><td><button class="btn btn-sm btn-outline-primary me-2" onclick="editPatient('${patient.patientId}')"><i class="fa-solid fa-pen"></i></button><button class="btn btn-sm btn-outline-danger" onclick="deletePatient('${patient.patientId}')"><i class="fa-solid fa-trash"></i></button></td>`;
    tbody.appendChild(row);
  });
}

function savePatient(event) {
  event.preventDefault();
  const form = event.target;
  const payload = Object.fromEntries(new FormData(form).entries());
  const patients = readJSON(STORAGE_KEYS.patients, []);
  if (!payload.fullName || !payload.age || !payload.gender || !payload.disease) {
    showToast('Please fill the required patient fields.', 'danger');
    return;
  }
  if (payload.patientId) {
    const index = patients.findIndex((patient) => patient.patientId === payload.patientId);
    if (index >= 0) patients[index] = { ...patients[index], ...payload };
  } else {
    patients.push({ patientId: generateId('PAT'), ...payload, dateOfAdmission: payload.dateOfAdmission || new Date().toISOString().slice(0, 10) });
  }
  saveJSON(STORAGE_KEYS.patients, patients);
  showToast('Patient saved successfully.', 'success');
  form.reset();
  document.getElementById('patientModal').querySelector('.btn-close').click();
  renderPatients();
}

function editPatient(id) {
  const patients = readJSON(STORAGE_KEYS.patients, []);
  const patient = patients.find((item) => item.patientId === id);
  if (!patient) return;
  const modalBody = document.getElementById('patientModalBody');
  modalBody.innerHTML = `
    <form id="patientForm" onsubmit="savePatient(event)">
      <input type="hidden" name="patientId" value="${patient.patientId}">
      <div class="row g-3">
        <div class="col-md-6"><label class="form-label">Full Name</label><input class="form-control" name="fullName" value="${patient.fullName}" required></div>
        <div class="col-md-6"><label class="form-label">Age</label><input class="form-control" name="age" value="${patient.age}" required></div>
        <div class="col-md-6"><label class="form-label">Gender</label><select class="form-select" name="gender"><option ${patient.gender === 'Male' ? 'selected' : ''}>Male</option><option ${patient.gender === 'Female' ? 'selected' : ''}>Female</option><option ${patient.gender === 'Other' ? 'selected' : ''}>Other</option></select></div>
        <div class="col-md-6"><label class="form-label">Blood Group</label><input class="form-control" name="bloodGroup" value="${patient.bloodGroup || ''}"></div>
        <div class="col-md-6"><label class="form-label">Mobile</label><input class="form-control" name="mobile" value="${patient.mobile || ''}"></div>
        <div class="col-md-6"><label class="form-label">Email</label><input class="form-control" name="email" value="${patient.email || ''}"></div>
        <div class="col-md-6"><label class="form-label">Doctor Assigned</label><input class="form-control" name="doctorAssigned" value="${patient.doctorAssigned || ''}"></div>
        <div class="col-md-6"><label class="form-label">Date of Admission</label><input class="form-control" type="date" name="dateOfAdmission" value="${patient.dateOfAdmission || ''}"></div>
        <div class="col-md-6"><label class="form-label">Disease</label><input class="form-control" name="disease" value="${patient.disease}" required></div>
        <div class="col-md-6"><label class="form-label">Status</label><select class="form-select" name="status"><option ${patient.status === 'Admitted' ? 'selected' : ''}>Admitted</option><option ${patient.status === 'Discharged' ? 'selected' : ''}>Discharged</option><option ${patient.status === 'Critical' ? 'selected' : ''}>Critical</option></select></div>
        <div class="col-12"><label class="form-label">Address</label><textarea class="form-control" name="address">${patient.address || ''}</textarea></div>
      </div>
      <div class="mt-3 text-end"><button class="btn btn-primary" type="submit">Save Changes</button></div>
    </form>`;
  const modal = new bootstrap.Modal(document.getElementById('patientModal'));
  modal.show();
}

function deletePatient(id) {
  if (!confirm('Delete this patient?')) return;
  const patients = readJSON(STORAGE_KEYS.patients, []);
  saveJSON(STORAGE_KEYS.patients, patients.filter((patient) => patient.patientId !== id));
  renderPatients();
  showToast('Patient deleted.', 'success');
}

function attachCommonUI() {
  const addButton = document.getElementById('addPatientBtn');
  if (addButton) {
    addButton.addEventListener('click', () => {
      const modalBody = document.getElementById('patientModalBody');
      modalBody.innerHTML = `
        <form id="patientForm" onsubmit="savePatient(event)">
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label">Full Name</label><input class="form-control" name="fullName" required></div>
            <div class="col-md-6"><label class="form-label">Age</label><input class="form-control" name="age" required></div>
            <div class="col-md-6"><label class="form-label">Gender</label><select class="form-select" name="gender"><option>Male</option><option>Female</option><option>Other</option></select></div>
            <div class="col-md-6"><label class="form-label">Blood Group</label><input class="form-control" name="bloodGroup"></div>
            <div class="col-md-6"><label class="form-label">Mobile</label><input class="form-control" name="mobile"></div>
            <div class="col-md-6"><label class="form-label">Email</label><input class="form-control" name="email"></div>
            <div class="col-md-6"><label class="form-label">Doctor Assigned</label><input class="form-control" name="doctorAssigned"></div>
            <div class="col-md-6"><label class="form-label">Date of Admission</label><input class="form-control" type="date" name="dateOfAdmission"></div>
            <div class="col-md-6"><label class="form-label">Disease</label><input class="form-control" name="disease" required></div>
            <div class="col-md-6"><label class="form-label">Status</label><select class="form-select" name="status"><option>Admitted</option><option>Discharged</option><option>Critical</option></select></div>
            <div class="col-12"><label class="form-label">Address</label><textarea class="form-control" name="address"></textarea></div>
          </div>
          <div class="mt-3 text-end"><button class="btn btn-primary" type="submit">Save Patient</button></div>
        </form>`;
      const modal = new bootstrap.Modal(document.getElementById('patientModal'));
      modal.show();
    });
  }

  ['patientSearch', 'patientStatusFilter', 'patientSort'].forEach((id) => {
    const element = document.getElementById(id);
    element?.addEventListener('input', renderPatients);
    element?.addEventListener('change', renderPatients);
  });

  document.getElementById('exportPatientsBtn')?.addEventListener('click', () => {
    const patients = getFilteredPatients();
    const rows = [['ID', 'Name', 'Age', 'Gender', 'Disease', 'Status', 'Admission']].concat(patients.map((patient) => [patient.patientId, patient.fullName, patient.age, patient.gender, patient.disease, patient.status, patient.dateOfAdmission]));
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'patients.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  });

  document.getElementById('printPatientsBtn')?.addEventListener('click', () => window.print());
}
