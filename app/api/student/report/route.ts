import { NextRequest, NextResponse } from "next/server"
import PDFDocument from "pdfkit"
import { requireRole } from "@/lib/api-auth"
import { getRoleRecommendations } from "@/lib/scoring"

export const runtime = "nodejs"

type AttemptRow = {
  cognitive_score: number
  behavioral_score: number
  domain_score: number
  role_alignment_score: number
  career_hygiene_score: number
  retention_prediction: number
  overall_score: number
}

function toPoint(value: number, index: number, center: number, radius: number, total: number) {
  const angle = ((Math.PI * 2) / total) * index - Math.PI / 2
  const scaled = (Math.max(0, Math.min(100, value)) / 100) * radius
  return {
    x: center + scaled * Math.cos(angle),
    y: center + scaled * Math.sin(angle),
  }
}

function drawPolygon(doc: PDFKit.PDFDocument, values: number[], centerX: number, centerY: number, radius: number) {
  if (!values.length) return
  const first = toPoint(values[0], 0, 0, radius, values.length)
  doc.moveTo(centerX + first.x, centerY + first.y)

  for (let i = 1; i < values.length; i += 1) {
    const point = toPoint(values[i], i, 0, radius, values.length)
    doc.lineTo(centerX + point.x, centerY + point.y)
  }

  doc.closePath()
}

