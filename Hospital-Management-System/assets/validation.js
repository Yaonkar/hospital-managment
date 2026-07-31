function validateRequired(value, fieldName) {
  if (!String(value).trim()) return `${fieldName} is required.`;
  return '';
}

function validateEmail(value) {
  const email = String(value).trim();
  if (!email) return 'Please enter an email address.';
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return regex.test(email) ? '' : 'Please enter a valid email address.';
}

function validatePhone(value) {
  const regex = /^\+?[0-9]{7,15}$/;
  return regex.test(String(value).replace(/\s/g, '')) ? '' : 'Please enter a valid mobile number.';
}

function validatePassword(value) {
  if (String(value).length < 6) return 'Password must be at least 6 characters.';
  return '';
}

function validateDate(value) {
  if (!value) return 'Date is required.';
  const chosen = new Date(value);
  const now = new Date();
  if (Number.isNaN(chosen.getTime())) return 'Please enter a valid date.';
  if (chosen < new Date(now.toDateString())) return 'Date cannot be in the past.';
  return '';
}

function getFieldError(field, value) {
  const name = field.label || field.name || field.id || 'Field';
  let error = validateRequired(value, name);
  if (error) return error;
  if (field.type === 'email') error = validateEmail(value);
  if (field.type === 'phone' || field.name === 'mobile' || field.name === 'mobileNumber') error = validatePhone(value);
  if (field.name === 'password') error = validatePassword(value);
  if (field.name === 'confirmPassword') error = '';
  return error;
}
