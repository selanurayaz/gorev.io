import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AuthAlert } from '@/components/auth/AuthAlert'
import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/components/ui/PasswordField'
import { TextField } from '@/components/ui/TextField'
import { useAuth } from '@/hooks/useAuth'
import {
  type FieldErrors,
  type LoginFormValues,
  validateLogin,
} from '@/lib/auth-forms'

type LocationState = {
  from?: { pathname?: string; search?: string; hash?: string }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()

  const from = (location.state as LocationState | null)?.from
  const redirectTo = from
    ? `${from.pathname ?? '/dashboard'}${from.search ?? ''}${from.hash ?? ''}`
    : '/dashboard'

  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FieldErrors<LoginFormValues>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const next = validateLogin(values)
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    const { error } = await signIn(values.email, values.password)
    setLoading(false)

    if (error) {
      setFormError(error)
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <AuthCard
      title="Tekrar hoş geldin"
      description="Hesabına giriş yap ve görevlerini yönet."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {formError ? <AuthAlert message={formError} variant="error" /> : null}

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
          disabled={loading}
        />
        <PasswordField
          label="Şifre"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={(e) =>
            setValues((v) => ({ ...v, password: e.target.value }))
          }
          error={errors.password}
          required
          disabled={loading}
        />

        <div className="flex justify-end">
          <Link
            to="/sifremi-unuttum"
            className="text-sm font-medium text-gorev-yellow-400/95 underline-offset-4 transition hover:text-gorev-yellow-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gorev-yellow-400"
          >
            Şifremi unuttum
          </Link>
        </div>

        <Button
          type="submit"
          className="min-h-12 w-full justify-center text-base"
          loading={loading}
        >
          Giriş yap
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gorev-muted">
        Hesabın yok mu?{' '}
        <Link
          to="/kayit"
          className="font-semibold text-gorev-green-400 underline-offset-4 transition hover:text-gorev-green-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-green-400"
        >
          Ücretsiz kayıt ol
        </Link>
      </p>
    </AuthCard>
  )
}
