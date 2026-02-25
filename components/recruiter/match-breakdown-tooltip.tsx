"use client"

import { type Candidate } from "@/lib/mock-data"
import { Brain, Heart, Cpu, Info } from "lucide-react"

interface MatchBreakdownTooltipProps {
  candidate: Candidate
  jobTitle: string
}

export function MatchBreakdownTooltip({ candidate, jobTitle }: MatchBreakdownTooltipProps) {
  const getInsight = (dim: string, score: number) => {
    if (score >= 85) return `Strong ${dim} alignment`
    if (score >= 70) return `Good ${dim} correlation`
    if (score >= 55) return `Partial ${dim} match`
    return `Below threshold: ${dim}`
  }

  return (
    <div className="rounded-xl border border-cyan/20 bg-cyan/[0.03] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-3.5 w-3.5 text-cyan" />
        <p className="text-[10px] font-mono text-foreground tracking-wider">
          MATCH_ANALYSIS // {candidate.overallFit}% for {jobTitle}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 text-[11px]">
        <div className="flex items-start gap-2">
          <Brain className="h-3.5 w-3.5 text-cyan shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-foreground">{getInsight("Cognitive", candidate.cognitiveFit)}</span>
            <span className="text-muted-foreground">
              {" -- "}{candidate.cognitiveFit >= 70
                ? "High Investigative score maps to R&D vectors"
                : "Cognitive vector may benefit from targeted calibration"}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Heart className="h-3.5 w-3.5 text-violet shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-foreground">{getInsight("Behavioral", candidate.behavioralFit)}</span>
            <span className="text-muted-foreground">
              {" -- "}{candidate.behavioralFit >= 70
                ? "Conscientiousness + Grit predict reliability"
                : "Behavioral signature suggests collaboration development"}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Cpu className="h-3.5 w-3.5 text-emerald shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-foreground">{getInsight("Domain", candidate.domainFit)}</span>
            <span className="text-muted-foreground">
              {" -- "}{candidate.domainFit >= 70
                ? "Technical proficiency aligns with role requirement vectors"
                : "Domain vectors need strengthening in key areas"}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-[8px] text-muted-foreground/60 font-mono tracking-[0.1em]">
        cos(theta) = (P . J) / (||P|| * ||J||) // Persona Vector vs Job Vector
      </p>
    </div>
  )
}
