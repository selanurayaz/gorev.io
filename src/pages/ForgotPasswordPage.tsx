import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthCard } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import {
  type FieldErrors,
  type ForgotPasswordFormValues,
  validateForgotPassword,
} from '@/lib/auth-forms'

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function ForgotPasswordPage() {
  const [values, setValues] = useState<ForgotPasswordFormValues>({
    email: '',
  })
  const [errors, setErrors] = useState<FieldErrors<ForgotPasswordFormValues>>(
    {},
  )
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next = validateForgotPassword(values)
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    await delay(900)
    setLoading(false)
    setSent(true)
  }

  return (
    <AuthCard
      title="Şifre sıfırlama"
      description={
        sent
          ? 'Talimatları e-posta adresine gönderdik (demo — gerçek posta yok).'
          : 'Hesabına bağlı e-postayı gir; sıfırlama bağlantısı gönderelim.'
      }
    >
      {sent ? (
        <div className="space-y-6">
          <div
            className="rounded-2xl border border-gorev-green-500/35 bg-gorev-green-500/10 px-4 py-3 text-sm leading-relaxed text-gorev-snow"
            role="status"
          >
            Bağlantı üretildi. Gelen kutunu ve spam klasörünü kontrol et.
            Bağlantının süresi sınırlıdır.
          </div>
          <Link
            to="/giris"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-gorev-navy-700 bg-gorev-navy-900/50 text-sm font-semibold text-gorev-snow transition hover:border-gorev-yellow-400/45 hover:bg-gorev-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-yellow-400"
          >
            Girişe dön
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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

          <Button
            type="submit"
            className="min-h-12 w-full justify-center text-base"
            loading={loading}
          >
            Sıfırlama bağlantısı gönder
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-gorev-muted">
        <Link
          to="/giris"
          className="font-semibold text-gorev-green-400 underline-offset-4 transition hover:text-gorev-green-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-green-400"
        >
          Girişe dön
        </Link>
        {' · '}
        <Link
          to="/kayit"
          className="font-semibold text-gorev-yellow-400/95 underline-offset-4 transition hover:text-gorev-yellow-300 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-yellow-400"
        >
          Yeni hesap
        </Link>
      </p>
    </AuthCard>
  )
}
