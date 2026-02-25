"use client"

import { type Candidate } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, GraduationCap } from "lucide-react"
import { motion } from "framer-motion"

interface CandidateMatchCardProps {
  candidate: Candidate
  rank: number
  isSelected: boolean
  onClick: () => void
}

export function CandidateMatchCard({ candidate, rank, isSelected, onClick }: CandidateMatchCardProps) {
  const isElite = candidate.overallFit >= 85

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "shortlisted": return "bg-cyan/10 text-cyan border-cyan/30"
      case "interviewing": return "bg-gold/10 text-gold border-gold/30"
      case "offered": return "bg-emerald/10 text-emerald border-emerald/30"
      default: return "bg-secondary text-secondary-foreground border-white/10"
    }
  }

  const getFitColor = (score: number) => {
    if (score >= 85) return "text-gold"
    if (score >= 75) return "text-emerald"
    if (score >= 65) return "text-cyan"
    return "text-destructive"
  }

  return (
    <motion.div whileHover={{ scale: 1.003 }} whileTap={{ scale: 0.997 }}>
      <Card
        className={`cursor-pointer transition-all ${
          isElite
            ? "glass border-gold/30 glow-gold"
            : isSelected
            ? "glass border-cyan/30 glow-cyan ring-1 ring-cyan/20"
            : "glass hover:border-white/15"
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Rank + Avatar */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-[9px] font-mono text-muted-foreground tracking-wider">#{String(rank).padStart(2, "0")}</span>
              <div className={`flex h-11 w-11 items-center justify-center rounded-md text-xs font-bold font-mono ${
                isElite
                  ? "bg-gold/10 text-gold border border-gold/30"
                  : "bg-cyan/10 text-cyan border border-cyan/20"
              }`}>
                {candidate.avatar}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground truncate tracking-tight">
                  {candidate.name}
                </h3>
                <Badge variant="outline" className={`text-[9px] shrink-0 font-mono tracking-[0.1em] ${getStatusBadge(candidate.status)}`}>
                  {candidate.status.toUpperCase()}
                </Badge>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground font-mono tracking-wider">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {candidate.college}
                </span>
                <span className="text-white/20">|</span>
                <span>{candidate.branch}</span>
                <span className="text-white/20">|</span>
                <span>CGPA:{candidate.cgpa}</span>
              </div>

              {/* Fit Score Bar */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <Progress value={candidate.overallFit} className="h-1" />
                </div>
                <span className={`text-base font-bold font-mono tracking-wider ${getFitColor(candidate.overallFit)}`}>
                  {candidate.overallFit}%
                </span>
                {isElite && (
                  <Badge className="bg-gold/10 text-gold border border-gold/30 text-[8px] font-mono tracking-[0.15em] px-1.5 py-0">
                    ELITE
                  </Badge>
                )}
              </div>

              {/* Quick Metrics */}
              <div className="mt-2 flex items-center gap-3 text-[9px] text-muted-foreground font-mono tracking-wider">
                <span>COG:<b className="text-cyan ml-0.5">{candidate.cognitiveFit}</b></span>
                <span>BEH:<b className="text-violet ml-0.5">{candidate.behavioralFit}</b></span>
                <span>DOM:<b className="text-emerald ml-0.5">{candidate.domainFit}</b></span>
                <span className="flex items-center gap-0.5">
                  <Shield className="h-2.5 w-2.5 text-emerald" />
                  <b className="text-emerald">{candidate.retentionPrediction}%</b>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
