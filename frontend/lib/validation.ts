/**
 * Email validation
 * Checks if the email format is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation
 * Password must be at least 6 characters long
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
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
 * Get password error message
 */
export const getPasswordError = (password: string): string | null => {
  if (!password) return '비밀번호를 입력해주세요';
  if (!validatePassword(password)) return '비밀번호는 최소 6자 이상이어야 합니다';
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
