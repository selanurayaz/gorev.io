import { AiPricingSection } from '@/components/landing/AiPricingSection'
import { CtaSection } from '@/components/landing/CtaSection'
import { FeaturedServicesSection } from '@/components/landing/FeaturedServicesSection'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { PopularCategoriesSection } from '@/components/landing/PopularCategoriesSection'
import { StatsSection } from '@/components/landing/StatsSection'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularCategoriesSection />
      <HowItWorksSection />
      <AiPricingSection />
      <FeaturedServicesSection />
      <StatsSection />
      <CtaSection />
    </>
  )
}
