/** Basit doğrulama iskelesi — ileride Zod / Sunucu ile değiştirilebilir. */

export type LoginFormValues = {
  email: string
  password: string
}

export type RegisterFormValues = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export type ForgotPasswordFormValues = {
  email: string
}

export type FieldErrors<T extends Record<string, string>> = Partial<
  Record<keyof T, string>
>

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLogin(values: LoginFormValues): FieldErrors<LoginFormValues> {
  const errors: FieldErrors<LoginFormValues> = {}
  if (!values.email.trim()) errors.email = 'E-posta adresi gerekli.'
  else if (!emailRx.test(values.email.trim()))
    errors.email = 'Geçerli bir e-posta girin.'
  if (!values.password) errors.password = 'Şifre gerekli.'
  return errors
}

export function validateRegister(
  values: RegisterFormValues,
): FieldErrors<RegisterFormValues> {
  const errors: FieldErrors<RegisterFormValues> = {}
  if (!values.fullName.trim()) errors.fullName = 'Ad soyad gerekli.'
  if (!values.email.trim()) errors.email = 'E-posta adresi gerekli.'
  else if (!emailRx.test(values.email.trim()))
    errors.email = 'Geçerli bir e-posta girin.'
  if (!values.password) errors.password = 'Şifre gerekli.'
  else if (values.password.length < 8)
    errors.password = 'Şifre en az 8 karakter olmalı.'
  if (!values.confirmPassword)
    errors.confirmPassword = 'Şifre tekrarı gerekli.'
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = 'Şifreler eşleşmiyor.'
  return errors
}

export function validateForgotPassword(
  values: ForgotPasswordFormValues,
): FieldErrors<ForgotPasswordFormValues> {
  const errors: FieldErrors<ForgotPasswordFormValues> = {}
  if (!values.email.trim()) errors.email = 'E-posta adresi gerekli.'
  else if (!emailRx.test(values.email.trim()))
    errors.email = 'Geçerli bir e-posta girin.'
  return errors
}
