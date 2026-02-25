"use client"

import { I18nProvider } from "@/lib/i18n"
import { LandingHero } from "@/components/landing/hero"
import { LandingNav } from "@/components/landing/nav"
import { HowItWorks } from "@/components/landing/how-it-works"
import { StatsBar } from "@/components/landing/stats-bar"
import { Features } from "@/components/landing/features"
import { LandingFooter } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <LandingNav />
        <main className="flex-1">
          <LandingHero />
          <StatsBar />
          <HowItWorks />
          <Features />
        </main>
        <LandingFooter />
      </div>
    </I18nProvider>
  )
}
