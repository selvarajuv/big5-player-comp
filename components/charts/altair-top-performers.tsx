"use client"

import { useEffect, useRef, useState } from "react"
import type { Player } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface AltairTopPerformersProps {
  players: Player[]
}

type MetricKey = "goals" | "assists" | "xG" | "progressiveCarries" | "tackles"

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "xG", label: "Expected Goals (xG)" },
  { key: "progressiveCarries", label: "Progressive Carries" },
  { key: "tackles", label: "Tackles" },
]

export function AltairTopPerformers({ players }: AltairTopPerformersProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [metric, setMetric] = useState<MetricKey>("goals")
  const [playerCount, setPlayerCount] = useState(15)
  const [baseSpec, setBaseSpec] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    fetch("/charts/top-performers-spec.json")
      .then((res) => res.json())
      .then((spec) => setBaseSpec(spec))
      .catch(console.error)
  }, [])

  const sortedPlayers = [...players].sort((a, b) => b.stats[metric] - a.stats[metric]).slice(0, playerCount)

  const topPlayer = sortedPlayers[0]
  const worstPlayer = sortedPlayers[sortedPlayers.length - 1]
  const metricLabel = METRICS.find((m) => m.key === metric)?.label || metric
  const topValue = topPlayer ? topPlayer.stats[metric] : 0
  const worstValue = worstPlayer ? worstPlayer.stats[metric] : 0
  const avgValue =
    sortedPlayers.length > 0 ? sortedPlayers.reduce((sum, p) => sum + p.stats[metric], 0) / sortedPlayers.length : 0

  useEffect(() => {
    if (!isMounted || !containerRef.current || !baseSpec) return

    const container = containerRef.current

    const spec = JSON.parse(JSON.stringify(baseSpec))

    // Update with dynamic values
    spec.height = Math.max(300, playerCount * 25)
    spec.title.text = `Top ${playerCount} Players by ${metricLabel}`
    spec.encoding.x.title = metricLabel
    spec.encoding.tooltip[4].title = metricLabel

    // Inject the filtered/sorted player data
    spec.data.values = sortedPlayers.map((p, i) => ({
      name: p.name,
      team: p.team,
      league: p.league,
      value: p.stats[metric],
      rank: i + 1,
    }))

    let cleanup = () => {}

    import("vega-embed").then(({ default: vegaEmbed }) => {
      if (!container) return

      vegaEmbed(container, spec, {
        actions: false,
        renderer: "svg",
      })
        .then((result) => {
          cleanup = () => result.view.finalize()
        })
        .catch(console.error)
    })

    return () => {
      cleanup()
      if (container) {
        container.innerHTML = ""
      }
    }
  }, [sortedPlayers, metric, isMounted, playerCount, baseSpec])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <Select value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
          <SelectTrigger className="w-[200px] bg-zinc-800 border-zinc-700 text-zinc-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {METRICS.map((m) => (
              <SelectItem key={m.key} value={m.key} className="text-zinc-100">
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400 whitespace-nowrap">Show:</span>
          <Slider
            value={[playerCount]}
            onValueChange={(v) => setPlayerCount(v[0])}
            min={5}
            max={100}
            step={5}
            className="w-[120px]"
          />
          <span className="text-sm text-zinc-100 w-8">{playerCount}</span>
        </div>
      </div>
      <div ref={containerRef} className="w-full min-h-[350px]" />
      <p className="mt-4 text-base text-zinc-400">
        <strong className="text-zinc-300">Takeaway:</strong>{" "}
        {topPlayer
          ? `${topPlayer.name} leads the top ${playerCount} players in ${metricLabel} with ${topValue.toFixed(1)}, while ${worstPlayer?.name} ranks ${playerCount}th with ${worstValue.toFixed(1)}. `
          : ""}
        The average among these top performers is {avgValue.toFixed(1)} {metricLabel.toLowerCase()}, showing the gap
        between the best and the cutoff for the top {playerCount} across Europe's Big 5 leagues.
      </p>
    </div>
  )
}
