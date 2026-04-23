"use client"

import { useEffect, useState, type FormEvent } from "react"
import { fetchWithAuth } from "@/lib/auth-fetch"
import { type Candidate } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Briefcase, MapPin, DollarSign, Users, Filter, ChevronDown, ChevronUp,
  Brain, Heart, Cpu, Shield, TrendingUp, Search, Download, Star, Radar,
} from "lucide-react"
import { ResponsiveContainer, PolarAngleAxis, PolarGrid, RadarChart, Radar as RechartsRadar, Tooltip as RechartsTooltip } from "recharts"
import { CandidateMatchCard } from "./candidate-match-card"
import { MatchBreakdownTooltip } from "./match-breakdown-tooltip"
import { motion, AnimatePresence } from "framer-motion"

interface RecruiterJob {
  title: string
  company: string
  location: string
  type: string
  salary: string
  jobVector: number[]
  requirements: {
    cognitive: Record<string, number>
    behavioral: Record<string, number>
    domain: Record<string, number>
  }
  minFitScore: number
  minCareerHygieneScore: number
}

interface JobFormState {
  title: string
  company: string
  location: string
  employmentType: string
  salaryRange: string
  minFitScore: string
  minCareerHygieneScore: string
  jobVector: string
  logicalReasoning: string
  problemSolving: string
  analyticalThinking: string
  conscientiousness: string
  grit: string
  teamwork: string
  dataStructures: string
  webDevelopment: string
  databases: string
}

type RecruiterCandidate = Candidate & { studentVector: number[] }

interface VectorDatum {
  subject: string
  student: number
  job: number
  delta: number
  contribution: number
}

function VectorContributionTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: VectorDatum }> }) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null
  }

  const point = payload[0].payload

  return (
    <div className="rounded-lg border border-cyan/30 bg-obsidian/95 p-3 shadow-lg">
      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan">{point.subject}</p>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-mono">
        <span className="text-muted-foreground">Student</span>
        <span className="text-right text-foreground">{point.student.toFixed(1)}</span>
        <span className="text-muted-foreground">Job</span>
        <span className="text-right text-foreground">{point.job.toFixed(1)}</span>
        <span className="text-muted-foreground">Gap</span>
        <span className="text-right text-foreground">{Math.abs(point.delta).toFixed(1)}</span>
        <span className="text-muted-foreground">cos(theta) contrib</span>
        <span className="text-right text-emerald">{point.contribution.toFixed(2)} pts</span>
      </div>
    </div>
  )
}

/* Vector Overlap Visualization - shows Job Vector vs Student Vector overlapping */
function VectorOverlapChart({ candidate, jobVector }: { candidate: RecruiterCandidate; jobVector: number[] }) {
  const labels = [
    "Cognitive",
    "Behavioral",
    "Domain",
    "Career Hygiene",
    "Retention",
    "Role Alignment",
  ]

  const dot = labels.reduce((sum, _, index) => sum + ((candidate.studentVector[index] ?? 0) * (jobVector[index] ?? 0)), 0)
  const studentNorm = Math.sqrt(labels.reduce((sum, _, index) => sum + ((candidate.studentVector[index] ?? 0) ** 2), 0))
  const jobNorm = Math.sqrt(labels.reduce((sum, _, index) => sum + ((jobVector[index] ?? 0) ** 2), 0))
  const denom = studentNorm * jobNorm || 1

  const data = labels.map((label, index) => {
    const student = candidate.studentVector[index] ?? 0
    const job = jobVector[index] ?? 0
    const contribution = ((student * job) / denom) * 100

    return {
      subject: label,
      student,
      job,
      delta: student - job,
      contribution,
    }
  })

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.05)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 8, fontFamily: "var(--font-jetbrains)" }} />
          <RechartsTooltip content={<VectorContributionTooltip />} />
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

function CandidateDetailPanel({
  selectedCandidate,
  job,
  className,
}: {
  selectedCandidate: RecruiterCandidate
  job: RecruiterJob
  className?: string
}) {
  return (
    <Card className={`glass ${
      selectedCandidate.overallFit >= 85 ? "border-gold/30 glow-gold" : "border-cyan/20 glow-cyan"
    } ${className ?? ""}`}>
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

        <div className="rounded-xl border border-white/5 bg-surface/30 p-3">
          <p className="text-[9px] font-mono text-muted-foreground tracking-[0.15em] uppercase mb-2">VECTOR_ALIGNMENT</p>
          <VectorOverlapChart candidate={selectedCandidate} jobVector={job.jobVector} />
        </div>

        <MatchBreakdownTooltip candidate={selectedCandidate} jobTitle={job.title} />

        <div className="flex flex-col gap-2.5">
          <ScoreBar icon={Brain} label="COG" score={selectedCandidate.cognitiveFit} iconClass="text-cyan" scoreClass="text-cyan" />
          <ScoreBar icon={Heart} label="BEH" score={selectedCandidate.behavioralFit} iconClass="text-violet" scoreClass="text-violet" />
          <ScoreBar icon={Cpu} label="DOM" score={selectedCandidate.domainFit} iconClass="text-emerald" scoreClass="text-emerald" />
        </div>

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
  )
}

