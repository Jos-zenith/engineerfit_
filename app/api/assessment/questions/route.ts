import { NextResponse } from "next/server"
import { assessmentQuestionBank, toPublicQuestions } from "@/lib/assessment-bank"

export async function GET() {
  return NextResponse.json({ questions: toPublicQuestions(assessmentQuestionBank) })
}
