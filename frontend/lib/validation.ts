/**
 * Email validation
 * Checks if the email format is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Common weak passwords to block
 */
const WEAK_PASSWORDS = [
  '111111', '123456', '123456789', '12345678', '1234567890',
  'password', 'password123', 'qwerty', 'abc123', '000000',
  '654321', '123123', '888888', '666666', '555555',
  'admin', 'admin123', 'root', 'test', 'guest',
  '1q2w3e4r', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
];

/**
 * Password validation
 * Password must be:
 * - At least 8 characters long
 * - Contain at least one letter (a-z, A-Z)
 * - Contain at least one number (0-9)
 * - Not be a common weak password
 */
export const validatePassword = (password: string): boolean => {
  // Minimum length check
  if (password.length < 8) {
    return false;
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return false;
  }

  // Must contain at least one number
  if (!/[0-9]/.test(password)) {
    return false;
  }

  // Block common weak passwords
  if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
    return false;
  }

  return true;
};

/**
 * Check if password is weak (for existing users warning)
 */
export const isWeakPassword = (password: string): boolean => {
  return !validatePassword(password);
};

/**
 * Password confirmation validation
 * Checks if password and confirmation match
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Name validation
 * Name must be at least 2 characters long
 */
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

/**
 * Get email error message
 */
export const getEmailError = (email: string): string | null => {
  if (!email) return '이메일을 입력해주세요';
  if (!validateEmail(email)) return '올바른 이메일 형식이 아닙니다';
  return null;
};

/**
 * Get detailed password error message
 */
export const getPasswordError = (password: string): string | null => {
  if (!password) return '비밀번호를 입력해주세요';

  if (password.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다';
  }

  if (!/[a-zA-Z]/.test(password)) {
    return '비밀번호에 영문자를 포함해야 합니다';
  }

  if (!/[0-9]/.test(password)) {
    return '비밀번호에 숫자를 포함해야 합니다';
  }

  if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
    return '너무 흔한 비밀번호입니다. 다른 비밀번호를 사용해주세요';
  }

  return null;
};

/**
 * Get password confirmation error message
 */
export const getPasswordConfirmError = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return '비밀번호 확인을 입력해주세요';
  if (!validatePasswordMatch(password, confirmPassword)) return '비밀번호가 일치하지 않습니다';
  return null;
};

/**
 * Get name error message
 */
export const getNameError = (name: string): string | null => {
  if (!name) return '이름을 입력해주세요';
  if (!validateName(name)) return '이름은 최소 2자 이상이어야 합니다';
  return null;
};
