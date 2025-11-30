"use client"

import { useEffect, useRef, useState } from "react"
import type { Player } from "@/lib/types"
import { RangeSlider } from "@/components/range-slider"

interface AltairDefendersScatterProps {
  players: Player[]
}

export function AltairDefendersScatter({ players }: AltairDefendersScatterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [rankRange, setRankRange] = useState<[number, number]>([1, 50])
  const [baseSpec, setBaseSpec] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    fetch("/charts/defenders-spec.json")
      .then((res) => res.json())
      .then((spec) => setBaseSpec(spec))
      .catch(console.error)
  }, [])

  const allDefenders = players
    .filter((p) => p.position === "Defender" && (p.stats.tackles > 0 || p.stats.interceptions > 0))
    .sort((a, b) => {
      const totalA = a.stats.tackles + a.stats.interceptions + a.stats.clearances + a.stats.blocks
      const totalB = b.stats.tackles + b.stats.interceptions + b.stats.clearances + b.stats.blocks
      return totalB - totalA
    })

  const maxPlayers = allDefenders.length
  const defenders = allDefenders.slice(rankRange[0] - 1, rankRange[1])

  const topTackler = [...defenders].sort((a, b) => b.stats.tackles - a.stats.tackles)[0]
  const topInterceptor = [...defenders].sort((a, b) => b.stats.interceptions - a.stats.interceptions)[0]
  const avgTackles =
    defenders.length > 0 ? defenders.reduce((sum, p) => sum + p.stats.tackles, 0) / defenders.length : 0
  const avgInterceptions =
    defenders.length > 0 ? defenders.reduce((sum, p) => sum + p.stats.interceptions, 0) / defenders.length : 0

  useEffect(() => {
    if (!isMounted || !containerRef.current || !baseSpec) return

    const container = containerRef.current

    const spec = JSON.parse(JSON.stringify(baseSpec))

    spec.title.text =
      rankRange[0] === 1
        ? `Top ${rankRange[1]} Defenders: Tackles vs Interceptions`
        : `Defenders Ranked ${rankRange[0]}-${rankRange[1]}: Tackles vs Interceptions`

    // Inject the filtered defender data
    spec.data.values = defenders.map((p) => ({
      name: p.name,
      team: p.team,
      league: p.league,
      tackles: p.stats.tackles,
      interceptions: p.stats.interceptions,
      clearances: p.stats.clearances,
      blocks: p.stats.blocks,
      totalDefensive: p.stats.tackles + p.stats.interceptions + p.stats.clearances + p.stats.blocks,
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
  }, [defenders, isMounted, rankRange, baseSpec])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <div className="flex items-center gap-4 mb-4">
        <label className="text-sm text-zinc-400 whitespace-nowrap">Defender Rank:</label>
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
        <strong className="text-zinc-300">Takeaway:</strong> Among defenders ranked {rankRange[0]}-{rankRange[1]},
        {topTackler && ` ${topTackler.name} leads in tackles (${topTackler.stats.tackles})`}
        {topInterceptor && ` while ${topInterceptor.name} tops interceptions (${topInterceptor.stats.interceptions}).`}{" "}
        The average defender in this group records {avgTackles.toFixed(1)} tackles and {avgInterceptions.toFixed(1)}{" "}
        interceptions per season.
      </p>
    </div>
  )
}
