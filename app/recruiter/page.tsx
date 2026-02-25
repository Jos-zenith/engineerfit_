"use client"

import { I18nProvider } from "@/lib/i18n"
import { LandingNav } from "@/components/landing/nav"
import { RecruiterDashboard } from "@/components/recruiter/recruiter-dashboard"

export default function RecruiterPage() {
  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <LandingNav />
        <main className="flex-1">
          <RecruiterDashboard />
        </main>
      </div>
    </I18nProvider>
  )
}
