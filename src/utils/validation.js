export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

/**
 * Validates Russian/International phone formats.
 * Matches: +7 (999) 123-45-67, 89991234567, 79991234567, etc.
 * Ensures 10-11 digits.
 */
export const PHONE_REGEX = /^(\+7|7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;

export const validateEmail = (email) => {
  if (!email) return 'Email обязателен';
  if (!EMAIL_REGEX.test(email)) return 'Неверный формат email';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Телефон обязателен';
  // Strip non-digits to check length
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) {
    return 'Номер телефона должен содержать 10 или 11 цифр';
  }
  if (!PHONE_REGEX.test(phone)) {
    return 'Неверный формат номера телефона';
  }
  return null;
};

export const validateRequired = (value, fieldName = 'Поле') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} обязательно для заполнения`;
  }
  return null;
};

export const validateMinLength = (value, min, fieldName = 'Поле') => {
  if (!value || value.length < min) {
    return `${fieldName} должно быть не менее ${min} символов`;
  }
  return null;
};
