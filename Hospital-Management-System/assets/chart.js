function renderCharts(patients, doctors, appointments) {
  const ctxPatients = document.getElementById('patientsChart');
  const ctxAppointments = document.getElementById('appointmentsChart');
  const ctxDepartments = document.getElementById('departmentsChart');

  if (ctxPatients) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = Array(12).fill(0);
    patients.forEach((patient) => {
      const month = new Date(patient.dateOfAdmission).getMonth();
      counts[month] += 1;
    });
    new Chart(ctxPatients, { type: 'line', data: { labels: months, datasets: [{ label: 'Patients', data: counts, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.18)', tension: 0.35 }] }, options: { responsive: true, maintainAspectRatio: false } });
  }

  if (ctxAppointments) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = Array(12).fill(0);
    appointments.forEach((appointment) => {
      const month = new Date(appointment.appointmentDate).getMonth();
      counts[month] += 1;
    });
    new Chart(ctxAppointments, { type: 'bar', data: { labels: months, datasets: [{ label: 'Appointments', data: counts, backgroundColor: '#10b981' }] }, options: { responsive: true, maintainAspectRatio: false } });
  }

  if (ctxDepartments) {
    const labels = [...new Set(doctors.map((doctor) => doctor.department))];
    const counts = labels.map((dept) => doctors.filter((doctor) => doctor.department === dept).length);
    new Chart(ctxDepartments, { type: 'doughnut', data: { labels, datasets: [{ data: counts, backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }] }, options: { responsive: true, maintainAspectRatio: false } });
  }
}
