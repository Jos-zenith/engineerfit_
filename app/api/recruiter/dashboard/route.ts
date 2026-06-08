import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { mockCandidates } from "@/lib/mock-data"
import { prisma } from "@/lib/prisma"
import { cosineSimilarityPercent } from "@/lib/matching"
import { getRecruiterJob, saveRecruiterJob, seedRecruiterJob } from "@/lib/recruiter-cache"

type JobVector = [number, number, number, number, number, number]

function average(values: unknown) {
  if (!Array.isArray(values) || !values.length) {
    return 0
  }

  const numbers = values.map((value) => Number(value)).filter((value) => Number.isFinite(value))
  if (!numbers.length) {
    return 0
  }

  return Math.round(numbers.reduce((sum, value) => sum + value, 0) / numbers.length)
}

function deriveJobVector(job: {
  requirements: Record<string, unknown>
  min_career_hygiene_score: number
  min_fit_score: number
  job_vector?: unknown
}): JobVector {
  if (Array.isArray(job.job_vector) && job.job_vector.length === 6) {
    return job.job_vector.map((value) => Number(value)) as JobVector
  }

  const requirements = job.requirements ?? {}
  const cognitive = average((requirements as any).cognitive ? Object.values((requirements as any).cognitive) : [])
  const behavioral = average((requirements as any).behavioral ? Object.values((requirements as any).behavioral) : [])
  const domain = average((requirements as any).domain ? Object.values((requirements as any).domain) : [])

  return [
    cognitive,
    behavioral,
    domain,
    job.min_career_hygiene_score,
    job.min_fit_score,
    Math.round((cognitive + behavioral + domain) / 3),
  ]
}

function deriveStudentVector(attempt: {
  cognitive_score: number
  behavioral_score: number
  domain_score: number
  career_hygiene_score: number
  retention_prediction: number
  role_alignment_score: number
}): [number, number, number, number, number, number] {
  return [
    attempt.cognitive_score,
    attempt.behavioral_score,
    attempt.domain_score,
    attempt.career_hygiene_score,
    attempt.retention_prediction,
    attempt.role_alignment_score,
  ]
}