export function RecruiterDashboard() {
  const isMobile = useIsMobile()
  const [minFit, setMinFit] = useState([70])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<RecruiterCandidate | null>(null)
  const [job, setJob] = useState<RecruiterJob | null>(null)
  const [candidates, setCandidates] = useState<RecruiterCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [creatingJob, setCreatingJob] = useState(false)
  const [createMessage, setCreateMessage] = useState<string | null>(null)
  const [onboardingMessage, setOnboardingMessage] = useState<string | null>(null)
  const [jobForm, setJobForm] = useState<JobFormState>({
    title: "Junior Software Developer",
    company: "TechCorp Solutions",
    location: "Chennai, Tamil Nadu",
    employmentType: "Full-Time, On-site",
    salaryRange: "4.5 - 6.0 LPA",
    minFitScore: "70",
    minCareerHygieneScore: "60",
    jobVector: "70,65,60,65,70,60",
    logicalReasoning: "70",
    problemSolving: "65",
    analyticalThinking: "60",
    conscientiousness: "65",
    grit: "70",
    teamwork: "60",
    dataStructures: "75",
    webDevelopment: "70",
    databases: "65",
  })

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        const response = await fetchWithAuth(`/api/recruiter/dashboard?minFit=${minFit[0]}`)
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to load recruiter dashboard")
        }

        if (active) {
          setJob(payload.job)
          setCandidates(payload.candidates ?? [])
          setOnboardingMessage(
            payload?.onboarding?.sampleJobCreated
              ? "We created a sample job posting to get you started. You can replace it anytime."
              : null,
          )
          setSelectedCandidate((current) => {
            if (!current) return payload.candidates?.[0] ?? null
            return payload.candidates?.find((candidate: RecruiterCandidate) => candidate.id === current.id) ?? payload.candidates?.[0] ?? null
          })
          setErrorMessage(null)
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load recruiter dashboard")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [minFit])

  async function handleCreateJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreatingJob(true)
    setCreateMessage(null)
    setErrorMessage(null)

    try {
      const response = await fetchWithAuth("/api/recruiter/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: jobForm.title,
          company: jobForm.company,
          location: jobForm.location,
          employmentType: jobForm.employmentType,
          salaryRange: jobForm.salaryRange,
          minFitScore: Number(jobForm.minFitScore),
          minCareerHygieneScore: Number(jobForm.minCareerHygieneScore),
          jobVector: jobForm.jobVector.split(",").map((value) => Number(value.trim())),
          logicalReasoning: Number(jobForm.logicalReasoning),
          problemSolving: Number(jobForm.problemSolving),
          analyticalThinking: Number(jobForm.analyticalThinking),
          conscientiousness: Number(jobForm.conscientiousness),
          grit: Number(jobForm.grit),
          teamwork: Number(jobForm.teamwork),
          dataStructures: Number(jobForm.dataStructures),
          webDevelopment: Number(jobForm.webDevelopment),
          databases: Number(jobForm.databases),
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to create job posting")
      }

      setCreateMessage("Job posting created. Refreshing dashboard...")
      setOnboardingMessage(null)
      setLoading(true)
      const refresh = await fetchWithAuth(`/api/recruiter/dashboard?minFit=${minFit[0]}`)
      const refreshed = await refresh.json()
      if (!refresh.ok) {
        throw new Error(refreshed?.error || "Unable to refresh dashboard")
      }
      setJob(refreshed.job)
      setCandidates(refreshed.candidates ?? [])
      setSelectedCandidate(refreshed.candidates?.[0] ?? null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create job posting")
    } finally {
      setCreatingJob(false)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian relative flex items-center justify-center">
        <div className="absolute inset-0 bg-grid" />
        <p className="text-sm font-mono text-gold tracking-[0.1em]">LOADING_RECRUITER_VIEW...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-obsidian relative">
        <div className="absolute inset-0 bg-grid" />
        <div className="relative mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
          <Card className="glass mb-6">
            <CardHeader>
              <CardTitle className="font-mono tracking-[0.12em] text-sm uppercase">Create Job Posting</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateJob}>
                <Field label="Title" value={jobForm.title} onChange={(value) => setJobForm({ ...jobForm, title: value })} />
                <Field label="Company" value={jobForm.company} onChange={(value) => setJobForm({ ...jobForm, company: value })} />
                <Field label="Location" value={jobForm.location} onChange={(value) => setJobForm({ ...jobForm, location: value })} />
                <Field label="Employment Type" value={jobForm.employmentType} onChange={(value) => setJobForm({ ...jobForm, employmentType: value })} />
                <Field label="Salary Range" value={jobForm.salaryRange} onChange={(value) => setJobForm({ ...jobForm, salaryRange: value })} />
                <Field label="Min Fit Score" value={jobForm.minFitScore} onChange={(value) => setJobForm({ ...jobForm, minFitScore: value })} />
                <Field label="Min Career Hygiene" value={jobForm.minCareerHygieneScore} onChange={(value) => setJobForm({ ...jobForm, minCareerHygieneScore: value })} />
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground">Job Vector (6 comma-separated numbers)</label>
                  <Input value={jobForm.jobVector} onChange={(e) => setJobForm({ ...jobForm, jobVector: e.target.value })} />
                </div>
                <div className="md:col-span-2 grid gap-4 md:grid-cols-3">
                  <Field label="Logical Reasoning" value={jobForm.logicalReasoning} onChange={(value) => setJobForm({ ...jobForm, logicalReasoning: value })} />
                  <Field label="Problem Solving" value={jobForm.problemSolving} onChange={(value) => setJobForm({ ...jobForm, problemSolving: value })} />
                  <Field label="Analytical Thinking" value={jobForm.analyticalThinking} onChange={(value) => setJobForm({ ...jobForm, analyticalThinking: value })} />
                  <Field label="Conscientiousness" value={jobForm.conscientiousness} onChange={(value) => setJobForm({ ...jobForm, conscientiousness: value })} />
                  <Field label="Grit" value={jobForm.grit} onChange={(value) => setJobForm({ ...jobForm, grit: value })} />
                  <Field label="Teamwork" value={jobForm.teamwork} onChange={(value) => setJobForm({ ...jobForm, teamwork: value })} />
                  <Field label="Data Structures" value={jobForm.dataStructures} onChange={(value) => setJobForm({ ...jobForm, dataStructures: value })} />
                  <Field label="Web Development" value={jobForm.webDevelopment} onChange={(value) => setJobForm({ ...jobForm, webDevelopment: value })} />
                  <Field label="Databases" value={jobForm.databases} onChange={(value) => setJobForm({ ...jobForm, databases: value })} />
                </div>
                <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
                  <div>
                    {errorMessage && <p className="text-xs font-mono text-destructive">{errorMessage}</p>}
                    {createMessage && <p className="text-xs font-mono text-emerald">{createMessage}</p>}
                  </div>
                  <Button type="submit" className="bg-cyan text-cyan-foreground hover:bg-cyan/90 font-mono tracking-[0.1em] text-xs" disabled={creatingJob}>
                    {creatingJob ? "Creating..." : "Create Job"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <p className="text-xs font-mono text-muted-foreground">No recruiter job posting is configured yet. Create one above to start cosine matching.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const filtered = candidates
    .filter((c) => c.overallFit >= minFit[0])
    .sort((a, b) => b.overallFit - a.overallFit)

  const handleCandidateSelect = (candidate: RecruiterCandidate) => {
    setSelectedCandidate(candidate)
    if (isMobile) {
      setMobileDetailOpen(true)
    }
  }

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

        {onboardingMessage && (
          <Card className="glass border-emerald/30 mb-5">
            <CardContent className="p-3 md:p-4">
              <p className="text-[11px] font-mono text-emerald tracking-[0.08em]">{onboardingMessage}</p>
            </CardContent>
          </Card>
        )}

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
                <CandidateMatchCard candidate={candidate} rank={idx + 1} isSelected={selectedCandidate?.id === candidate.id} onClick={() => handleCandidateSelect(candidate)} />
              </motion.div>
            ))}

            {isMobile && selectedCandidate && filtered.length > 0 && (
              <Button
                variant="outline"
                className="mt-2 border-cyan/30 text-cyan hover:bg-cyan/10 font-mono tracking-[0.1em] text-xs"
                onClick={() => setMobileDetailOpen(true)}
              >
                Open Candidate Analysis: {selectedCandidate.name}
              </Button>
            )}

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
          <div className="hidden lg:block lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedCandidate ? (
                <motion.div key={selectedCandidate.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                  <CandidateDetailPanel selectedCandidate={selectedCandidate} job={job} className="sticky top-20" />
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

        <Drawer open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
          <DrawerContent className="bg-obsidian border-white/10">
            <DrawerHeader>
              <DrawerTitle className="font-mono text-xs tracking-[0.15em] uppercase text-cyan">Candidate Analysis</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2 overflow-y-auto">
              {selectedCandidate ? (
                <CandidateDetailPanel selectedCandidate={selectedCandidate} job={job} className="border-white/10" />
              ) : (
                <Card className="glass">
                  <CardContent className="py-8 text-center text-xs font-mono text-muted-foreground">
                    Select a candidate from the list to view analysis.
                  </CardContent>
                </Card>
              )}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" className="font-mono tracking-[0.1em] text-xs">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground">{label}</label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
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
