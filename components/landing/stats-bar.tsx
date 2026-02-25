"use client"

import { useI18n } from "@/lib/i18n"
import { Cpu, Network, Target, Shield } from "lucide-react"
import { motion } from "framer-motion"

const stats = [
  { key: "stats.students", value: "12,847", icon: Cpu, color: "text-cyan" },
  { key: "stats.colleges", value: "45", icon: Network, color: "text-violet" },
  { key: "stats.placement", value: "89.2%", icon: Target, color: "text-emerald" },
  { key: "stats.retention", value: "91.7%", icon: Shield, color: "text-emerald" },
]

export function StatsBar() {
  const { t } = useI18n()

  return (
    <section className="border-y border-white/5 bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex flex-col items-center gap-1 border-r border-white/5 last:border-r-0 px-4 py-8 md:py-10"
            >
              <Icon className={`mb-2 h-4 w-4 ${stat.color} opacity-70`} />
              <span className="text-2xl font-bold text-foreground md:text-3xl font-mono tracking-wider">
                {stat.value}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-[0.15em] uppercase">
                {t(stat.key)}
              </span>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
