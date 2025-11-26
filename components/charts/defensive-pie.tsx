"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import type { Player } from "@/lib/types"

interface DefensivePieProps {
  player: Player
}

export function DefensivePie({ player }: DefensivePieProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 350, height: 350 })

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        if (width > 0) {
          const size = Math.min(width, 350)
          setDimensions({ width: size, height: size })
        }
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const total = player.stats.tackles + player.stats.interceptions + player.stats.blocks + player.stats.clearances

  const data = [
    { action: "Tackles", value: player.stats.tackles, color: "#10b981" },
    { action: "Interceptions", value: player.stats.interceptions, color: "#34d399" },
    { action: "Blocks", value: player.stats.blocks, color: "#6ee7b7" },
    { action: "Clearances", value: player.stats.clearances, color: "#a7f3d0" },
  ]

  const sortedActions = [...data].sort((a, b) => b.value - a.value)
  const dominantAction = sortedActions[0]
  const dominantPercent = total > 0 ? ((dominantAction.value / total) * 100).toFixed(1) : "0"
  const secondAction = sortedActions[1]

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = dimensions.width
    const height = dimensions.height
    const radius = Math.min(width, height) / 2 - 40
    const innerRadius = radius * 0.5

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`)

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "pie-tooltip")
      .style("position", "absolute")
      .style("background", "#18181b")
      .style("border", "1px solid #3f3f46")
      .style("border-radius", "8px")
      .style("padding", "8px 12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000)
      .style("font-size", "12px")

    const pie = d3
      .pie<{ action: string; value: number; color: string }>()
      .value((d) => d.value)
      .sort(null)

    const arc = d3
      .arc<d3.PieArcDatum<{ action: string; value: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)

    const arcHover = d3
      .arc<d3.PieArcDatum<{ action: string; value: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 10)

    // Draw arcs
    const arcs = g.selectAll("arc").data(pie(data)).enter().append("g")

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "#18181b")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("d", arcHover)
        const percentage = ((d.data.value / total) * 100).toFixed(1)
        tooltip
          .style("opacity", 1)
          .html(
            `<div style="color: #e4e4e7; font-weight: 600;">${d.data.action}</div>
             <div style="color: #a1a1aa; margin-top: 4px;">Count: <span style="color: #10b981;">${d.data.value}</span></div>
             <div style="color: #a1a1aa;">Share: <span style="color: #10b981;">${percentage}%</span></div>`,
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mousemove", (event) => {
        tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("d", arc)
        tooltip.style("opacity", 0)
      })

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("fill", "#e4e4e7")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .text(total)

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "12px")
      .text("Total Actions")

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width / 2 - 160}, ${height - 25})`)

    data.forEach((d, i) => {
      const legendItem = legend.append("g").attr("transform", `translate(${i * 85}, 0)`)

      legendItem.append("rect").attr("width", 12).attr("height", 12).attr("fill", d.color).attr("rx", 2)

      legendItem
        .append("text")
        .attr("x", 16)
        .attr("y", 10)
        .attr("fill", "#a1a1aa")
        .attr("font-size", "10px")
        .text(d.action)
    })

    return () => {
      tooltip.remove()
    }
  }, [player, dimensions, total])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Defensive Actions</h3>
      <div ref={containerRef} className="w-full flex justify-center">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
      <p className="mt-4 text-base text-zinc-400">
        <strong className="text-zinc-300">Takeaway:</strong> {player.name} made {total} defensive actions this season.
        {dominantAction.action} account for {dominantPercent}% of their defensive contribution ({dominantAction.value}),
        followed by {secondAction.action} ({secondAction.value}).
        {dominantAction.action === "Tackles" && "This suggests an aggressive, front-foot defending style."}
        {dominantAction.action === "Interceptions" && "This indicates excellent reading of the game and anticipation."}
        {dominantAction.action === "Clearances" && "This reflects a more traditional, safety-first defensive approach."}
        {dominantAction.action === "Blocks" && "This shows bravery and positioning in shot-blocking situations."}
      </p>
    </div>
  )
}
