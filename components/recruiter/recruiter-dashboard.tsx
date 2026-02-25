"use client"

import { useState } from "react"
import { mockCandidates, mockJobPosting, type Candidate } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Briefcase, MapPin, DollarSign, Users, Filter, ChevronDown, ChevronUp,
  Brain, Heart, Cpu, Shield, TrendingUp, Search, Download, Star, Radar,
} from "lucide-react"
import { ResponsiveContainer, PolarAngleAxis, PolarGrid, RadarChart, Radar as RechartsRadar } from "recharts"
import { CandidateMatchCard } from "./candidate-match-card"
import { MatchBreakdownTooltip } from "./match-breakdown-tooltip"
import { motion, AnimatePresence } from "framer-motion"

/* Vector Overlap Visualization - shows Job Vector vs Student Vector overlapping */
function VectorOverlapChart({ candidate }: { candidate: Candidate }) {
  const data = [
    { subject: "Logical", student: candidate.cognitiveFit, job: 70 },
    { subject: "Problem Solving", student: Math.round(candidate.cognitiveFit * 0.9), job: 65 },
    { subject: "Conscientiousness", student: candidate.behavioralFit, job: 65 },
    { subject: "Grit", student: Math.round(candidate.behavioralFit * 1.05), job: 70 },
    { subject: "Teamwork", student: Math.round(candidate.behavioralFit * 0.85), job: 60 },
    { subject: "DS & Algo", student: candidate.domainFit, job: 75 },
    { subject: "Web Dev", student: Math.round(candidate.domainFit * 0.9), job: 70 },
    { subject: "Databases", student: Math.round(candidate.domainFit * 0.85), job: 65 },
  ]

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.05)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 8, fontFamily: "var(--font-jetbrains)" }} />
          {/* Job Vector (background) */}
          <RechartsRadar name="Job Vector" dataKey="job" stroke="#A78BFA" fill="#A78BFA" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
          {/* Student Vector (foreground) */}
          <RechartsRadar name="Student" dataKey="student" stroke="#22D3EE" fill="#22D3EE" fillOpacity={0.12} strokeWidth={2} style={{ filter: "drop-shadow(0 0 6px rgba(34, 211, 238, 0.5))" }} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 mt-1 text-[9px] font-mono tracking-wider">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan" /> Student</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet border border-violet/50" style={{ borderStyle: "dashed" }} /> Job Req</span>
      </div>
    </div>
  )
}

