// lib/schemas.ts
import { z } from "zod";
import { EMAIL_REGEX, PASSWORD_REGEX } from "./validation";

// Login formu şeması
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta alanı zorunludur")
    .email("Geçerli bir e-posta adresi giriniz")
    .regex(EMAIL_REGEX, "Geçerli bir e-posta adresi giriniz"),
  password: z
    .string()
    .min(1, "Şifre alanı zorunludur")
});

// Login formu tipleri
export type LoginFormValues = z.infer<typeof loginSchema>;

// Kayıt formu şeması
export const registerSchema = z.object({
  firstName: z.string().min(1, "Ad alanı zorunludur"),
  lastName: z.string().min(1, "Soyad alanı zorunludur"),
  email: z
    .string()
    .min(1, "E-posta alanı zorunludur")
    .email("Geçerli bir e-posta adresi giriniz")
    .regex(EMAIL_REGEX, "Geçerli bir e-posta adresi giriniz"),
  password: z
    .string()
    .min(1, "Şifre alanı zorunludur")
    .min(6, "Şifre en az 6 karakter olmalıdır")
    .regex(PASSWORD_REGEX, "Şifre en az 6 karakter olmalıdır")
});

// Kayıt formu tipleri 
export type RegisterFormValues = z.infer<typeof registerSchema>; 