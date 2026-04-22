import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { getRoleRecommendations } from "@/lib/scoring"

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, "student")
  if (auth.error || !auth.user || !auth.supabase) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile, error: profileError } = await auth.supabase
    .from("profiles")
    .select("full_name")
    .eq("id", auth.user.id)
    .single()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const { data: attempt, error: attemptError } = await auth.supabase
    .from("assessment_attempts")
    .select("cognitive_score, behavioral_score, domain_score, role_alignment_score, career_hygiene_score, retention_prediction, overall_score")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (attemptError) {
    return NextResponse.json({ error: attemptError.message }, { status: 500 })
  }

  if (!attempt) {
    return NextResponse.json({ profile: null })
  }

  const recommendations = getRoleRecommendations({
    overallScore: attempt.overall_score,
    domainScore: attempt.domain_score,
    behavioralScore: attempt.behavioral_score,
    retentionPrediction: attempt.retention_prediction,
  })

  return NextResponse.json({
    profile: {
      name: profile.full_name || auth.user.email || "Student",
      college: "Add profile college",
      branch: "Engineering",
      year: new Date().getFullYear(),
      cgpa: 0,
      careerHygieneScore: attempt.career_hygiene_score,
      cognitiveScore: attempt.cognitive_score,
      behavioralScore: attempt.behavioral_score,
      domainScore: attempt.domain_score,
      roleAlignmentScore: attempt.role_alignment_score,
      retentionPrediction: attempt.retention_prediction,
      personaVector: [
        { subject: "Logical Reasoning", score: attempt.cognitive_score, fullMark: 100 },
        { subject: "Problem Solving", score: Math.max(0, attempt.cognitive_score - 6), fullMark: 100 },
        { subject: "Conscientiousness", score: attempt.behavioral_score, fullMark: 100 },
        { subject: "Grit", score: Math.min(100, attempt.behavioral_score + 4), fullMark: 100 },
        { subject: "Teamwork", score: Math.max(0, attempt.behavioral_score - 8), fullMark: 100 },
        { subject: "Technical Skills", score: attempt.domain_score, fullMark: 100 },
        { subject: "Communication", score: Math.max(0, attempt.behavioral_score - 10), fullMark: 100 },
        { subject: "Learning Agility", score: Math.min(100, attempt.cognitive_score + 8), fullMark: 100 },
      ],
      riasec: [
        { code: "I", label: "Investigative", score: Math.min(100, attempt.domain_score + 5) },
        { code: "R", label: "Realistic", score: Math.max(0, attempt.domain_score - 10) },
        { code: "C", label: "Conventional", score: Math.round((attempt.behavioral_score + attempt.domain_score) / 2) },
        { code: "A", label: "Artistic", score: Math.max(0, attempt.behavioral_score - 25) },
        { code: "S", label: "Social", score: Math.max(0, attempt.behavioral_score - 12) },
        { code: "E", label: "Enterprising", score: Math.round((attempt.behavioral_score + attempt.cognitive_score) / 2) },
      ],
      topStrengths: ["Logical Reasoning", "Learning Agility", "Technical Skills"],
      developmentAreas: ["Communication", "Teamwork", "Conscientiousness"],
      recommendedRoles: recommendations,
    },
  })
}
