import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/components/ui/PasswordField'
import { TextField } from '@/components/ui/TextField'
import {
  type FieldErrors,
  type RegisterFormValues,
  validateRegister,
} from '@/lib/auth-forms'

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function RegisterPage() {
  const [values, setValues] = useState<RegisterFormValues>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FieldErrors<RegisterFormValues>>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next = validateRegister(values)
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    await delay(1100)
    setLoading(false)
  }

  return (
    <AuthCard
      title="görev.io’ya katıl"
      description="Dakikalar içinde hesap oluştur; görev ver veya hizmet sun."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Ad soyad"
          name="fullName"
          autoComplete="name"
          placeholder="Ayşe Yılmaz"
          value={values.fullName}
          onChange={(e) =>
            setValues((v) => ({ ...v, fullName: e.target.value }))
          }
          error={errors.fullName}
          required
        />
        <TextField
          label="E-posta"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="ornek@postaci.com"
          value={values.email}
          onChange={(e) =>
            setValues((v) => ({ ...v, email: e.target.value }))
          }
          error={errors.email}
          required
        />
        <PasswordField
          label="Şifre"
          name="password"
          autoComplete="new-password"
          placeholder="En az 8 karakter"
          hint="En az 8 karakter; harf ve rakam karışımı önerilir."
          value={values.password}
          onChange={(e) =>
            setValues((v) => ({ ...v, password: e.target.value }))
          }
          error={errors.password}
          required
        />
        <PasswordField
          label="Şifre tekrar"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Şifreni tekrar gir"
          value={values.confirmPassword}
          onChange={(e) =>
            setValues((v) => ({ ...v, confirmPassword: e.target.value }))
          }
          error={errors.confirmPassword}
          required
        />

        <p className="text-xs leading-relaxed text-gorev-muted">
          Kayıt olarak{' '}
          <a
            href="#"
            className="font-medium text-gorev-yellow-400/95 underline-offset-4 hover:underline"
          >
            Kullanım Şartları
          </a>{' '}
          ve{' '}
          <a
            href="#"
            className="font-medium text-gorev-yellow-400/95 underline-offset-4 hover:underline"
          >
            Gizlilik Bildirimi
          </a>
          ’ni kabul etmiş olursun.
        </p>

        <Button
          type="submit"
          className="min-h-12 w-full justify-center text-base"
          loading={loading}
        >
          Hesap oluştur
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gorev-muted">
        Zaten hesabın var mı?{' '}
        <Link
          to="/giris"
          className="font-semibold text-gorev-green-400 underline-offset-4 transition hover:text-gorev-green-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-green-400"
        >
          Giriş yap
        </Link>
      </p>
    </AuthCard>
  )
}
