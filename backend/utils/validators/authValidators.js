/**
 * Authentication Validators
 */

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s()+-]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const isValidRole = (role) => {
  const validRoles = ['user', 'admin', 'moderator'];
  return validRoles.includes(role);
};

const validateLoginData = (email, password) => {
  const errors = [];

  if (!email) errors.push('Email is required');
  if (!isValidEmail(email)) errors.push('Invalid email format');

  if (!password) errors.push('Password is required');
  if (password && password.length < 6) errors.push('Password must be at least 6 characters');

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateRegistrationData = (email, password, name) => {
  const errors = [];

  if (!email) errors.push('Email is required');
  if (!isValidEmail(email)) errors.push('Invalid email format');

  if (!password) errors.push('Password is required');
  if (password && password.length < 6) errors.push('Password must be at least 6 characters');

  if (!name) errors.push('Name is required');
  if (!isValidName(name)) errors.push('Name must be between 2 and 50 characters');

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidRole,
  validateLoginData,
  validateRegistrationData,
};
