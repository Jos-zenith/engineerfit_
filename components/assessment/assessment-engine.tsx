"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useI18n } from "@/lib/i18n"
import { type Confidence, type EngineeringDiscipline, type PublicAssessmentQuestion, type QuestionCategory } from "@/lib/assessment-bank"
import { fetchWithAuth } from "@/lib/auth-fetch"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, Heart, Cpu, ChevronRight, CheckCircle2, Terminal, Scan, RotateCcw, Play } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Answer {
  questionId: number
  selectedIndex: number
  confidence: Confidence
  timeSpent: number
}

interface SessionPayload {
  sessionId: string
  theta: number
  answeredCount: number
  totalQuestions: number
  categoryTotals?: {
    cognitive: number
    behavioral: number
    domain: number
    total: number
  }
  elapsedSeconds?: number
  resumable?: boolean
  question?: PublicAssessmentQuestion
  completed?: boolean
  error?: string
}

interface ResumePromptState {
  sessionId: string
  answeredCount: number
  totalQuestions: number
  elapsedSeconds: number
}

const TOTAL_TIME = 30 * 60

const disciplineOptions: Array<{ value: EngineeringDiscipline; label: string; description: string }> = [
  { value: "cs", label: "Computer Science", description: "Algorithms, systems, databases, distributed computing" },
  { value: "mechanical", label: "Mechanical", description: "Thermodynamics, mechanics, machine design" },
  { value: "eee_ece", label: "EEE / ECE", description: "Circuits, electronics, signals, communication" },
  { value: "civil", label: "Civil", description: "Structures, materials, surveying, construction" },
]

const categoryConfig: Record<QuestionCategory, { icon: typeof Brain; label: string; badgeClass: string; glowClass: string; accentClass: string }> = {
  cognitive: { icon: Brain, label: "assessment.cognitive", badgeClass: "text-cyan bg-cyan/10 border-cyan/30", glowClass: "glow-cyan", accentClass: "text-cyan" },
  behavioral: { icon: Heart, label: "assessment.behavioral", badgeClass: "text-violet bg-violet/10 border-violet/30", glowClass: "glow-violet", accentClass: "text-violet" },
  domain: { icon: Cpu, label: "assessment.domain", badgeClass: "text-emerald bg-emerald/10 border-emerald/30", glowClass: "glow-emerald", accentClass: "text-emerald" },
}

