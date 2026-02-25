"use client"

import { useI18n } from "@/lib/i18n"
import { Card, CardContent } from "@/components/ui/card"
import { Languages, Brain, Target, TrendingUp, Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    icon: Languages,
    iconClass: "text-cyan",
    glowClass: "glow-cyan",
    borderClass: "border-cyan/10 hover:border-cyan/30",
    titleEn: "Vernacular Assessment", titleTa: "தாய்மொழி மதிப்பீடு",
    descEn: "Cognitive & behavioral modules in Tamil. Zero English Tax. Measure true intelligence, not linguistic ability.",
    descTa: "தமிழில் அறிவாற்றல் & நடத்தை தொகுதிகள். ஆங்கில வரி இல்லை.",
  },
  {
    icon: Brain,
    iconClass: "text-violet",
    glowClass: "glow-violet",
    borderClass: "border-violet/10 hover:border-violet/30",
    titleEn: "IRT Adaptive Engine", titleTa: "IRT தகவமைப்பு இயந்திரம்",
    descEn: "Item Response Theory engine adapts difficulty in real-time. Each response recalibrates the measurement model.",
    descTa: "IRT இயந்திரம் நிகழ்நேரத்தில் சிரமத்தை மாற்றுகிறது.",
  },
  {
    icon: Target,
    iconClass: "text-emerald",
    glowClass: "glow-emerald",
    borderClass: "border-emerald/10 hover:border-emerald/30",
    titleEn: "Cosine Similarity Matching", titleTa: "கோசைன் ஒற்றுமை பொருத்தம்",
    descEn: "Vector-space P/E fit scoring. Your persona vector mapped against job requirement vectors. Precision, not probability.",
    descTa: "வெக்டர்-ஸ்பேஸ் P/E பொருத்த மதிப்பெண்.",
  },
  {
    icon: TrendingUp,
    iconClass: "text-cyan",
    glowClass: "glow-cyan",
    borderClass: "border-cyan/10 hover:border-cyan/30",
    titleEn: "Career Hygiene Score", titleTa: "தொழில் சுகாதார மதிப்பெண்",
    descEn: "Proprietary 0-100 composite score. 30% Cognitive + 30% Behavioral + 25% Domain + 15% Role Alignment.",
    descTa: "தனியுரிம 0-100 கூட்டு மதிப்பெண்.",
  },
  {
    icon: Shield,
    iconClass: "text-violet",
    glowClass: "glow-violet",
    borderClass: "border-violet/10 hover:border-violet/30",
    titleEn: "Retention Prediction", titleTa: "தக்கவைப்பு கணிப்பு",
    descEn: "ML-driven 12-month retention likelihood. Behavioral trait analysis predicts workplace longevity and satisfaction.",
    descTa: "ML-இயக்கப்படும் 12 மாத தக்கவைப்பு வாய்ப்பு.",
  },
  {
    icon: Zap,
    iconClass: "text-emerald",
    glowClass: "glow-emerald",
    borderClass: "border-emerald/10 hover:border-emerald/30",
    titleEn: "Employability Gym", titleTa: "வேலைவாய்ப்பு உடற்பயிற்சிக்கூடம்",
    descEn: "Daily micro-tasks to optimize your Career Hygiene Score. 10-15 minute targeted exercises on weakness vectors.",
    descTa: "உங்கள் தொழில் சுகாதார மதிப்பெண்ணை மேம்படுத்தும் தினசரி பணிகள்.",
  },
]

export function Features() {
  const { language, t } = useI18n()

  return (
    <section className="bg-surface/50 py-16 md:py-24 relative">
      <div className="absolute inset-0 bg-dots opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="text-[10px] font-mono text-violet/60 tracking-[0.3em] uppercase">Capabilities</span>
          <h2 className="mt-2 text-balance text-2xl font-bold text-foreground md:text-3xl font-mono tracking-tight">
            {t("section.features")}
          </h2>
          <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-violet/50 to-transparent" />
        </motion.div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.titleEn}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
              >
                <Card className={`group glass h-full transition-all ${feature.borderClass}`}>
                  <CardContent className="p-5">
                    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-surface transition-all group-hover:${feature.glowClass}`}>
                      <Icon className={`h-5 w-5 ${feature.iconClass}`} />
                    </div>
                    <h3 className="mb-2 text-sm font-semibold text-foreground tracking-tight font-mono">
                      {language === "en" ? feature.titleEn : feature.titleTa}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {language === "en" ? feature.descEn : feature.descTa}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
