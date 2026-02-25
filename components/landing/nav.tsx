"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Terminal, Menu, X } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export function LandingNav() {
  const { language, setLanguage, t } = useI18n()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 glow-cyan">
            <Terminal className="h-4 w-4 text-cyan" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-[0.15em] uppercase font-mono">
            EngineerFit
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            { href: "/", key: "nav.home" },
            { href: "/assessment", key: "nav.assessment" },
            { href: "/dashboard", key: "nav.dashboard" },
            { href: "/recruiter", key: "nav.jobs" },
          ].map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="text-xs font-mono font-medium text-muted-foreground hover:text-cyan transition-colors tracking-[0.12em] uppercase"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {/* System Mode Language Switch */}
          <button
            onClick={() => setLanguage(language === "en" ? "ta" : "en")}
            className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 hover:border-cyan/30 transition-colors"
          >
            <span className="text-[10px] font-mono text-muted-foreground tracking-[0.15em]">{t("lang.system")}</span>
            <div className="flex items-center gap-1 rounded bg-surface px-2 py-0.5">
              <span className={`text-[10px] font-mono font-bold tracking-wider ${language === "en" ? "text-cyan" : "text-muted-foreground"}`}>EN</span>
              <span className="text-[10px] text-muted-foreground/40">/</span>
              <span className={`text-[10px] font-mono font-bold tracking-wider ${language === "ta" ? "text-cyan" : "text-muted-foreground"}`}>TA</span>
            </div>
          </button>
          <Link href="/assessment">
            <Button size="sm" className="bg-cyan text-cyan-foreground hover:bg-cyan/90 glow-cyan font-mono tracking-[0.1em] text-xs">
              {t("hero.cta")}
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border-t border-white/5 glass p-4 md:hidden"
        >
          <nav className="flex flex-col gap-3">
            <Link href="/" className="text-xs font-mono font-medium text-foreground py-2 tracking-[0.12em] uppercase" onClick={() => setOpen(false)}>{t("nav.home")}</Link>
            <Link href="/assessment" className="text-xs font-mono font-medium text-foreground py-2 tracking-[0.12em] uppercase" onClick={() => setOpen(false)}>{t("nav.assessment")}</Link>
            <Link href="/dashboard" className="text-xs font-mono font-medium text-foreground py-2 tracking-[0.12em] uppercase" onClick={() => setOpen(false)}>{t("nav.dashboard")}</Link>
            <Link href="/recruiter" className="text-xs font-mono font-medium text-foreground py-2 tracking-[0.12em] uppercase" onClick={() => setOpen(false)}>{t("nav.jobs")}</Link>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setLanguage(language === "en" ? "ta" : "en")}
                className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5"
              >
                <span className="text-[10px] font-mono text-muted-foreground tracking-wider">{t("lang.system")}</span>
                <span className="text-[10px] font-mono font-bold text-cyan">{language === "en" ? "EN" : "TA"}</span>
              </button>
              <Link href="/assessment">
                <Button size="sm" className="bg-cyan text-cyan-foreground glow-cyan font-mono tracking-wider text-xs">{t("hero.cta")}</Button>
              </Link>
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  )
}
