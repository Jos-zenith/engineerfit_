"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { I18nProvider } from "@/lib/i18n"
import { LandingNav } from "@/components/landing/nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getSupabaseClient } from "@/lib/supabase/client"
import { fetchWithAuth } from "@/lib/auth-fetch"

type Role = "student" | "recruiter"

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
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("student")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function saveProfile(nextRole: Role, nextFullName: string, accessToken?: string | null) {
    const response = await fetchWithAuth("/api/auth/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      accessToken,
      body: JSON.stringify({ role: nextRole, fullName: nextFullName }),
    })

    const payload = await response.json()
    if (!response.ok) {
      throw new Error(payload?.error || "Unable to save profile")
    }

    if (payload?.syncMetadataOnClient) {
      const supabase = getSupabaseClient()
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          role: nextRole,
          full_name: nextFullName || null,
        },
      })

      if (metadataError) {
        throw metadataError
      }
    }

    return payload
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setErrorMessage(null)
    setMessage(null)

    try {
      const supabase = getSupabaseClient()

      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        await saveProfile(role, fullName, data.session?.access_token)
        setMessage("Signed in successfully.")
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        if (data.session) {
          await saveProfile(role, fullName, data.session.access_token)
        } else {
          setMessage("Account created. Verify your email, then sign in.")
          return
        }
      }

      router.push(role === "recruiter" ? "/recruiter" : "/assessment")
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="font-mono tracking-[0.12em] text-base uppercase">
          {mode === "login" ? "Secure Login" : "Create Account"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs font-mono tracking-[0.1em] uppercase">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" required={mode === "signup"} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-mono tracking-[0.1em] uppercase">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-mono tracking-[0.1em] uppercase">Password</Label>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" required minLength={6} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-mono tracking-[0.1em] uppercase">Role</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant={role === "student" ? "default" : "outline"} onClick={() => setRole("student")} className="text-xs font-mono tracking-[0.08em] uppercase">
                Student
              </Button>
              <Button type="button" variant={role === "recruiter" ? "default" : "outline"} onClick={() => setRole("recruiter")} className="text-xs font-mono tracking-[0.08em] uppercase">
                Recruiter
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-cyan text-cyan-foreground hover:bg-cyan/90 font-mono tracking-[0.1em] uppercase" disabled={busy}>
            {busy ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </Button>

          {errorMessage && <p className="text-xs text-destructive font-mono">{errorMessage}</p>}
          {message && <p className="text-xs text-emerald font-mono">{message}</p>}
        </form>

        <Button
          type="button"
          variant="ghost"
          className="mt-3 w-full text-xs font-mono tracking-[0.1em]"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </Button>
      </CardContent>
    </Card>
  )
}
