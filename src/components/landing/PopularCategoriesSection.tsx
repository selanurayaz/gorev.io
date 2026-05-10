import { popularCategories } from '@/data/landing-content'

import { CategoryIcon } from '@/components/landing/CategoryIcon'
import { LandingSection } from '@/components/landing/LandingSection'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

export function PopularCategoriesSection() {
  return (
    <LandingSection id="kategoriler">
      <Container>
        <SectionHeading
          eyebrow="Popüler kategoriler"
          title="Her günlük ihtiyaca uygun mikro hizmetler"
          description="İstanbul’dan İzmir’e; yüz yüze ya da uzaktan — ihtiyacını seç, süreyi ve yeri netleştir."
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularCategories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                className="flex h-full w-full flex-col rounded-2xl border border-gorev-navy-800 bg-gorev-navy-900/40 p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-gorev-green-500/35 hover:bg-gorev-navy-900/70 hover:shadow-lg hover:shadow-black/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gorev-yellow-400"
              >
                <CategoryIcon name={cat.icon} />
                <span className="mt-4 text-lg font-semibold text-gorev-snow">
                  {cat.title}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-gorev-muted">
                  {cat.description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Container>
    </LandingSection>
  )
}
