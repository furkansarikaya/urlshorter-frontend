// lib/validation.ts

// E-posta doğrulama için regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Şifre doğrulama için regex (en az 6 karakter)
export const PASSWORD_REGEX = /^.{6,}$/;

// Validasyon fonksiyonları
export const validateEmail = (email: string): string => {
  if (!email) return "E-posta alanı zorunludur";
  if (!EMAIL_REGEX.test(email)) return "Geçerli bir e-posta adresi giriniz";
  return "";
};

export const validatePassword = (password: string): string => {
  if (!password) return "Şifre alanı zorunludur";
  if (!PASSWORD_REGEX.test(password)) return "Şifre en az 6 karakter olmalıdır";
  return "";
}; 