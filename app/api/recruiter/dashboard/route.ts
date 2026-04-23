import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { cosineSimilarityPercent } from "@/lib/matching"

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
  if (auth.error || !auth.user || !auth.supabase) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const minFit = Number(request.nextUrl.searchParams.get("minFit") || 70)

  const { data: jobs, error: jobsError } = await auth.supabase
    .from("job_postings")
    .select("id, title, company, location, employment_type, salary_range, requirements, job_vector, min_fit_score, min_career_hygiene_score")
    .eq("recruiter_id", auth.user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)

  if (jobsError) {
    return NextResponse.json({ error: jobsError.message }, { status: 500 })
  }

  let job = jobs?.[0] ?? null
  let sampleJobCreated = false

  if (!job) {
    const sampleRequirements = {
      cognitive: {
        logicalReasoning: 70,
        problemSolving: 65,
        analyticalThinking: 60,
      },
      behavioral: {
        conscientiousness: 65,
        grit: 70,
        teamwork: 60,
      },
      domain: {
        dataStructures: 75,
        webDevelopment: 70,
        databases: 65,
      },
    }

    const { data: createdJob, error: createJobError } = await auth.supabase
      .from("job_postings")
      .insert({
        recruiter_id: auth.user.id,
        title: "Junior Software Developer",
        company: "TechCorp Solutions",
        location: "Chennai, Tamil Nadu",
        employment_type: "Full-Time, On-site",
        salary_range: "4.5 - 6.0 LPA",
        min_fit_score: 70,
        min_career_hygiene_score: 60,
        requirements: sampleRequirements,
        job_vector: [70, 65, 60, 65, 70, 60],
        is_active: true,
      })
      .select("id, title, company, location, employment_type, salary_range, requirements, job_vector, min_fit_score, min_career_hygiene_score")
      .single()

    if (createJobError) {
      return NextResponse.json({ error: createJobError.message }, { status: 500 })
    }

    job = createdJob
    sampleJobCreated = true
  }

  const { data: attempts, error: attemptsError } = await auth.supabase
    .from("assessment_attempts")
    .select("user_id, cognitive_score, behavioral_score, domain_score, career_hygiene_score, retention_prediction, role_alignment_score, overall_score")
    .limit(50)

  if (attemptsError) {
    return NextResponse.json({ error: attemptsError.message }, { status: 500 })
  }

  const userIds = Array.from(new Set((attempts ?? []).map((item) => item.user_id)))

  const { data: profiles, error: profilesError } = userIds.length
    ? await auth.supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [], error: null }

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 })
  }

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
  const jobVector = deriveJobVector(job)

  const candidates = (attempts ?? []).map((attempt, idx) => {
    const profile = profileById.get(attempt.user_id)
    const studentVector = deriveStudentVector(attempt)
    const overallFit = cosineSimilarityPercent(studentVector, jobVector)
    const initials = (profile?.full_name || "ST")
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

    return {
      id: `STU-${String(idx + 1).padStart(3, "0")}`,
      name: profile?.full_name || "Student",
      college: "Unknown College",
      branch: "Engineering",
      cgpa: 0,
      overallFit,
      cognitiveFit: attempt.cognitive_score,
      behavioralFit: attempt.behavioral_score,
      domainFit: attempt.domain_score,
      careerHygieneScore: attempt.career_hygiene_score,
      retentionPrediction: attempt.retention_prediction,
      topStrengths: ["Logical Reasoning", "Technical Skills", "Learning Agility"],
      avatar: initials,
      status: "applied" as const,
      studentVector,
    }
  }).filter((candidate) => candidate.overallFit >= minFit).sort((a, b) => b.overallFit - a.overallFit)

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
  if (auth.error || !auth.user || !auth.supabase) {
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

  const { data, error } = await auth.supabase
    .from("job_postings")
    .insert({
      recruiter_id: auth.user.id,
      title,
      company,
      location,
      employment_type: employmentType,
      salary_range: salaryRange,
      min_fit_score: minFitScore,
      min_career_hygiene_score: minCareerHygieneScore,
      requirements,
      job_vector: jobVector,
      is_active: true,
    })
    .select("id")
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Unable to create job posting" }, { status: 500 })
  }

  return NextResponse.json({ created: true, jobId: data.id })
}
