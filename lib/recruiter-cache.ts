type RecruiterJobRecord = {
  id: string
  recruiterId: string
  title: string
  company: string
  location: string
  employment_type: string
  salary_range: string
  requirements: Record<string, unknown>
  job_vector: [number, number, number, number, number, number]
  min_fit_score: number
  min_career_hygiene_score: number
  is_active: boolean
  created_at: string
}

type RecruiterCacheStore = {
  jobs: Map<string, RecruiterJobRecord>
}

declare global {
  // eslint-disable-next-line no-var
  var __engineerfitRecruiterCache: RecruiterCacheStore | undefined
}

function getStore() {
  if (!globalThis.__engineerfitRecruiterCache) {
    globalThis.__engineerfitRecruiterCache = {
      jobs: new Map(),
    }
  }

  return globalThis.__engineerfitRecruiterCache
}

function createDefaultJob(recruiterId: string): RecruiterJobRecord {
  return {
    id: `job_${recruiterId}_${Date.now()}`,
    recruiterId,
    title: "Junior Software Developer",
    company: "TechCorp Solutions",
    location: "Chennai, Tamil Nadu",
    employment_type: "Full-Time, On-site",
    salary_range: "4.5 - 6.0 LPA",
    requirements: {
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
    },
    job_vector: [70, 65, 60, 65, 70, 60],
    min_fit_score: 70,
    min_career_hygiene_score: 60,
    is_active: true,
    created_at: new Date().toISOString(),
  }
}

export function getRecruiterJob(recruiterId: string) {
  return getStore().jobs.get(recruiterId) ?? null
}

export function seedRecruiterJob(recruiterId: string) {
  const existing = getRecruiterJob(recruiterId)
  if (existing) {
    return existing
  }

  const job = createDefaultJob(recruiterId)
  getStore().jobs.set(recruiterId, job)
  return job
}

export function saveRecruiterJob(input: Omit<RecruiterJobRecord, "created_at"> & { createdAt?: string }) {
  const job: RecruiterJobRecord = {
    ...input,
    created_at: input.createdAt ?? new Date().toISOString(),
  }

  getStore().jobs.set(input.recruiterId, job)
  return job
}