"use client"

interface ScoreGaugeProps {
  score: number
  size?: number
}

export function ScoreGauge({ score, size = 160 }: ScoreGaugeProps) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const remaining = circumference - progress

  const getColor = (s: number) => {
    if (s >= 75) return "#34D399"    // emerald
    if (s >= 50) return "#F59E0B"    // gold
    return "#EF4444"                  // destructive
  }

  const getGlow = (s: number) => {
    if (s >= 75) return "drop-shadow(0 0 10px rgba(52, 211, 153, 0.6))"
    if (s >= 50) return "drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))"
    return "drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))"
  }

  const getLabel = (s: number) => {
    if (s >= 75) return "OPTIMAL"
    if (s >= 50) return "MODERATE"
    return "LOW"
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
        {/* Tick marks */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * 360 - 90
          const rad = (angle * Math.PI) / 180
          const x1 = size / 2 + (radius - 6) * Math.cos(rad)
          const y1 = size / 2 + (radius - 6) * Math.sin(rad)
          const x2 = size / 2 + (radius + 2) * Math.cos(rad)
          const y2 = size / 2 + (radius + 2) * Math.sin(rad)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        })}
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={8}
          strokeDasharray={`${progress} ${remaining}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
          style={{ filter: getGlow(score) }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold font-mono text-foreground tracking-wider">{score}</span>
        <span className="text-[9px] font-mono text-muted-foreground tracking-[0.2em]">{getLabel(score)}</span>
      </div>
    </div>
  )
}
