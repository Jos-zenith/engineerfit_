"use client"

import { I18nProvider } from "@/lib/i18n"
import { LandingNav } from "@/components/landing/nav"
import { AssessmentEngine } from "@/components/assessment/assessment-engine"

export default function AssessmentPage() {
  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <LandingNav />
        <main className="flex-1">
          <AssessmentEngine />
        </main>
      </div>
    </I18nProvider>
  )
}
