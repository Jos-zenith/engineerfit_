"use client"

import { ResponsiveContainer, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"

interface RiasecChartProps {
  data: { code: string; label: string; score: number }[]
}

export function RiasecChart({ data }: RiasecChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    subject: `${d.code} - ${d.label}`,
    fullMark: 100,
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
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
            name="RIASEC"
            dataKey="score"
            stroke="#A78BFA"
            fill="#A78BFA"
            fillOpacity={0.1}
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 0 8px rgba(167, 139, 250, 0.5))" }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Holland Code readout */}
      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="text-[10px] text-muted-foreground font-mono tracking-[0.15em]">HOLLAND_CODE:</span>
        <span className="text-sm font-bold font-mono text-violet tracking-wider">
          {data
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((d) => d.code)
            .join("")}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          ({data
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((d) => d.label)
            .join(", ")})
        </span>
      </div>
    </div>
  )
}
