"use client"

import { mockStudentProfile } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp, Shield, Brain, Heart, Cpu,
  Star, AlertTriangle, Briefcase, Award, Target, Fingerprint,
} from "lucide-react"
import { PersonaRadarChart } from "./persona-radar-chart"
import { RiasecChart } from "./riasec-chart"
import { RoleRecommendations } from "./role-recommendations"
import { ScoreGauge } from "./score-gauge"
import { motion } from "framer-motion"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
}

export function CareerFitSnapshot() {
  const profile = mockStudentProfile

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald"
    if (score >= 50) return "text-gold"
    return "text-destructive"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 75) return { label: "OPTIMAL", className: "bg-emerald/10 text-emerald border-emerald/30" }
    if (score >= 50) return { label: "MODERATE", className: "bg-gold/10 text-gold border-gold/30" }
    return { label: "SUB-OPTIMAL", className: "bg-destructive/10 text-destructive border-destructive/30" }
  }

  const badge = getScoreBadge(profile.careerHygieneScore)

  return (
    <div className="min-h-screen bg-obsidian relative">
      <div className="absolute inset-0 bg-grid" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <motion.div
          custom={0} variants={fadeIn} initial="hidden" animate="visible"
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Fingerprint className="h-4 w-4 text-cyan" />
              <span className="text-[10px] font-mono text-cyan tracking-[0.2em] uppercase">Career Intelligence // Persona Analysis</span>
            </div>
            <h1 className="text-xl font-bold text-foreground md:text-2xl font-mono tracking-tight">
              CAREER_FIT_SNAPSHOT
            </h1>
            <p className="mt-1 text-xs text-muted-foreground font-mono tracking-wider">
              {profile.name} // {profile.college} // {profile.branch}
            </p>
          </div>
          <Badge variant="outline" className={`self-start px-3 py-1 text-[10px] font-mono tracking-[0.15em] ${badge.className}`}>
            {badge.label}
          </Badge>
        </motion.div>

        {/* Bento Grid: Top row */}
        <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-3 mb-4">
          {/* Career Hygiene Score - Tall card */}
          <Card className="glass glow-emerald">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-mono tracking-tight">
                <Award className="h-4 w-4 text-emerald" />
                CAREER_HYGIENE
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <ScoreGauge score={profile.careerHygieneScore} size={160} />
              <p className="mt-3 text-[9px] text-muted-foreground text-center font-mono tracking-[0.1em]">
                0.30C + 0.30B + 0.25D + 0.15R
              </p>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card className="glass md:col-span-2">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-mono tracking-tight">
                <Target className="h-4 w-4 text-cyan" />
                DIMENSION_SCORES
              </CardTitle>
            </CardHeader>
            <CardContent className="py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DimensionScore icon={Brain} label="Cognitive" score={profile.cognitiveScore} weight="0.30" iconClass="text-cyan" />
                <DimensionScore icon={Heart} label="Behavioral" score={profile.behavioralScore} weight="0.30" iconClass="text-violet" />
                <DimensionScore icon={Cpu} label="Domain" score={profile.domainScore} weight="0.25" iconClass="text-emerald" />
                <DimensionScore icon={Briefcase} label="Role Alignment" score={profile.roleAlignmentScore} weight="0.15" iconClass="text-cyan" />
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-lg border border-emerald/20 bg-emerald/[0.03] p-3">
                <Shield className="h-4 w-4 text-emerald shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground font-mono tracking-tight">Retention Prediction</p>
                  <p className="text-[10px] text-muted-foreground font-mono">12-month role stability probability</p>
                </div>
                <span className={`text-lg font-bold font-mono tracking-wider ${getScoreColor(profile.retentionPrediction)}`}>
                  {profile.retentionPrediction}%
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bento Grid: Charts row */}
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2 mb-4">
          <Card className="glass glow-cyan">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-mono tracking-tight">
                <Fingerprint className="h-4 w-4 text-cyan" />
                DIGITAL_FINGERPRINT
              </CardTitle>
              <p className="text-[9px] text-muted-foreground font-mono tracking-[0.15em]">Psychological Signature Vector</p>
            </CardHeader>
            <CardContent className="py-2">
              <PersonaRadarChart data={profile.personaVector} />
            </CardContent>
          </Card>

          <Card className="glass glow-violet">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-mono tracking-tight">
                <Target className="h-4 w-4 text-violet" />
                RIASEC_PROFILE
              </CardTitle>
              <p className="text-[9px] text-muted-foreground font-mono tracking-[0.15em]">Interest Topology Map</p>
            </CardHeader>
            <CardContent className="py-2">
              <RiasecChart data={profile.riasec} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Bento Grid: Strengths + Development + Peer */}
        <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-3 mb-4">
          <Card className="glass">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-mono tracking-tight">
                <Star className="h-4 w-4 text-emerald" />
                TOP_STRENGTHS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {profile.topStrengths.map((strength, idx) => (
                  <div key={strength} className="flex items-center gap-2 rounded-lg border border-emerald/10 bg-emerald/[0.03] px-3 py-2">
                    <span className="text-[9px] font-mono text-emerald/50 tracking-wider">{String(idx + 1).padStart(2, "0")}</span>
                    <TrendingUp className="h-3.5 w-3.5 text-emerald shrink-0" />
                    <span className="text-xs font-medium text-foreground">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-mono tracking-tight">
                <AlertTriangle className="h-4 w-4 text-gold" />
                DEV_AREAS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {profile.developmentAreas.map((area, idx) => (
                  <div key={area} className="flex items-center gap-2 rounded-lg border border-gold/10 bg-gold/[0.03] px-3 py-2">
                    <span className="text-[9px] font-mono text-gold/50 tracking-wider">{String(idx + 1).padStart(2, "0")}</span>
                    <AlertTriangle className="h-3.5 w-3.5 text-gold shrink-0" />
                    <span className="text-xs font-medium text-foreground">{area}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-xs font-mono tracking-tight">
                <TrendingUp className="h-4 w-4 text-cyan" />
                PEER_BENCHMARK
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <BenchmarkRow label="Same College" yourScore={profile.careerHygieneScore} avgScore={68} />
                <BenchmarkRow label="Same Discipline" yourScore={profile.careerHygieneScore} avgScore={72} />
                <BenchmarkRow label="Regional Avg" yourScore={profile.careerHygieneScore} avgScore={64} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Role Recommendations */}
        <motion.div custom={4} variants={fadeIn} initial="hidden" animate="visible">
          <RoleRecommendations roles={profile.recommendedRoles} />
        </motion.div>
      </div>
    </div>
  )
}

function DimensionScore({
  icon: Icon,
  label,
  score,
  weight,
  iconClass,
}: {
  icon: typeof Brain
  label: string
  score: number
  weight: string
  iconClass: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
          <span className="text-xs font-medium text-foreground font-mono">{label}</span>
          <span className="text-[9px] text-muted-foreground font-mono tracking-wider">({weight}w)</span>
        </div>
        <span className="text-xs font-bold font-mono text-foreground tracking-wider">{score}</span>
      </div>
      <Progress value={score} className="h-1" />
    </div>
  )
}

function BenchmarkRow({ label, yourScore, avgScore }: { label: string; yourScore: number; avgScore: number }) {
  const diff = yourScore - avgScore
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[10px] font-mono tracking-wider">{label}</span>
        <span className={`font-medium font-mono tracking-wider text-[10px] ${diff > 0 ? "text-emerald" : "text-destructive"}`}>
          {diff > 0 ? "+" : ""}{diff}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-surface overflow-hidden">
          <div className="h-full rounded-full bg-cyan" style={{ width: `${yourScore}%`, boxShadow: "0 0 6px rgba(34, 211, 238, 0.4)" }} />
        </div>
        <span className="text-[9px] text-muted-foreground font-mono w-5 text-right">{yourScore}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-surface overflow-hidden">
          <div className="h-full rounded-full bg-muted-foreground/20" style={{ width: `${avgScore}%` }} />
        </div>
        <span className="text-[9px] text-muted-foreground font-mono w-5 text-right">{avgScore}</span>
      </div>
    </div>
  )
}