function parseJobVector(value: unknown) {
  if (!Array.isArray(value) || value.length !== 6) {
    return null
  }

  const vector = value.map((entry) => Number(entry))
  return vector.every((entry) => Number.isFinite(entry)) ? vector : null
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, "recruiter")
  if (auth.error || !auth.user) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const minFit = Number(request.nextUrl.searchParams.get("minFit") || 70)

  const job = getRecruiterJob(auth.user.id) ?? seedRecruiterJob(auth.user.id)
  let sampleJobCreated = false

  if (!getRecruiterJob(auth.user.id)) {
    sampleJobCreated = true
  }

  const attempts = await prisma.assessmentAttempt.findMany({
    select: {
      userId: true,
      cognitive_score: true,
      behavioral_score: true,
      domain_score: true,
      career_hygiene_score: true,
      retention_prediction: true,
      role_alignment_score: true,
      overall_score: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const userIds = Array.from(new Set(attempts.map((item) => item.userId)))

  const profiles = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : []

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]))
  const jobVector = deriveJobVector(job)

  const liveCandidates = attempts.map((attempt, idx) => {
    const profile = profileById.get(attempt.userId)
    const studentVector = deriveStudentVector({
      cognitive_score: attempt.cognitive_score ?? 0,
      behavioral_score: attempt.behavioral_score ?? 0,
      domain_score: attempt.domain_score ?? 0,
      career_hygiene_score: attempt.career_hygiene_score ?? 0,
      retention_prediction: attempt.retention_prediction ?? 0,
      role_alignment_score: attempt.role_alignment_score ?? 0,
    })
    const overallFit = cosineSimilarityPercent(studentVector, jobVector)
    const initials = (profile?.name || profile?.email || "ST")
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    return {
      id: `STU-${String(idx + 1).padStart(3, "0")}`,
      name: profile?.name || profile?.email || "Student",
      college: "Unknown College",
      branch: "Engineering",
      cgpa: 0,
      overallFit,
      cognitiveFit: attempt.cognitive_score ?? 0,
      behavioralFit: attempt.behavioral_score ?? 0,
      domainFit: attempt.domain_score ?? 0,
      careerHygieneScore: attempt.career_hygiene_score ?? 0,
      retentionPrediction: attempt.retention_prediction ?? 0,
      topStrengths: ["Logical Reasoning", "Technical Skills", "Learning Agility"],
      avatar: initials,
      status: "applied" as const,
      studentVector,
    }
  })

  const fallbackCandidates = mockCandidates.map((candidate, idx) => ({
    ...candidate,
    id: candidate.id || `STU-${String(idx + 1).padStart(3, "0")}`,
    studentVector: [
      candidate.cognitiveFit,
      candidate.behavioralFit,
      candidate.domainFit,
      candidate.careerHygieneScore,
      candidate.retentionPrediction,
      Math.round((candidate.cognitiveFit + candidate.behavioralFit + candidate.domainFit) / 3),
    ],
  }))

  const candidates = (liveCandidates.length ? liveCandidates : fallbackCandidates)
    .filter((candidate) => candidate.overallFit >= minFit)
    .sort((a, b) => b.overallFit - a.overallFit)

  return NextResponse.json({
    job: {
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.employment_type,
      salary: job.salary_range,
      requirements: job.requirements,
      jobVector,
      minFitScore: job.min_fit_score,
      minCareerHygieneScore: job.min_career_hygiene_score,
    },
    candidates,
    onboarding: {
      sampleJobCreated,
    },
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, "recruiter")
  if (auth.error || !auth.user) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const title = typeof body?.title === "string" ? body.title.trim() : ""
  const company = typeof body?.company === "string" ? body.company.trim() : ""
  const location = typeof body?.location === "string" ? body.location.trim() : ""
  const employmentType = typeof body?.employmentType === "string" ? body.employmentType.trim() : ""
  const salaryRange = typeof body?.salaryRange === "string" ? body.salaryRange.trim() : ""
  const minFitScore = Number(body?.minFitScore ?? 70)
  const minCareerHygieneScore = Number(body?.minCareerHygieneScore ?? 60)
  const jobVector = parseJobVector(body?.jobVector)

  if (!title || !company || !location || !employmentType || !salaryRange || !jobVector) {
    return NextResponse.json({ error: "Missing required job fields" }, { status: 400 })
  }

  const requirements = {
    cognitive: {
      logicalReasoning: Number(body?.logicalReasoning ?? jobVector[0]),
      problemSolving: Number(body?.problemSolving ?? jobVector[1]),
      analyticalThinking: Number(body?.analyticalThinking ?? jobVector[5]),
    },
    behavioral: {
      conscientiousness: Number(body?.conscientiousness ?? jobVector[3]),
      grit: Number(body?.grit ?? jobVector[4]),
      teamwork: Number(body?.teamwork ?? jobVector[1]),
    },
    domain: {
      dataStructures: Number(body?.dataStructures ?? jobVector[2]),
      webDevelopment: Number(body?.webDevelopment ?? jobVector[5]),
      databases: Number(body?.databases ?? jobVector[2]),
    },
  }

  const savedJob = saveRecruiterJob({
    id: `job_${auth.user.id}_${Date.now()}`,
    recruiterId: auth.user.id,
    title,
    company,
    location,
    employment_type: employmentType,
    salary_range: salaryRange,
    requirements,
    job_vector: jobVector,
    min_fit_score: minFitScore,
    min_career_hygiene_score: minCareerHygieneScore,
    is_active: true,
  })

  return NextResponse.json({ created: true, jobId: savedJob.id })
}
