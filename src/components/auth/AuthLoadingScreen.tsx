import { Spinner } from '@/components/ui/Spinner'

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gorev-navy-950 px-4">
      <Spinner className="h-8 w-8 text-gorev-yellow-400" />
      <p className="text-sm text-gorev-muted">Oturum kontrol ediliyor…</p>
    </div>
  )
}