export function AssessmentEngine() {
  const { language, setLanguage, t } = useI18n()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [selectedDiscipline, setSelectedDiscipline] = useState<EngineeringDiscipline | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<PublicAssessmentQuestion | null>(null)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [categoryTotals, setCategoryTotals] = useState({ cognitive: 0, behavioral: 0, domain: 0, total: 0 })
  const [thetaEstimate, setThetaEstimate] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<Confidence | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [resumePrompt, setResumePrompt] = useState<ResumePromptState | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDataPulse, setShowDataPulse] = useState(false)

  useEffect(() => {
    if (!selectedDiscipline) {
      return
    }

    if (status === "loading") {
      return
    }

    // Redirect to auth if not authenticated
    if (status === "unauthenticated") {
      setErrorMessage("Please login to start your assessment.")
      router.push("/auth")
      return
    }

    let active = true

    async function startSession() {
      setIsLoading(true)
      try {
        const probeResponse = await fetchWithAuth("/api/assessment/session/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ probeOnly: true, discipline: selectedDiscipline }),
        })

        if (!probeResponse.ok) {
          let probePayload: any = {}
          try {
            probePayload = await probeResponse.json()
          } catch (e) {
            // Response is not JSON, use generic error
          }
          throw new Error(probePayload.error || "Unable to check active assessment session")
        }

        const probePayload: SessionPayload = await probeResponse.json()

        if (probePayload.resumable && probePayload.answeredCount > 0) {
          if (active) {
            setResumePrompt({
              sessionId: probePayload.sessionId,
              answeredCount: probePayload.answeredCount,
              totalQuestions: probePayload.totalQuestions,
              elapsedSeconds: probePayload.elapsedSeconds ?? 0,
            })
            if (probePayload.categoryTotals) {
              setCategoryTotals(probePayload.categoryTotals)
            }
            setErrorMessage(null)
          }
          return
        }

        const response = await fetchWithAuth("/api/assessment/session/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ discipline: selectedDiscipline }),
        })

        if (!response.ok) {
          let payload: any = {}
          try {
            payload = await response.json()
          } catch (e) {
            // Response is not JSON, use generic error
          }
          throw new Error(formatApiError(payload))
        }

        const payload: SessionPayload = await response.json()

        if (active) {
          if (payload.completed) {
            setIsCompleted(true)
          }

          setResumePrompt(null)
          setSessionId(payload.sessionId)
          setCurrentQuestion(payload.question ?? null)
          setAnsweredCount(payload.answeredCount)
          setTotalQuestions(payload.totalQuestions)
          if (payload.categoryTotals) {
            setCategoryTotals(payload.categoryTotals)
          }
          setThetaEstimate(payload.theta)
          setTimeRemaining(Math.max(0, TOTAL_TIME - (payload.elapsedSeconds ?? 0)))
          setQuestionStartTime(Date.now())
          setErrorMessage(null)
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to start adaptive assessment")
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void startSession()

    return () => {
      active = false
    }
  }, [router, selectedDiscipline, status])

  const progress = totalQuestions ? (answeredCount / totalQuestions) * 100 : 0
  const catConfig = categoryConfig[currentQuestion?.category ?? "cognitive"]
  const CatIcon = catConfig.icon

  useEffect(() => {
    if (isCompleted || !currentQuestion) return
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const formatApiError = (payload: any) => {
    if (!payload) return "Unknown API error"
    if (typeof payload.error === "string") {
      let message = payload.error
      if (payload.code) message += ` (${payload.code})`
      if (payload.details) {
        const detailsText = typeof payload.details === "string" ? payload.details : JSON.stringify(payload.details)
        message += `: ${detailsText}`
      }
      return message
    }
    return JSON.stringify(payload)
  }

  const handleResumeChoice = useCallback(async (mode: "resume" | "restart") => {
    if (!selectedDiscipline) {
      setErrorMessage("Select your engineering discipline before continuing.")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetchWithAuth("/api/assessment/session/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mode === "restart" ? { restart: true, discipline: selectedDiscipline } : { discipline: selectedDiscipline }),
      })

      if (!response.ok) {
        let payload: any = {}
        try {
          payload = await response.json()
        } catch (e) {
          // Response is not JSON, use generic error
        }
        throw new Error(formatApiError(payload))
      }

      const payload: SessionPayload = await response.json()

      if (payload.completed) {
        setIsCompleted(true)
      }

      setResumePrompt(null)
      setSessionId(payload.sessionId)
      setCurrentQuestion(payload.question ?? null)
      setAnsweredCount(payload.answeredCount)
      setTotalQuestions(payload.totalQuestions)
      if (payload.categoryTotals) {
        setCategoryTotals(payload.categoryTotals)
      }
      setThetaEstimate(payload.theta)
      setTimeRemaining(Math.max(0, TOTAL_TIME - (payload.elapsedSeconds ?? 0)))
      setQuestionStartTime(Date.now())
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load assessment session")
    } finally {
      setIsLoading(false)
    }
  }, [selectedDiscipline])

  const submitAssessment = useCallback(async () => {
    if (!sessionId) {
      setErrorMessage("Adaptive assessment session missing")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetchWithAuth("/api/assessment/session/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        let payload: any = {}
        try {
          payload = await response.json()
        } catch (e) {
          // Response is not JSON, use generic error
        }
        throw new Error(payload?.error || "Unable to submit assessment")
      }

      const payload = await response.json()

      setIsCompleted(true)
      if (payload?.scores?.irtTheta !== undefined) {
        setThetaEstimate(Number(payload.scores.irtTheta))
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to submit assessment")
    } finally {
      setIsSubmitting(false)
    }
  }, [sessionId])

  const handleAutoSubmit = useCallback(() => {
    void submitAssessment()
  }, [submitAssessment])

  const handleNext = () => {
    if (selectedOption === null || confidence === null || !currentQuestion || !sessionId) return

    // Show data packet animation
    setShowDataPulse(true)
    setTimeout(() => setShowDataPulse(false), 900)

    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedIndex: selectedOption,
      confidence,
      timeSpent: (Date.now() - questionStartTime) / 1000,
    }

    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    setIsSubmitting(true)
    setErrorMessage(null)

    setTimeout(async () => {
      try {
        const response = await fetchWithAuth("/api/assessment/session/answer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            questionId: currentQuestion.id,
            selectedIndex: selectedOption,
            confidence,
            discipline: selectedDiscipline,
            timeSpent: answer.timeSpent,
          }),
        })

        if (!response.ok) {
          let payload: any = {}
          try {
            payload = await response.json()
          } catch (e) {
            // Response is not JSON, use generic error
          }
          throw new Error(formatApiError(payload))
        }

        const payload = await response.json()

        if (payload.completed) {
          if (payload?.scores?.irtTheta !== undefined) {
            setThetaEstimate(Number(payload.scores.irtTheta))
          }
          setAnsweredCount(totalQuestions || newAnswers.length)
          setIsCompleted(true)
          return
        }

        setCurrentQuestion(payload.question)
        setAnsweredCount(payload.answeredCount)
        setTotalQuestions(payload.totalQuestions)
        if (payload.categoryTotals) {
          setCategoryTotals(payload.categoryTotals)
        }
        setThetaEstimate(Number(payload.theta || 0))
        setSelectedOption(null)
        setConfidence(null)
        setQuestionStartTime(Date.now())
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to process adaptive answer")
      } finally {
        setIsSubmitting(false)
      }
    }, 250)
  }

  if (!selectedDiscipline) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center relative">
        <div className="absolute inset-0 bg-grid" />
        <Card className="relative glass max-w-2xl w-full mx-4 glow-cyan">
          <CardContent className="p-6 md:p-8">
            <p className="text-[10px] font-mono text-cyan tracking-[0.2em] uppercase">Initialize Assessment Profile</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground font-mono tracking-tight">Select Your Engineering Discipline</h2>
            <p className="mt-2 text-xs text-muted-foreground font-mono">Domain-adaptive questions will align with your selected branch.</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {disciplineOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="rounded-xl border border-white/10 bg-surface/40 p-4 text-left transition-all hover:border-cyan/40 hover:bg-cyan/5"
                  onClick={() => {
                    setSelectedDiscipline(option.value)
                    setErrorMessage(null)
                  }}
                >
                  <p className="text-xs font-mono tracking-[0.12em] uppercase text-cyan">{option.label}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center relative">
        <div className="absolute inset-0 bg-grid" />
        <p className="text-sm font-mono text-cyan tracking-[0.12em]">LOADING_QUESTIONS...</p>
      </div>
    )
  }

  if (!currentQuestion && !isCompleted) {
    if (resumePrompt) {
      return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center relative">
          <div className="absolute inset-0 bg-grid" />
          <Card className="relative glass max-w-lg w-full mx-4 glow-cyan">
            <CardContent className="p-6 md:p-8">
              <p className="text-[10px] font-mono text-cyan tracking-[0.18em] uppercase">Assessment Resume Detected</p>
              <h2 className="mt-2 text-lg font-semibold text-foreground font-mono tracking-tight">
                Resume from Q{resumePrompt.answeredCount + 1}
              </h2>
              <p className="mt-2 text-xs text-muted-foreground font-mono">
                {resumePrompt.answeredCount}/{resumePrompt.totalQuestions} answered. Time elapsed: {formatTime(resumePrompt.elapsedSeconds)}.
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground font-mono tracking-[0.08em]">Session auto-expires after 48 hours.</p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button className="flex-1 bg-cyan text-cyan-foreground hover:bg-cyan/90 font-mono tracking-[0.1em] text-xs" onClick={() => void handleResumeChoice("resume")}>
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Resume Assessment
                </Button>
                <Button variant="outline" className="flex-1 border-white/10 font-mono tracking-[0.1em] text-xs" onClick={() => void handleResumeChoice("restart")}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Restart Fresh
                </Button>
              </div>
              {errorMessage && <p className="mt-3 text-[10px] font-mono text-destructive tracking-[0.08em]">{errorMessage}</p>}
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center relative">
        <div className="absolute inset-0 bg-grid" />
        <div className="text-center px-4">
          <p className="text-sm font-mono text-destructive tracking-[0.08em]">{errorMessage || "No questions available."}</p>
          <Button className="mt-4" onClick={() => router.push("/auth")}>Go To Login</Button>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center relative">
        <div className="absolute inset-0 bg-grid" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-2xl px-4 py-16 text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald/30 bg-emerald/10 glow-emerald-strong">
            <CheckCircle2 className="h-10 w-10 text-emerald" />
          </div>
          <h2 className="text-2xl font-bold text-foreground md:text-3xl font-mono tracking-tight">SCAN_COMPLETE</h2>
          <p className="mt-3 text-sm text-muted-foreground font-mono">
            {answers.length}/{Math.max(totalQuestions, answers.length)} adaptive packets transmitted successfully.
          </p>
          <p className="mt-2 text-xs text-cyan font-mono">FINAL_ABILITY_THETA: {thetaEstimate.toFixed(2)}</p>
          <div className="mt-8">
            <Button
              size="lg"
              className="h-12 bg-cyan text-cyan-foreground hover:bg-cyan/90 px-8 min-w-[240px] glow-cyan-strong font-mono tracking-[0.1em]"
              onClick={() => router.push("/dashboard")}
            >
              View Persona Vector
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!currentQuestion) {
    return null
  }

  const questionText =
    currentQuestion.category === "domain"
      ? currentQuestion.text.en
      : currentQuestion.text[language]

  const getOptionText = (opt: { en: string; ta: string }) =>
    currentQuestion.category === "domain" ? opt.en : opt[language]

  return (
    <div className="min-h-screen bg-obsidian relative">
      <div className="absolute inset-0 bg-grid" />

      <div className="relative mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* Terminal Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="h-4 w-4 text-cyan" />
              <span className="text-[10px] font-mono text-cyan tracking-[0.2em] uppercase">{t("assessment.title")}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground md:text-2xl font-mono tracking-tight">
                {t("assessment.question")}_{String(answeredCount + 1).padStart(2, "0")}
              </h1>
              <span className="text-xs text-muted-foreground font-mono">/{totalQuestions}</span>
            </div>
            <p className="mt-1 text-[10px] font-mono text-cyan">theta={thetaEstimate.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* System Mode Language Switch */}
            {currentQuestion.category !== "domain" && (
              <button
                onClick={() => setLanguage(language === "en" ? "ta" : "en")}
                className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 hover:border-cyan/30 transition-colors"
              >
                <span className="text-[9px] font-mono text-muted-foreground tracking-[0.15em]">SYS:LANG</span>
                <span className="text-[10px] font-mono font-bold text-cyan">{language === "en" ? "EN" : "TA"}</span>
              </button>
            )}
            <div className={`flex items-center gap-2 rounded-md border px-3 py-1.5 ${timeRemaining < 300 ? "border-destructive/40 bg-destructive/5" : "border-white/10"}`}>
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={`text-xs font-mono font-bold tracking-wider ${timeRemaining < 300 ? "text-destructive" : "text-foreground"}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Glowing Progress Bar */}
        <div className="mb-8">
          <div className="h-1 w-full rounded-full bg-surface overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-cyan"
              style={{ boxShadow: "0 0 12px rgba(34, 211, 238, 0.5), 0 0 30px rgba(34, 211, 238, 0.2)" }}
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[9px] text-muted-foreground font-mono tracking-[0.15em] uppercase">
            <span className="text-cyan/60">Cognitive [{categoryTotals.cognitive}]</span>
            <span className="text-violet/60">Behavioral [{categoryTotals.behavioral}]</span>
            <span className="text-emerald/60">Domain [{categoryTotals.domain}]</span>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`glass ${catConfig.glowClass}`}>
              <CardContent className="p-6 md:p-8">
                {/* Category + Difficulty header */}
                <div className="mb-6 flex items-center justify-between">
                  <Badge className={`gap-1.5 border ${catConfig.badgeClass} font-mono tracking-[0.15em] text-[10px]`}>
                    <CatIcon className="h-3.5 w-3.5" />
                    {t(catConfig.label)}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize font-mono tracking-[0.1em] border-white/10 text-muted-foreground">
                      {currentQuestion.difficulty}
                    </Badge>
                    {/* Data pulse indicator */}
                    <AnimatePresence>
                      {showDataPulse && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="flex items-center gap-1"
                        >
                          <Scan className="h-3.5 w-3.5 text-cyan animate-pulse" />
                          <span className="text-[9px] font-mono text-cyan tracking-wider">TRANSMITTING...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Question */}
                <h2 className="text-base font-semibold leading-relaxed text-foreground md:text-lg tracking-tight">
                  {questionText}
                </h2>

                {/* Options */}
                <div className="mt-8 flex flex-col gap-3">
                  {currentQuestion.options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => setSelectedOption(idx)}
                      className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all min-h-[52px] ${
                        selectedOption === idx
                          ? "border-cyan/40 bg-cyan/5 glow-cyan"
                          : "border-white/5 bg-surface/50 hover:border-white/10 hover:bg-surface"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold font-mono ${
                          selectedOption === idx
                            ? "bg-cyan text-cyan-foreground"
                            : "bg-secondary text-secondary-foreground border border-white/10"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm text-foreground">
                        {getOptionText(opt)}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Confidence Level - Custom component, not radio buttons */}
                <div className="mt-8">
                  <p className="mb-3 text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase">
                    {t("assessment.confidence")}
                  </p>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as Confidence[]).map((level) => (
                      <button
                        key={level}
                        className={`flex-1 h-11 rounded-lg border text-xs capitalize font-mono tracking-[0.1em] transition-all ${
                          confidence === level
                            ? level === "low"
                              ? "bg-destructive/10 text-destructive border-destructive/30 glow-cyan"
                              : level === "medium"
                              ? "bg-gold/10 text-gold border-gold/30 glow-gold"
                              : "bg-emerald/10 text-emerald border-emerald/30 glow-emerald"
                            : "border-white/5 text-muted-foreground hover:border-white/10 hover:text-foreground bg-surface/30"
                        }`}
                        onClick={() => setConfidence(level)}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span>{t(`assessment.${level}`)}</span>
                          <div className="flex gap-0.5">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className={`h-1 w-3 rounded-full ${
                                  confidence === level
                                    ? i <= (level === "low" ? 0 : level === "medium" ? 1 : 2)
                                      ? level === "low"
                                        ? "bg-destructive"
                                        : level === "medium"
                                        ? "bg-gold"
                                        : "bg-emerald"
                                      : "bg-white/10"
                                    : i <= (level === "low" ? 0 : level === "medium" ? 1 : 2)
                                    ? "bg-white/20"
                                    : "bg-white/5"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next / Submit */}
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-muted-foreground/60 tracking-wider">
                    PACKET_{String(answeredCount + 1).padStart(2, "0")}_OF_{String(totalQuestions).padStart(2, "0")}
                  </span>
                  <Button
                    size="lg"
                    disabled={selectedOption === null || confidence === null || isSubmitting}
                    onClick={handleNext}
                    className="h-11 gap-2 bg-cyan text-cyan-foreground hover:bg-cyan/90 px-6 min-w-[180px] glow-cyan-strong font-mono tracking-[0.1em] text-xs disabled:opacity-30 disabled:shadow-none"
                  >
                    {answeredCount === totalQuestions - 1
                      ? t("assessment.submit")
                      : t("assessment.next")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                {errorMessage && (
                  <p className="mt-3 text-[10px] font-mono text-destructive tracking-[0.08em]">{errorMessage}</p>
                )}
                {isSubmitting && (
                  <p className="mt-3 text-[10px] font-mono text-cyan tracking-[0.08em]">SUBMITTING_RESULTS...</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
