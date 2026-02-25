"use client"

import { useI18n } from "@/lib/i18n"
import { Terminal } from "lucide-react"

export function LandingFooter() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-white/5 bg-obsidian">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan/20 bg-cyan/10">
              <Terminal className="h-3.5 w-3.5 text-cyan" />
            </div>
            <span className="text-xs font-bold font-mono tracking-[0.15em] uppercase text-foreground">EngineerFit</span>
          </div>
          <p className="text-center text-xs text-muted-foreground font-mono tracking-wider">
            {t("footer.tagline")}
          </p>
          <p className="text-[10px] text-muted-foreground/40 font-mono tracking-wider">
            {"v1.0.0 // 2026"}
          </p>
        </div>
      </div>
    </footer>
  )
}
