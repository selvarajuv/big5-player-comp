"use client"

import { useEffect, useRef, useState } from "react"
import type { Player } from "@/lib/types"
import { RangeSlider } from "@/components/range-slider"

interface AltairGoalsXGScatterProps {
  players: Player[]
}

export function AltairGoalsXGScatter({ players }: AltairGoalsXGScatterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [rankRange, setRankRange] = useState<[number, number]>([1, 50])
  const [baseSpec, setBaseSpec] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    fetch("/charts/goals-xg-spec.json")
      .then((res) => res.json())
      .then((spec) => setBaseSpec(spec))
      .catch(console.error)
  }, [])

  const allAttackers = players
    .filter((p) => p.position === "Forward" && (p.stats.goals > 0 || p.stats.xG > 0))
    .sort((a, b) => b.stats.goals - a.stats.goals)

  const maxPlayers = allAttackers.length
  const attackingPlayers = allAttackers.slice(rankRange[0] - 1, rankRange[1])

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

    spec.title.text =
      rankRange[0] === 1
        ? `Expected Goals vs Actual Goals - Top ${rankRange[1]} Scorers`
        : `Expected Goals vs Actual Goals - Scorers Ranked ${rankRange[0]}-${rankRange[1]}`

    // Inject the filtered player data into the scatter layer (index 1)
    spec.layer[1].data.values = attackingPlayers.map((p) => ({
      name: p.name,
      team: p.team,
      league: p.league,
      goals: p.stats.goals,
      xG: p.stats.xG,
      diff: p.stats.goals - p.stats.xG,
      performance:
        p.stats.goals - p.stats.xG > 2
          ? "Overperformer"
          : p.stats.goals - p.stats.xG < -2
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
  }, [attackingPlayers, isMounted, rankRange, baseSpec])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm text-zinc-400 whitespace-nowrap">Scorer Rank:</label>
        <RangeSlider
          min={1}
          max={Math.min(maxPlayers, 300)}
          value={rankRange}
          onValueChange={setRankRange}
          step={5}
          className="w-64"
        />
        <span className="text-sm text-zinc-300 whitespace-nowrap">
          {rankRange[0]}-{rankRange[1]}
        </span>
      </div>
      <div ref={containerRef} className="w-full min-h-[450px]" />
      <p className="mt-4 text-base text-zinc-400">
        <strong className="text-zinc-300">Takeaway:</strong> Among scorers ranked {rankRange[0]}-{rankRange[1]},{" "}
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
