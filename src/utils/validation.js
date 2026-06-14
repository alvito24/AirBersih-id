function isRequiredString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRegisterInput(payload) {
  const details = [];
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : null;
  const address = typeof payload.address === 'string' ? payload.address.trim() : null;

  if (!isRequiredString(name) || name.length < 2) {
    details.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  if (!isRequiredString(email) || !isValidEmail(email)) {
    details.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!password || password.length < 8) {
    details.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  if (phone && phone.length > 30) {
    details.push({ field: 'phone', message: 'Phone must be at most 30 characters' });
  }

  return {
    isValid: details.length === 0,
    details,
    value: { name, email, password, phone, address },
  };
}

function validateLoginInput(payload) {
  const details = [];
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';

  if (!isRequiredString(email) || !isValidEmail(email)) {
    details.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!password) {
    details.push({ field: 'password', message: 'Password is required' });
  }

  return {
    isValid: details.length === 0,
    details,
    value: { email, password },
  };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
