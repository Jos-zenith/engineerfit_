"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Briefcase, Shield } from "lucide-react"
import { motion } from "framer-motion"

interface Role {
  role: string
  fitPercent: number
  retention: number
}

export function RoleRecommendations({ roles }: { roles: Role[] }) {
  const getScoreBadge = (score: number) => {
    if (score >= 85) return { label: "ELITE MATCH", className: "bg-gold/10 text-gold border-gold/30" }
    if (score >= 70) return { label: "GOOD FIT", className: "bg-emerald/10 text-emerald border-emerald/30" }
    if (score >= 60) return { label: "MODERATE", className: "bg-violet/10 text-violet border-violet/30" }
    return { label: "LOW FIT", className: "bg-destructive/10 text-destructive border-destructive/30" }
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-mono tracking-tight">
          <Briefcase className="h-4 w-4 text-cyan" />
          ROLE_RECOMMENDATIONS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role, idx) => {
            const badge = getScoreBadge(role.fitPercent)
            const isElite = role.fitPercent >= 85
            return (
              <motion.div
                key={role.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className={`rounded-xl border p-4 transition-all ${
                  isElite
                    ? "border-gold/30 bg-gold/[0.03] glow-gold"
                    : "border-white/5 bg-surface/30 hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-muted-foreground tracking-[0.15em]">
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                  <Badge variant="outline" className={`text-[9px] font-mono tracking-[0.1em] ${badge.className}`}>
                    {badge.label}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-3 tracking-tight">{role.role}</h3>

                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground text-[10px] font-mono tracking-wider">FIT_SCORE</span>
                      <span className={`font-bold font-mono tracking-wider ${isElite ? "text-gold" : "text-foreground"}`}>{role.fitPercent}%</span>
                    </div>
                    <Progress value={role.fitPercent} className="h-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-emerald" />
                    <span className="text-[10px] text-muted-foreground font-mono tracking-wider">RETENTION:</span>
                    <span className="font-medium font-mono text-emerald tracking-wider text-xs">{role.retention}%</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