export function RecruiterDashboard() {
  const [minFit, setMinFit] = useState([70])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const job = mockJobPosting

  const filtered = mockCandidates
    .filter((c) => c.overallFit >= minFit[0])
    .sort((a, b) => b.overallFit - a.overallFit)

  return (
    <div className="min-h-screen bg-obsidian relative">
      <div className="absolute inset-0 bg-grid" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Job Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radar className="h-4 w-4 text-gold" />
                <span className="text-[10px] font-mono text-gold tracking-[0.2em] uppercase">Talent Scouter // Vector Match Engine</span>
              </div>
              <h1 className="text-xl font-bold text-foreground md:text-2xl font-mono tracking-tight">
                ELITE_MATCH_DASHBOARD
              </h1>
              <p className="mt-1 text-xs text-muted-foreground font-mono tracking-wider">
                Deterministic candidate ranking by cosine similarity
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 self-start border-white/10 text-muted-foreground hover:text-foreground hover:border-cyan/30 font-mono tracking-[0.1em] text-xs">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>

          <Card className="mt-5 glass">
            <CardContent className="p-4 md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground font-mono tracking-tight">{job.title}</h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono tracking-wider">
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {job.salary}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xl font-bold font-mono text-cyan tracking-wider">{filtered.length}</p>
                    <p className="text-[9px] text-muted-foreground font-mono tracking-[0.15em] uppercase">Matching</p>
                  </div>
                  <Users className="h-7 w-7 text-cyan/70" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <div className="mb-6">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-2 text-xs font-mono text-foreground mb-3 tracking-[0.15em] uppercase">
            <Filter className="h-3.5 w-3.5 text-cyan" />
            Filters
            {filtersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <AnimatePresence>
            {filtersOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <Card className="glass mb-5">
                  <CardContent className="p-4 md:p-5">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-[10px] font-mono text-muted-foreground mb-2 block tracking-[0.15em] uppercase">
                          Min Fit Score: <span className="text-cyan">{minFit[0]}%</span>
                        </label>
                        <Slider value={minFit} onValueChange={setMinFit} max={100} min={0} step={5} className="mt-2" />
                        <div className="flex justify-between text-[9px] text-muted-foreground mt-1 font-mono">
                          <span>0%</span><span>100%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-muted-foreground mb-2 block tracking-[0.15em] uppercase">Quick Filters</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["CSE", "IT", "ECE", "MECH", "CGPA>7.5"].map((f) => (
                            <Badge key={f} variant="outline" className="cursor-pointer hover:bg-cyan/10 hover:border-cyan/30 py-1 px-2 font-mono tracking-[0.1em] text-[10px] border-white/10">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Candidate List + Detail */}
        <div className="grid gap-4 lg:grid-cols-5">
          {/* List */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <span className="text-[9px] font-mono text-muted-foreground tracking-[0.15em] uppercase">
              {filtered.length} candidates // ranked by cos(theta)
            </span>

            {filtered.map((candidate, idx) => (
              <motion.div key={candidate.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, duration: 0.3 }}>
                <CandidateMatchCard candidate={candidate} rank={idx + 1} isSelected={selectedCandidate?.id === candidate.id} onClick={() => setSelectedCandidate(candidate)} />
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <Card className="glass">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Search className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-xs text-muted-foreground font-mono">No candidates match current filter parameters.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedCandidate ? (
                <motion.div key={selectedCandidate.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                  <Card className={`glass sticky top-20 ${
                    selectedCandidate.overallFit >= 85 ? "border-gold/30 glow-gold" : "border-cyan/20 glow-cyan"
                  }`}>
                    <CardHeader className="pb-1">
                      <CardTitle className="flex items-center gap-3 text-sm">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-md text-xs font-bold font-mono ${
                          selectedCandidate.overallFit >= 85
                            ? "bg-gold/10 text-gold border border-gold/30"
                            : "bg-cyan/10 text-cyan border border-cyan/20"
                        }`}>
                          {selectedCandidate.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground tracking-tight">{selectedCandidate.name}</p>
                          <p className="text-[9px] text-muted-foreground font-normal font-mono tracking-wider">
                            {selectedCandidate.college} // {selectedCandidate.branch}
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      {/* Cosine Similarity Score - Glows at 85%+ */}
                      <div className={`text-center rounded-xl border p-4 ${
                        selectedCandidate.overallFit >= 85
                          ? "border-gold/30 bg-gold/[0.03] glow-gold-strong"
                          : "border-cyan/20 bg-cyan/[0.03]"
                      }`}>
                        <p className="text-[9px] font-mono text-muted-foreground tracking-[0.15em] uppercase mb-1">COSINE_SIMILARITY</p>
                        <p className={`text-3xl font-bold font-mono tracking-wider ${
                          selectedCandidate.overallFit >= 85 ? "text-gold" : "text-cyan"
                        }`}>
                          {selectedCandidate.overallFit}%
                        </p>
                        {selectedCandidate.overallFit >= 85 && (
                          <Badge className="mt-2 bg-gold/10 text-gold border border-gold/30 text-[8px] font-mono tracking-[0.2em]">
                            ELITE MATCH
                          </Badge>
                        )}
                      </div>

                      {/* Vector Overlap Chart */}
                      <div className="rounded-xl border border-white/5 bg-surface/30 p-3">
                        <p className="text-[9px] font-mono text-muted-foreground tracking-[0.15em] uppercase mb-2">VECTOR_ALIGNMENT</p>
                        <VectorOverlapChart candidate={selectedCandidate} />
                      </div>

                      {/* Match Breakdown */}
                      <MatchBreakdownTooltip candidate={selectedCandidate} jobTitle={job.title} />

                      {/* Dimension Scores */}
                      <div className="flex flex-col gap-2.5">
                        <ScoreBar icon={Brain} label="COG" score={selectedCandidate.cognitiveFit} iconClass="text-cyan" scoreClass="text-cyan" />
                        <ScoreBar icon={Heart} label="BEH" score={selectedCandidate.behavioralFit} iconClass="text-violet" scoreClass="text-violet" />
                        <ScoreBar icon={Cpu} label="DOM" score={selectedCandidate.domainFit} iconClass="text-emerald" scoreClass="text-emerald" />
                      </div>

                      {/* CHS + Retention */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-cyan/20 bg-cyan/[0.03] p-3 text-center">
                          <TrendingUp className="h-3.5 w-3.5 text-cyan mx-auto mb-1" />
                          <p className="text-base font-bold font-mono text-foreground tracking-wider">{selectedCandidate.careerHygieneScore}</p>
                          <p className="text-[8px] text-muted-foreground font-mono tracking-[0.1em] uppercase">Career Hygiene</p>
                        </div>
                        <div className="rounded-lg border border-emerald/20 bg-emerald/[0.03] p-3 text-center">
                          <Shield className="h-3.5 w-3.5 text-emerald mx-auto mb-1" />
                          <p className="text-base font-bold font-mono text-emerald tracking-wider">{selectedCandidate.retentionPrediction}%</p>
                          <p className="text-[8px] text-muted-foreground font-mono tracking-[0.1em] uppercase">Retention</p>
                        </div>
                      </div>

                      {/* Top Strengths */}
                      <div>
                        <p className="text-[9px] font-mono text-muted-foreground mb-2 tracking-[0.15em] uppercase">Strength Vectors</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCandidate.topStrengths.map((s) => (
                            <Badge key={s} variant="outline" className="text-[9px] bg-emerald/[0.03] text-emerald border-emerald/20 font-mono tracking-wider">
                              <Star className="h-2.5 w-2.5 mr-1" />{s}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-1">
                        <Button size="sm" className="flex-1 bg-cyan text-cyan-foreground hover:bg-cyan/90 glow-cyan font-mono tracking-[0.1em] text-xs">
                          Shortlist
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-white/10 text-muted-foreground hover:text-foreground hover:border-cyan/30 font-mono tracking-[0.1em] text-xs">
                          Full Snapshot
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card className="glass">
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <Users className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-xs text-muted-foreground font-mono text-center tracking-wider">
                      Select a candidate to view vector alignment
                    </p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreBar({
  icon: Icon,
  label,
  score,
  iconClass,
  scoreClass,
}: {
  icon: typeof Brain
  label: string
  score: number
  iconClass: string
  scoreClass: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-3 w-3 ${iconClass}`} />
          <span className="text-[10px] text-muted-foreground font-mono tracking-[0.15em]">{label}</span>
        </div>
        <span className={`text-[10px] font-bold font-mono tracking-wider ${scoreClass}`}>{score}%</span>
      </div>
      <Progress value={score} className="h-1" />
    </div>
  )
}
