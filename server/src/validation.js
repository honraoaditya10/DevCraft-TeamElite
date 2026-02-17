export const validateSignup = ({ fullName, email, password, role }) => {
  const errors = {};

  if (!fullName || !fullName.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email is invalid';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (role && !['student', 'normalUser'].includes(role)) {
    errors.role = 'Role is invalid';
  }

  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email is invalid';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
};
