"use client"

import { useI18n } from "@/lib/i18n"
import { Scan, Fingerprint, GitMerge } from "lucide-react"
import { motion } from "framer-motion"

const steps = [
  {
    num: "01",
    titleKey: "step.1.title",
    descKey: "step.1.desc",
    icon: Scan,
    iconClass: "text-cyan",
    boxClass: "border-cyan/20 bg-cyan/5 group-hover:bg-cyan/10 group-hover:border-cyan/40",
    labelClass: "text-cyan",
    glowClass: "glow-cyan",
  },
  {
    num: "02",
    titleKey: "step.2.title",
    descKey: "step.2.desc",
    icon: Fingerprint,
    iconClass: "text-violet",
    boxClass: "border-violet/20 bg-violet/5 group-hover:bg-violet/10 group-hover:border-violet/40",
    labelClass: "text-violet",
    glowClass: "glow-violet",
  },
  {
    num: "03",
    titleKey: "step.3.title",
    descKey: "step.3.desc",
    icon: GitMerge,
    iconClass: "text-emerald",
    boxClass: "border-emerald/20 bg-emerald/5 group-hover:bg-emerald/10 group-hover:border-emerald/40",
    labelClass: "text-emerald",
    glowClass: "glow-emerald",
  },
]

export function HowItWorks() {
  const { t } = useI18n()

  return (
    <section className="bg-obsidian py-16 md:py-24 relative">
      <div className="absolute inset-0 bg-dots" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-[10px] font-mono text-cyan/60 tracking-[0.3em] uppercase">Process</span>
          <h2 className="mt-2 text-balance text-2xl font-bold text-foreground md:text-3xl font-mono tracking-tight">
            {t("section.how")}
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
        </motion.div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                className="group relative flex flex-col items-center text-center"
              >
                <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border transition-all ${step.boxClass} ${step.glowClass}`}>
                  <Icon className={`h-9 w-9 ${step.iconClass}`} />
                </div>
                <span className={`mb-2 text-[10px] font-bold tracking-[0.25em] font-mono ${step.labelClass}`}>
                  {"STEP_" + step.num}
                </span>
                <h3 className="mb-3 text-base font-semibold text-foreground tracking-tight">
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(step.descKey)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
