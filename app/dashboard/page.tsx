"use client"

import { I18nProvider } from "@/lib/i18n"
import { LandingNav } from "@/components/landing/nav"
import { CareerFitSnapshot } from "@/components/dashboard/career-fit-snapshot"

export default function DashboardPage() {
  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <LandingNav />
        <main className="flex-1">
          <CareerFitSnapshot />
        </main>
      </div>
    </I18nProvider>
  )
}
