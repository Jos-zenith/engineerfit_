"use client"

import { ResponsiveContainer, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"

interface PersonaRadarChartProps {
  data: { subject: string; score: number; fullMark: number }[]
}

export function PersonaRadarChart({ data }: PersonaRadarChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#64748B", fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#475569", fontSize: 9 }}
          />
          <Radar
            name="Digital Fingerprint"
            dataKey="score"
            stroke="#22D3EE"
            fill="#22D3EE"
            fillOpacity={0.1}
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