async function renderReportPdf(props: {
  name: string
  email: string
  attempt: AttemptRow
  generatedAt: string
  roles: Array<{ role: string; fitPercent: number; retention: number }>
}) {
  const { name, email, attempt, generatedAt, roles } = props

  const doc = new PDFDocument({ size: "A4", margin: 32 })
  const chunks: Buffer[] = []

  doc.on("data", (chunk) => chunks.push(chunk as Buffer))

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)
  })

  const radarValues = [
    attempt.cognitive_score,
    attempt.behavioral_score,
    attempt.domain_score,
    attempt.career_hygiene_score,
    attempt.retention_prediction,
    attempt.role_alignment_score,
  ]

  const pageWidth = doc.page.width
  const left = 32
  const right = pageWidth - 32

  doc.fillColor("#0e7490").fontSize(16).font("Helvetica-Bold").text("ENGINEERFIT", left, 30)
  doc.fillColor("#374151").fontSize(12).font("Helvetica").text("Career Fit Snapshot Report", left, 50)
  doc.fillColor("#6b7280").fontSize(9).text(`Generated: ${generatedAt}`, left, 66)
  doc.moveTo(left, 82).lineTo(right, 82).strokeColor("#e5e7eb").stroke()

  doc.roundedRect(left, 96, right - left, 68, 4).fillAndStroke("#ffffff", "#e5e7eb")
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(10).text("STUDENT PROFILE", left + 10, 106)
  doc.fillColor("#6b7280").font("Helvetica").fontSize(9).text("Name", left + 12, 124)
  doc.fillColor("#111827").font("Helvetica-Bold").text(name, left + 150, 124, { width: right - left - 160, align: "right" })
  doc.fillColor("#6b7280").font("Helvetica").text("Email", left + 12, 138)
  doc.fillColor("#111827").font("Helvetica-Bold").text(email, left + 150, 138, { width: right - left - 160, align: "right" })
  doc.fillColor("#6b7280").font("Helvetica").text("Overall Score", left + 12, 152)
  doc.fillColor("#111827").font("Helvetica-Bold").text(`${attempt.overall_score}%`, left + 150, 152, { width: right - left - 160, align: "right" })

  const panelTop = 176
  const panelGap = 12
  const panelWidth = (right - left - panelGap) / 2

  doc.roundedRect(left, panelTop, panelWidth, 188, 4).fillAndStroke("#ffffff", "#e5e7eb")
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(10).text("CORE SCORES", left + 10, panelTop + 10)

  const scoreRows: Array<[string, number]> = [
    ["Career Hygiene", attempt.career_hygiene_score],
    ["Cognitive", attempt.cognitive_score],
    ["Behavioral", attempt.behavioral_score],
    ["Domain", attempt.domain_score],
    ["Role Alignment", attempt.role_alignment_score],
    ["Retention Prediction", attempt.retention_prediction],
  ]

  let y = panelTop + 30
  for (const [label, score] of scoreRows) {
    doc.fillColor("#6b7280").font("Helvetica").fontSize(9).text(label, left + 12, y)
    doc.fillColor("#111827").font("Helvetica-Bold").text(`${score}%`, left + panelWidth - 52, y)
    y += 22
  }

  const radarLeft = left + panelWidth + panelGap
  doc.roundedRect(radarLeft, panelTop, panelWidth, 188, 4).fillAndStroke("#ffffff", "#e5e7eb")
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(10).text("PERSONA RADAR", radarLeft + 10, panelTop + 10)

  const centerX = radarLeft + panelWidth / 2
  const centerY = panelTop + 95
  const radius = 62
  const total = radarValues.length

  doc.lineWidth(0.7)
  for (const ring of [25, 50, 75, 100]) {
    doc.strokeColor("#e5e7eb")
    drawPolygon(doc, Array.from({ length: total }).map(() => ring), centerX, centerY, radius)
    doc.stroke()
  }

  for (let i = 0; i < total; i += 1) {
    const axis = toPoint(100, i, 0, radius, total)
    doc.moveTo(centerX, centerY).lineTo(centerX + axis.x, centerY + axis.y).strokeColor("#d1d5db").stroke()
  }

  drawPolygon(doc, radarValues, centerX, centerY, radius)
  doc.fillColor("#22d3ee").fillOpacity(0.2).fillAndStroke("#22d3ee", "#0891b2")
  doc.fillOpacity(1)
  doc.circle(centerX, centerY, 2).fill("#0f172a")

  doc.fillColor("#6b7280").font("Helvetica").fontSize(8)
  doc.text("Axes: Cog, Beh, Dom, CHS, Ret, Align", radarLeft + 10, panelTop + 166)

  const roleTop = panelTop + 198
  doc.roundedRect(left, roleTop, right - left, 172, 4).fillAndStroke("#ffffff", "#e5e7eb")
  doc.fillColor("#111827").font("Helvetica-Bold").fontSize(10).text("TOP ROLE RECOMMENDATIONS", left + 10, roleTop + 10)

  y = roleTop + 30
  roles.forEach((role, index) => {
    doc.strokeColor("#f3f4f6").moveTo(left + 10, y + 16).lineTo(right - 10, y + 16).stroke()
    doc.fillColor("#111827").font("Helvetica").fontSize(9).text(`${index + 1}. ${role.role}`, left + 12, y + 4)
    doc.fillColor("#111827").font("Helvetica-Bold").text(`${role.fitPercent}% fit / ${role.retention}% retention`, right - 160, y + 4, { width: 148, align: "right" })
    y += 26
  })

  doc.fillColor("#6b7280").font("Helvetica").fontSize(8)
  doc.text(
    "This report is generated from EngineerFit assessment outcomes and intended for student-facing career guidance.",
    left,
    roleTop + 152,
    { width: right - left },
  )

  doc.end()
  return done
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, "student")
  if (auth.error || !auth.user || !auth.supabase) {
    return auth.error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
    return NextResponse.json({ error: "No completed assessment found" }, { status: 404 })
  }

  const recommendations = getRoleRecommendations({
    cognitiveScore: attempt.cognitive_score,
    roleAlignmentScore: attempt.role_alignment_score,
    overallScore: attempt.overall_score,
    domainScore: attempt.domain_score,
    behavioralScore: attempt.behavioral_score,
    retentionPrediction: attempt.retention_prediction,
  }).slice(0, 5)

  const pdfBuffer = await renderReportPdf({
    name: (typeof auth.user.user_metadata?.full_name === "string" && auth.user.user_metadata.full_name) || auth.user.email || "Student",
    email: auth.user.email || "N/A",
    attempt,
    generatedAt: new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
    roles: recommendations,
  })

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=career-fit-snapshot.pdf",
      "Cache-Control": "no-store",
    },
  })
}
