"use client"

import { useI18n } from "@/lib/i18n"
import Image from "next/image"

export function LandingFooter() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-white/5 bg-obsidian">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/pawn.jpg"
              alt="engineerfit logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md border border-cyan/20 object-cover"
            />
            <span className="text-xs font-bold font-mono tracking-[0.15em] uppercase text-foreground">engineerfit</span>
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
