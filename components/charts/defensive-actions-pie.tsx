"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { Player } from "@/lib/types"

interface DefensiveActionsPieProps {
  player: Player
}

export function DefensiveActionsPie({ player }: DefensiveActionsPieProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const data = [
    { name: "Tackles", value: player.stats.tackles },
    { name: "Interceptions", value: player.stats.interceptions },
    { name: "Blocks", value: player.stats.blocks },
    { name: "Clearances", value: player.stats.clearances },
    { name: "Recoveries", value: player.stats.recoveries },
  ]

  const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"]

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = 280
    const radius = Math.min(width, height - 60) / 2 - 10
    const innerRadius = radius * 0.6

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${(height - 60) / 2})`)

    const pie = d3
      .pie<{ name: string; value: number }>()
      .value((d) => d.value)
      .padAngle(0.02)

    const arc = d3.arc<d3.PieArcDatum<{ name: string; value: number }>>().innerRadius(innerRadius).outerRadius(radius)

    const labelArc = d3
      .arc<d3.PieArcDatum<{ name: string; value: number }>>()
      .innerRadius(radius * 0.75)
      .outerRadius(radius * 0.75)

    const arcs = g.selectAll(".arc").data(pie(data)).enter().append("g").attr("class", "arc")

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (_, i) => COLORS[i])
      .attr("stroke", "#18181b")
      .attr("stroke-width", 2)

    // Value labels
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("fill", "#18181b")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text((d) => d.data.value)

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width / 2 - 120}, ${height - 40})`)

    data.forEach((d, i) => {
      const itemX = (i % 3) * 85
      const itemY = Math.floor(i / 3) * 20

      legend
        .append("rect")
        .attr("x", itemX)
        .attr("y", itemY)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", COLORS[i])
        .attr("rx", 2)

      legend
        .append("text")
        .attr("x", itemX + 16)
        .attr("y", itemY + 10)
        .attr("fill", "#d4d4d8")
        .attr("font-size", "11px")
        .text(d.name)
    })
  }, [player])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Defensive Actions Distribution</h3>
      <svg ref={svgRef} className="w-full" style={{ height: 280 }} />
    </div>
  )
}
