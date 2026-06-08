import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { getQuestionCountsByCategory, normalizeEngineeringDiscipline, toPublicQuestions } from "@/lib/assessment-bank"
import { selectMostInformativeQuestion } from "@/lib/irt"

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, "student")
    if (auth.error || !auth.user) {
      return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const probeOnly = body?.probeOnly === true
    const restart = body?.restart === true
    const discipline = normalizeEngineeringDiscipline(body?.discipline)
    const counts = getQuestionCountsByCategory(discipline)
    const RESUME_WINDOW_SECONDS = 48 * 60 * 60

    const existingSessions = await prisma.assessmentSession.findMany({
      where: {
        userId: auth.user.id,
        status: "active",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    let activeSession: (typeof existingSessions)[number] | null = existingSessions.length > 0 ? existingSessions[0] : null

    // Backfill safeguard: if duplicate active sessions exist, keep the newest and retire the rest.
    if (existingSessions.length > 1) {
      const duplicateIds = existingSessions.slice(1).map((session) => session.id)
      await prisma.assessmentSession.updateMany({
        where: {
          id: { in: duplicateIds },
          userId: auth.user.id,
        },
        data: {
          status: "completed",
          updatedAt: new Date(),
        },
      })
    }

    if (activeSession) {
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(activeSession.createdAt).getTime()) / 1000))

      if (elapsedSeconds > RESUME_WINDOW_SECONDS) {
        await prisma.assessmentSession.update({
          where: { id: activeSession.id },
          data: {
            status: "completed",
            updatedAt: new Date(),
          },
        })

        activeSession = null
      }
    }

    if (activeSession) {
      const askedIds: number[] = JSON.parse(activeSession.asked_question_ids || "[]")
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(activeSession.createdAt).getTime()) / 1000))

      if (probeOnly && !restart) {
        return NextResponse.json({
          resumable: true,
          sessionId: activeSession.id,
          theta: activeSession.theta,
          answeredCount: askedIds.length,
          totalQuestions: counts.total,
          categoryTotals: counts,
          elapsedSeconds,
        })
      }

      if (!restart) {
        const nextQuestion = selectMostInformativeQuestion(activeSession.theta, askedIds, { discipline })

        if (!nextQuestion) {
          return NextResponse.json({
            sessionId: activeSession.id,
            completed: true,
          })
        }

        return NextResponse.json({
          resumable: true,
          sessionId: activeSession.id,
          theta: activeSession.theta,
          answeredCount: askedIds.length,
          totalQuestions: counts.total,
          categoryTotals: counts,
          elapsedSeconds,
          question: toPublicQuestions([nextQuestion])[0],
        })
      }

      await prisma.assessmentSession.update({
        where: { id: activeSession.id },
        data: {
          status: "completed",
          updatedAt: new Date(),
        },
      })
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

    const createdSession = await prisma.assessmentSession.create({
      data: {
        userId: auth.user.id,
        theta: initialTheta,
        asked_question_ids: JSON.stringify([]),
        response_history: JSON.stringify([]),
        status: "active",
      },
    })

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
    console.error("Assessment session start error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start adaptive assessment" },
      { status: 500 }
    )
  }
}

