"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { assessmentQuestions, type Confidence, type QuestionCategory } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, Heart, Cpu, ChevronRight, CheckCircle2, Terminal, Scan } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Answer {
  questionId: number
  selectedIndex: number
  confidence: Confidence
  timeSpent: number
  correct: boolean
}

const TOTAL_TIME = 30 * 60

const categoryConfig: Record<QuestionCategory, { icon: typeof Brain; label: string; badgeClass: string; glowClass: string; accentClass: string }> = {
  cognitive: { icon: Brain, label: "assessment.cognitive", badgeClass: "text-cyan bg-cyan/10 border-cyan/30", glowClass: "glow-cyan", accentClass: "text-cyan" },
  behavioral: { icon: Heart, label: "assessment.behavioral", badgeClass: "text-violet bg-violet/10 border-violet/30", glowClass: "glow-violet", accentClass: "text-violet" },
  domain: { icon: Cpu, label: "assessment.domain", badgeClass: "text-emerald bg-emerald/10 border-emerald/30", glowClass: "glow-emerald", accentClass: "text-emerald" },
}

export function AssessmentEngine() {
  const { language, setLanguage, t } = useI18n()
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<Confidence | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [isCompleted, setIsCompleted] = useState(false)
  const [showDataPulse, setShowDataPulse] = useState(false)

  const currentQuestion = assessmentQuestions[currentIndex]
  const progress = ((currentIndex) / assessmentQuestions.length) * 100
  const catConfig = categoryConfig[currentQuestion.category]
  const CatIcon = catConfig.icon

  useEffect(() => {
    if (isCompleted) return
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

  const handleAutoSubmit = useCallback(() => {
    setIsCompleted(true)
  }, [])

  const handleNext = () => {
    if (selectedOption === null || confidence === null) return

    // Show data packet animation
    setShowDataPulse(true)
    setTimeout(() => setShowDataPulse(false), 900)

    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedIndex: selectedOption,
      confidence,
      timeSpent: (Date.now() - questionStartTime) / 1000,
      correct: selectedOption === currentQuestion.correctIndex,
    }

    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    if (currentIndex < assessmentQuestions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setSelectedOption(null)
        setConfidence(null)
        setQuestionStartTime(Date.now())
      }, 400)
    } else {
      const cogCorrect = newAnswers.filter((a) => {
        const q = assessmentQuestions.find((q) => q.id === a.questionId)
        return q?.category === "cognitive" && a.correct
      }).length
      const behCorrect = newAnswers.filter((a) => {
        const q = assessmentQuestions.find((q) => q.id === a.questionId)
        return q?.category === "behavioral" && a.correct
      }).length
      const domCorrect = newAnswers.filter((a) => {
        const q = assessmentQuestions.find((q) => q.id === a.questionId)
        return q?.category === "domain" && a.correct
      }).length

      const cogScore = Math.round((cogCorrect / 5) * 100)
      const behScore = Math.round((behCorrect / 5) * 100)
      const domScore = Math.round((domCorrect / 10) * 100)
      const overall = Math.round(cogScore * 0.3 + behScore * 0.3 + domScore * 0.4)

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "assessmentResult",
          JSON.stringify({ cogScore, behScore, domScore, overall, answers: newAnswers })
        )
      }
      setTimeout(() => setIsCompleted(true), 400)
    }
  }

  const questionText =
    currentQuestion.category === "domain"
      ? currentQuestion.text.en
      : currentQuestion.text[language]

  const getOptionText = (opt: { en: string; ta: string }) =>
    currentQuestion.category === "domain" ? opt.en : opt[language]

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
            {answers.length}/{assessmentQuestions.length} data packets transmitted successfully.
          </p>
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
                {t("assessment.question")}_{String(currentIndex + 1).padStart(2, "0")}
              </h1>
              <span className="text-xs text-muted-foreground font-mono">/{assessmentQuestions.length}</span>
            </div>
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
            <span className="text-cyan/60">Cognitive [5]</span>
            <span className="text-violet/60">Behavioral [5]</span>
            <span className="text-emerald/60">Domain [10]</span>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
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
                    PACKET_{String(currentIndex + 1).padStart(2, "0")}_OF_{String(assessmentQuestions.length).padStart(2, "0")}
                  </span>
                  <Button
                    size="lg"
                    disabled={selectedOption === null || confidence === null}
                    onClick={handleNext}
                    className="h-11 gap-2 bg-cyan text-cyan-foreground hover:bg-cyan/90 px-6 min-w-[180px] glow-cyan-strong font-mono tracking-[0.1em] text-xs disabled:opacity-30 disabled:shadow-none"
                  >
                    {currentIndex === assessmentQuestions.length - 1
                      ? t("assessment.submit")
                      : t("assessment.next")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
