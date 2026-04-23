import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { getQuestionCountsByCategory, normalizeEngineeringDiscipline, toPublicQuestions } from "@/lib/assessment-bank"
import { selectMostInformativeQuestion } from "@/lib/irt"

function isMissingAssessmentSessionsTableError(message?: string) {
  if (!message) return false

  const normalized = message.toLowerCase()
  return (
    normalized.includes("could not find the table 'public.assessment_sessions' in the schema cache") ||
    normalized.includes('relation "assessment_sessions" does not exist') ||
    normalized.includes('relation "public.assessment_sessions" does not exist')
  )
}

function migrationRequiredResponse() {
  return NextResponse.json(
    {
      error:
        "Assessment tables are missing in Supabase. Apply migrations (or run supabase/schema.sql) so public.assessment_sessions exists.",
      code: "MIGRATION_REQUIRED",
    },
    { status: 503 }
  )
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, "student")
    if (auth.error || !auth.user || !auth.supabase) {
      return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const probeOnly = body?.probeOnly === true
    const restart = body?.restart === true
    const discipline = normalizeEngineeringDiscipline(body?.discipline)
    const counts = getQuestionCountsByCategory(discipline)
    const RESUME_WINDOW_SECONDS = 48 * 60 * 60

    const { data: existingSessions, error: sessionFetchError } = await auth.supabase
      .from("assessment_sessions")
      .select("id, theta, asked_question_ids, response_history, status, created_at")
      .eq("user_id", auth.user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10)

    if (sessionFetchError) {
      if (isMissingAssessmentSessionsTableError(sessionFetchError.message)) {
        return migrationRequiredResponse()
      }

      return NextResponse.json({ error: sessionFetchError.message }, { status: 500 })
    }

    const activeSessions = Array.isArray(existingSessions) ? existingSessions : []
    let activeSession: (typeof activeSessions)[number] | null = activeSessions[0] ?? null

    // Backfill safeguard: if duplicate active sessions exist, keep the newest and retire the rest.
    if (activeSessions.length > 1) {
      const duplicateIds = activeSessions.slice(1).map((session) => session.id)
      const { error: duplicateCleanupError } = await auth.supabase
        .from("assessment_sessions")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .in("id", duplicateIds)
        .eq("user_id", auth.user.id)

      if (duplicateCleanupError) {
        if (isMissingAssessmentSessionsTableError(duplicateCleanupError.message)) {
          return migrationRequiredResponse()
        }

        return NextResponse.json({ error: duplicateCleanupError.message }, { status: 500 })
      }
    }

    if (activeSession) {
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(activeSession.created_at).getTime()) / 1000))

      if (elapsedSeconds > RESUME_WINDOW_SECONDS) {
        const { error: staleSessionUpdateError } = await auth.supabase
          .from("assessment_sessions")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("id", activeSession.id)
          .eq("user_id", auth.user.id)

        if (staleSessionUpdateError) {
          if (isMissingAssessmentSessionsTableError(staleSessionUpdateError.message)) {
            return migrationRequiredResponse()
          }

          return NextResponse.json({ error: staleSessionUpdateError.message }, { status: 500 })
        }

        activeSession = null
      }
    }

    if (activeSession) {
      const askedIds = Array.isArray(activeSession.asked_question_ids) ? activeSession.asked_question_ids : []
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(activeSession.created_at).getTime()) / 1000))

      if (probeOnly && !restart) {
        return NextResponse.json({
          resumable: true,
          sessionId: activeSession.id,
          theta: Number(activeSession.theta || 0),
          answeredCount: askedIds.length,
          totalQuestions: counts.total,
          categoryTotals: counts,
          elapsedSeconds,
        })
      }

      if (!restart) {
        const nextQuestion = selectMostInformativeQuestion(Number(activeSession.theta || 0), askedIds, { discipline })

        if (!nextQuestion) {
          return NextResponse.json({
            sessionId: activeSession.id,
            completed: true,
          })
        }

        return NextResponse.json({
          resumable: true,
          sessionId: activeSession.id,
          theta: Number(activeSession.theta || 0),
          answeredCount: askedIds.length,
          totalQuestions: counts.total,
          categoryTotals: counts,
          elapsedSeconds,
          question: toPublicQuestions([nextQuestion])[0],
        })
      }

      const { error: restartSessionUpdateError } = await auth.supabase
        .from("assessment_sessions")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", activeSession.id)
        .eq("user_id", auth.user.id)

      if (restartSessionUpdateError) {
        if (isMissingAssessmentSessionsTableError(restartSessionUpdateError.message)) {
          return migrationRequiredResponse()
        }

        return NextResponse.json({ error: restartSessionUpdateError.message }, { status: 500 })
      }
    }

    const initialTheta = 0
    const firstQuestion = selectMostInformativeQuestion(initialTheta, [], { discipline })

    if (!firstQuestion) {
      return NextResponse.json({ error: "No assessment questions configured" }, { status: 500 })
    }

    if (probeOnly) {
      return NextResponse.json({
        resumable: false,
        answeredCount: 0,
        totalQuestions: counts.total,
        categoryTotals: counts,
        elapsedSeconds: 0,
      })
    }

    const { data: createdSession, error: createError } = await auth.supabase
      .from("assessment_sessions")
      .insert({
        user_id: auth.user.id,
        theta: initialTheta,
        asked_question_ids: [],
        response_history: [],
        status: "active",
      })
      .select("id")
      .single()

    if (createError || !createdSession) {
      if (isMissingAssessmentSessionsTableError(createError?.message)) {
        return migrationRequiredResponse()
      }

      return NextResponse.json({ error: createError?.message ?? "Unable to create session" }, { status: 500 })
    }

    return NextResponse.json({
      sessionId: createdSession.id,
      theta: initialTheta,
      answeredCount: 0,
      totalQuestions: counts.total,
      categoryTotals: counts,
      elapsedSeconds: 0,
      resumable: false,
      question: toPublicQuestions([firstQuestion])[0],
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start adaptive assessment" },
      { status: 500 }
    )
  }
}
