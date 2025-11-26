"use client"

import { useEffect, useRef, useState } from "react"
import type { Player } from "@/lib/types"
import { Slider } from "@/components/ui/slider"

interface AltairGoalsXGScatterProps {
  players: Player[]
}

export function AltairGoalsXGScatter({ players }: AltairGoalsXGScatterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [playerCount, setPlayerCount] = useState(50)
  const [baseSpec, setBaseSpec] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    fetch("/charts/goals-xg-spec.json")
      .then((res) => res.json())
      .then((spec) => setBaseSpec(spec))
      .catch(console.error)
  }, [])

  const attackingPlayers = players
    .filter((p) => p.position === "Forward" && (p.stats.goals > 0 || p.stats.xG > 0))
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, playerCount)

  const overperformers = attackingPlayers.filter((p) => p.stats.goals - p.stats.xG > 2)
  const underperformers = attackingPlayers.filter((p) => p.stats.goals - p.stats.xG < -2)
  const topOverperformer = [...attackingPlayers].sort(
    (a, b) => b.stats.goals - b.stats.xG - (a.stats.goals - a.stats.xG),
  )[0]
  const topUnderperformer = [...attackingPlayers].sort(
    (a, b) => a.stats.goals - a.stats.xG - (b.stats.goals - b.stats.xG),
  )[0]

  useEffect(() => {
    if (!isMounted || !containerRef.current || !baseSpec) return

    const container = containerRef.current

    const spec = JSON.parse(JSON.stringify(baseSpec))

    // Update title with player count
    spec.title.text = `Goals vs Expected Goals (xG) - Top ${playerCount} Scorers`

    // Inject the filtered player data into the scatter layer (index 1)
    spec.layer[1].data.values = attackingPlayers.map((p) => ({
      name: p.name,
      team: p.team,
      league: p.league,
      goals: p.stats.goals,
      xG: p.stats.xG,
      diff: p.stats.goals - p.stats.xG,
      performance:
        p.stats.goals - p.stats.xG > 3
          ? "Overperformer"
          : p.stats.goals - p.stats.xG < -3
            ? "Underperformer"
            : "Average",
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
  }, [attackingPlayers, isMounted, playerCount, baseSpec])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm text-zinc-400 whitespace-nowrap">Players to show:</label>
        <Slider
          value={[playerCount]}
          onValueChange={(value) => setPlayerCount(value[0])}
          min={10}
          max={100}
          step={5}
          className="w-48"
        />
        <span className="text-sm text-zinc-300 w-8">{playerCount}</span>
      </div>
      <div ref={containerRef} className="w-full min-h-[450px]" />
      <p className="mt-4 text-base text-zinc-400">
        <strong className="text-zinc-300">Takeaway:</strong> Among the top {playerCount} scorers,{" "}
        {overperformers.length} players significantly outperform their xG (clinical finishers above the line) while{" "}
        {underperformers.length} underperform.
        {topOverperformer &&
          ` ${topOverperformer.name} is the most clinical, scoring ${(topOverperformer.stats.goals - topOverperformer.stats.xG).toFixed(1)} more goals than expected.`}
        {topUnderperformer &&
          topUnderperformer.stats.goals - topUnderperformer.stats.xG < -2 &&
          ` ${topUnderperformer.name} underperformed most, with ${Math.abs(topUnderperformer.stats.goals - topUnderperformer.stats.xG).toFixed(1)} fewer goals than expected.`}
      </p>
    </div>
  )
}
