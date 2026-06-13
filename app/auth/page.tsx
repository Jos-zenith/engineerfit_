"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { I18nProvider } from "@/lib/i18n"
import { LandingNav } from "@/components/landing/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Briefcase } from "lucide-react"

type Role = "student" | "recruiter"

function setStoredRole(role: Role) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("engineerfit-role", role)
  }
}

export default function AuthPage() {
  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <LandingNav />
        <main className="flex-1 bg-obsidian relative">
          <div className="absolute inset-0 bg-grid" />
          <div className="relative mx-auto max-w-md px-4 py-10">
            <AuthCard />
          </div>
        </main>
      </div>
    </I18nProvider>
  )
}

function AuthCard() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const storedRole = window.localStorage.getItem("engineerfit-role")
    if (storedRole === "student" || storedRole === "recruiter") {
      setSelectedRole(storedRole)
    }
  }, [])

  function continueAs(role: Role) {
    setStoredRole(role)
    setSelectedRole(role)
    router.push(role === "recruiter" ? "/recruiter" : "/assessment")
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="font-mono tracking-[0.12em] text-base uppercase">
          Choose your experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          No login is required right now. Pick the experience you want to open.
        </p>

        <div className="grid gap-3">
          <Button
            type="button"
            onClick={() => continueAs("student")}
            className="h-12 justify-between bg-cyan text-cyan-foreground hover:bg-cyan/90 font-mono tracking-[0.1em] uppercase"
          >
            <span className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Student
            </span>
            <span className="text-xs opacity-80">Assessment</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => continueAs("recruiter")}
            className="h-12 justify-between border-white/10 font-mono tracking-[0.1em] uppercase"
          >
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Recruiter
            </span>
            <span className="text-xs opacity-80">Dashboard</span>
          </Button>
        </div>

        {selectedRole && (
          <p className="text-xs font-mono text-emerald">
            Current selection: {selectedRole}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
