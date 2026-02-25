"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, Heart, Cpu } from "lucide-react"
import { motion } from "framer-motion"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const pillars = [
  { icon: Brain, label: "feature.cognitive", weight: "0.30w", iconClass: "text-cyan", borderClass: "border-cyan/20 hover:border-cyan/40 glow-cyan" },
  { icon: Heart, label: "feature.behavioral", weight: "0.30w", iconClass: "text-violet", borderClass: "border-violet/20 hover:border-violet/40 glow-violet" },
  { icon: Cpu, label: "feature.domain", weight: "0.40w", iconClass: "text-emerald", borderClass: "border-emerald/20 hover:border-emerald/40 glow-emerald" },
]

/* SVG Vector Mesh Orb representing the Matching Engine */
function VectorMeshOrb() {
  return (
    <div className="relative mx-auto w-[280px] h-[280px] md:w-[360px] md:h-[360px]">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-cyan/5 blur-[60px] animate-orb-pulse" />
      <div className="absolute inset-4 rounded-full bg-violet/5 blur-[40px] animate-orb-pulse" style={{ animationDelay: "1s" }} />

      <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Outer ring */}
        <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(34,211,238,0.12)" strokeWidth="1" />
        <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(167,139,250,0.1)" strokeWidth="1" />
        <circle cx="200" cy="200" r="100" fill="none" stroke="rgba(52,211,153,0.1)" strokeWidth="1" />

        {/* Geodesic mesh lines */}
        {[0, 30, 60, 90, 120, 150].map((angle) => (
          <line
            key={angle}
            x1={200 + 180 * Math.cos((angle * Math.PI) / 180)}
            y1={200 + 180 * Math.sin((angle * Math.PI) / 180)}
            x2={200 + 180 * Math.cos(((angle + 180) * Math.PI) / 180)}
            y2={200 + 180 * Math.sin(((angle + 180) * Math.PI) / 180)}
            stroke="rgba(34,211,238,0.08)"
            strokeWidth="0.5"
          />
        ))}

        {/* Inner hexagonal mesh */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const x = 200 + 100 * Math.cos((angle * Math.PI) / 180)
          const y = 200 + 100 * Math.sin((angle * Math.PI) / 180)
          const nextAngle = (angle + 60) % 360
          const nx = 200 + 100 * Math.cos((nextAngle * Math.PI) / 180)
          const ny = 200 + 100 * Math.sin((nextAngle * Math.PI) / 180)
          return (
            <g key={`hex-${i}`}>
              <line x1={x} y1={y} x2={nx} y2={ny} stroke="rgba(167,139,250,0.15)" strokeWidth="1" />
              <line x1={x} y1={y} x2="200" y2="200" stroke="rgba(52,211,153,0.08)" strokeWidth="0.5" />
              <circle cx={x} cy={y} r="3" fill="rgba(34,211,238,0.4)" />
            </g>
          )
        })}

        {/* Outer vertex nodes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const x = 200 + 170 * Math.cos((angle * Math.PI) / 180)
          const y = 200 + 170 * Math.sin((angle * Math.PI) / 180)
          return <circle key={`outer-${i}`} cx={x} cy={y} r="2" fill="rgba(167,139,250,0.3)" />
        })}

        {/* Mid-ring nodes */}
        {[15, 75, 135, 195, 255, 315].map((angle, i) => {
          const x = 200 + 140 * Math.cos((angle * Math.PI) / 180)
          const y = 200 + 140 * Math.sin((angle * Math.PI) / 180)
          return <circle key={`mid-${i}`} cx={x} cy={y} r="2" fill="rgba(52,211,153,0.4)" />
        })}

        {/* Center core */}
        <circle cx="200" cy="200" r="8" fill="rgba(34,211,238,0.2)" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="3" fill="#22D3EE" />

        {/* Data flow arcs */}
        <path d="M 200 20 A 180 180 0 0 1 380 200" fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth="2" strokeDasharray="4 8" />
        <path d="M 380 200 A 180 180 0 0 1 200 380" fill="none" stroke="rgba(167,139,250,0.08)" strokeWidth="2" strokeDasharray="4 8" />
        <path d="M 200 380 A 180 180 0 0 1 20 200" fill="none" stroke="rgba(52,211,153,0.08)" strokeWidth="2" strokeDasharray="4 8" />
      </svg>

      {/* Labels around orb */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan/50 tracking-[0.2em]">COGNITIVE</div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-emerald/50 tracking-[0.2em]">DOMAIN</div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-violet/50 tracking-[0.2em] [writing-mode:vertical-lr] rotate-180">BEHAVIORAL</div>
    </div>
  )
}

export function LandingHero() {
  const { t } = useI18n()

  return (
    <section className="relative overflow-hidden bg-obsidian">
      <div className="absolute inset-0 bg-grid" />
      {/* Ambient glow orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan/[0.03] blur-[100px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-violet/[0.03] blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:py-32">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <Badge className="mb-6 bg-cyan/10 text-cyan border border-cyan/20 px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase font-mono">
                {t("hero.badge")}
              </Badge>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl font-mono"
            >
              <span className="text-foreground">{t("hero.title")}</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-6 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link href="/assessment">
                <Button size="lg" className="h-12 gap-2 bg-cyan text-cyan-foreground hover:bg-cyan/90 px-6 text-sm min-w-[200px] glow-cyan-strong font-mono tracking-[0.1em]">
                  {t("hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/recruiter">
                <Button size="lg" variant="outline" className="h-12 gap-2 border-white/10 text-foreground hover:bg-surface hover:border-cyan/20 px-6 text-sm min-w-[200px] font-mono tracking-[0.1em]">
                  {t("hero.cta2")}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right: Vector Mesh Orb */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex-1 flex items-center justify-center"
          >
            <VectorMeshOrb />
          </motion.div>
        </div>

        {/* Three pillars */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-4 md:gap-6"
        >
          {pillars.map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center gap-3 rounded-xl glass p-4 md:p-5 transition-all ${item.borderClass}`}
            >
              <item.icon className={`h-6 w-6 ${item.iconClass}`} />
              <span className="text-center text-[10px] font-mono font-medium text-foreground/80 tracking-[0.1em] uppercase md:text-xs">
                {t(item.label)}
              </span>
              <span className={`text-center text-[10px] font-mono ${item.iconClass} opacity-70`}>{item.weight}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
