// Server-side input validation utilities

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(body) {
  const errors = [];
  if (!body.email || !EMAIL_REGEX.test(body.email.trim())) {
    errors.push('A valid email address is required.');
  }
  if (!body.password || body.password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateLogin(body) {
  const errors = [];
  if (!body.email || !body.email.trim()) {
    errors.push('Email is required.');
  }
  if (!body.password) {
    errors.push('Password is required.');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateProfile(body) {
  const errors = [];
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('Profile name is required.');
  } else if (body.name.trim().length > 30) {
    errors.push('Profile name cannot exceed 30 characters.');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateWatchProgress(body) {
  const errors = [];
  if (!body.titleId) {
    errors.push('Title ID is required.');
  }
  const progress = Number(body.progressSeconds);
  const duration = Number(body.durationSeconds);
  if (isNaN(progress) || progress < 0) {
    errors.push('progressSeconds must be a non-negative number.');
  }
  if (isNaN(duration) || duration <= 0) {
    errors.push('durationSeconds must be a positive number.');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateRegister,
  validateLogin,
  validateProfile,
  validateWatchProgress,
};
