import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { getRoleRecommendations } from "@/lib/scoring"

function formatDimensionLabel(dimension: string) {
  if (dimension === "roleAlignment") {
    return "Role Alignment"
  }

  return `${dimension.charAt(0).toUpperCase()}${dimension.slice(1)}`
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, "student")
  if (auth.error || !auth.user) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { name: true },
  })

  const attempt = await prisma.assessmentAttempt.findFirst({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
  })

  if (!attempt) {
    return NextResponse.json({ profile: null })
  }

  const explanation = attempt.explanation ? JSON.parse(attempt.explanation) : {}
  const strongestDimensions = Array.isArray(explanation?.strongestDimensions) ? explanation.strongestDimensions : []
  const riskDimensions = Array.isArray(explanation?.riskDimensions) ? explanation.riskDimensions : []

  const recommendations = getRoleRecommendations({
    cognitiveScore: attempt.cognitive_score ?? 0,
    roleAlignmentScore: attempt.role_alignment_score ?? 0,
    overallScore: attempt.overall_score ?? 0,
    domainScore: attempt.domain_score ?? 0,
    behavioralScore: attempt.behavioral_score ?? 0,
    retentionPrediction: attempt.retention_prediction ?? 0,
  })

  return NextResponse.json({
    profile: {
      name: profile?.name || auth.user.email || "Student",
      college: "Add profile college",
      branch: "Engineering",
      year: new Date().getFullYear(),
      cgpa: 0,
      careerHygieneScore: attempt.career_hygiene_score ?? 0,
      cognitiveScore: attempt.cognitive_score ?? 0,
      behavioralScore: attempt.behavioral_score ?? 0,
      domainScore: attempt.domain_score ?? 0,
      roleAlignmentScore: attempt.role_alignment_score ?? 0,
      retentionPrediction: attempt.retention_prediction ?? 0,
      personaVector: [
        { subject: "Logical Reasoning", score: attempt.cognitive_score ?? 0, fullMark: 100 },
        { subject: "Problem Solving", score: Math.max(0, (attempt.cognitive_score ?? 0) - 6), fullMark: 100 },
        { subject: "Conscientiousness", score: attempt.behavioral_score ?? 0, fullMark: 100 },
        { subject: "Grit", score: Math.min(100, (attempt.behavioral_score ?? 0) + 4), fullMark: 100 },
        { subject: "Teamwork", score: Math.max(0, (attempt.behavioral_score ?? 0) - 8), fullMark: 100 },
        { subject: "Technical Skills", score: attempt.domain_score ?? 0, fullMark: 100 },
        { subject: "Communication", score: Math.max(0, (attempt.behavioral_score ?? 0) - 10), fullMark: 100 },
        { subject: "Learning Agility", score: Math.min(100, (attempt.cognitive_score ?? 0) + 8), fullMark: 100 },
      ],
      riasec: [
        { code: "I", label: "Investigative", score: Math.min(100, (attempt.domain_score ?? 0) + 5) },
        { code: "R", label: "Realistic", score: Math.max(0, (attempt.domain_score ?? 0) - 10) },
        { code: "C", label: "Conventional", score: Math.round(((attempt.behavioral_score ?? 0) + (attempt.domain_score ?? 0)) / 2) },
        { code: "A", label: "Artistic", score: Math.max(0, (attempt.behavioral_score ?? 0) - 25) },
        { code: "S", label: "Social", score: Math.max(0, (attempt.behavioral_score ?? 0) - 12) },
        { code: "E", label: "Enterprising", score: Math.round(((attempt.behavioral_score ?? 0) + (attempt.cognitive_score ?? 0)) / 2) },
      ],
      topStrengths: strongestDimensions.length
        ? strongestDimensions.map((item: { dimension: string; score: number }) => `${formatDimensionLabel(item.dimension)} (${item.score})`)
        : ["Logical Reasoning", "Learning Agility", "Technical Skills"],
      developmentAreas: riskDimensions.length
        ? riskDimensions.map((item: { dimension: string; score: number }) => `${formatDimensionLabel(item.dimension)} (${item.score})`)
        : ["Communication", "Teamwork", "Conscientiousness"],
      explanation: attempt.explanation ? JSON.parse(attempt.explanation) : null,
      recommendedRoles: recommendations,
    },
  })
}
