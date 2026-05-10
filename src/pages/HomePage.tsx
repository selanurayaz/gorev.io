import { Container } from '@/components/ui/Container'

export function HomePage() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-gorev-green-400">
            Mikro hizmet pazaryeri
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-gorev-snow sm:text-4xl lg:text-5xl">
            Yerel ve çevrimiçi kısa süreli işleri{' '}
            <span className="text-gorev-yellow-400">tek yerden</span> yönetin.
          </h1>
          <p className="mt-6 text-pretty text-base leading-relaxed text-gorev-muted sm:text-lg">
            görev.io ile hizmet verenleri ve görev sahiplerini buluşturun.
            Şimdilik iskelet arayüz; arama, ilanlar ve ödeme akışları sonra
            eklenecek.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="rounded-xl bg-gorev-green-500 px-6 py-3 text-base font-semibold text-gorev-navy-950 shadow-lg shadow-gorev-green-500/20 transition hover:bg-gorev-green-400"
            >
              Görev oluştur
            </button>
            <button
              type="button"
              className="rounded-xl border border-gorev-navy-800 bg-transparent px-6 py-3 text-base font-semibold text-gorev-snow transition hover:border-gorev-yellow-400 hover:text-gorev-yellow-300"
            >
              Hizmet ver
            </button>
          </div>
        </div>
      </Container>
    </section>
  )
}
