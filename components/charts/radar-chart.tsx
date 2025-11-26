"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import type { Player } from "@/lib/types"

interface RadarChartProps {
  player: Player
  type: "attacker" | "defender"
}

export function RadarChart({ player, type }: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 350, height: 300 })

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        if (width > 0) {
          setDimensions({ width: Math.max(width, 300), height: 300 })
        }
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const nineties = player.stats.nineties || 1
  const goalsPerNinety = player.stats.goals / nineties
  const assistsPerNinety = player.stats.assists / nineties
  const xGPerNinety = player.stats.xG / nineties
  const shotsPerNinety = player.stats.shots / nineties
  const tacklesPerNinety = player.stats.tackles / nineties

  const attackerData = [
    { subject: "Goals/90", value: goalsPerNinety * 100, raw: goalsPerNinety.toFixed(2) },
    { subject: "Assists/90", value: assistsPerNinety * 100, raw: assistsPerNinety.toFixed(2) },
    { subject: "xG/90", value: xGPerNinety * 100, raw: xGPerNinety.toFixed(2) },
    { subject: "Shots/90", value: shotsPerNinety * 25, raw: shotsPerNinety.toFixed(2) },
    {
      subject: "Dribbles",
      value: Math.min(player.stats.dribbles || 0, 150),
      raw: (player.stats.dribbles || 0).toString(),
    },
    {
      subject: "Prog Carries",
      value: Math.min(player.stats.progressiveCarries || 0, 150),
      raw: (player.stats.progressiveCarries || 0).toString(),
    },
    {
      subject: "Shot Creating",
      value: Math.min(player.stats.shotCreatingActions || 0, 150),
      raw: (player.stats.shotCreatingActions || 0).toString(),
    },
  ]

  const defenderData = [
    { subject: "Tackles/90", value: tacklesPerNinety * 50, raw: tacklesPerNinety.toFixed(2) },
    {
      subject: "Interceptions",
      value: Math.min((player.stats.interceptions || 0) * 2, 150),
      raw: (player.stats.interceptions || 0).toString(),
    },
    {
      subject: "Blocks",
      value: Math.min((player.stats.blocks || 0) * 4, 150),
      raw: (player.stats.blocks || 0).toString(),
    },
    {
      subject: "Clearances",
      value: Math.min(player.stats.clearances || 0, 150),
      raw: (player.stats.clearances || 0).toString(),
    },
    {
      subject: "Aerial Wins",
      value: Math.min(player.stats.aerialWins || 0, 150),
      raw: (player.stats.aerialWins || 0).toString(),
    },
    {
      subject: "Pass %",
      value: (player.stats.passCompletionPct || 0) * 1.5,
      raw: `${(player.stats.passCompletionPct || 0).toFixed(1)}%`,
    },
    {
      subject: "Prog Passes",
      value: Math.min(player.stats.progressivePasses || 0, 150),
      raw: (player.stats.progressivePasses || 0).toString(),
    },
  ]

  const data = type === "attacker" ? attackerData : defenderData
  const title = type === "attacker" ? "Performance Profile" : "Defensive Profile"

  const sortedData = [...data].sort((a, b) => b.value - a.value)
  const strongestAttr = sortedData[0]
  const weakestAttr = sortedData[sortedData.length - 1]

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = dimensions.width
    const height = dimensions.height
    const margin = 50
    const radius = Math.min(width, height) / 2 - margin
    const centerX = width / 2
    const centerY = height / 2

    const maxValue = 150
    const levels = 5
    const angleSlice = (Math.PI * 2) / data.length

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "radar-tooltip")
      .style("position", "absolute")
      .style("background", "#18181b")
      .style("border", "1px solid #3f3f46")
      .style("border-radius", "8px")
      .style("padding", "8px 12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000)
      .style("font-size", "12px")

    // Draw grid circles
    for (let level = 1; level <= levels; level++) {
      const r = (radius * level) / levels
      svg
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "#3f3f46")
        .attr("stroke-width", 1)
    }

    // Draw axis lines
    data.forEach((_, i) => {
      const angle = angleSlice * i - Math.PI / 2
      svg
        .append("line")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", centerX + radius * Math.cos(angle))
        .attr("y2", centerY + radius * Math.sin(angle))
        .attr("stroke", "#3f3f46")
        .attr("stroke-width", 1)
    })

    // Draw axis labels
    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const labelRadius = radius + 25
      const x = centerX + labelRadius * Math.cos(angle)
      const y = centerY + labelRadius * Math.sin(angle)

      svg
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#a1a1aa")
        .attr("font-size", "11px")
        .text(d.subject)
    })

    // Draw data polygon
    const radarLine = d3
      .lineRadial<{ subject: string; value: number; raw: string }>()
      .radius((d) => (d.value / maxValue) * radius)
      .angle((_, i) => angleSlice * i)
      .curve(d3.curveLinearClosed)

    const radarGroup = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`)

    radarGroup
      .append("path")
      .datum(data)
      .attr("d", radarLine)
      .attr("fill", "#10b981")
      .attr("fill-opacity", 0.4)
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)

    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const r = (d.value / maxValue) * radius
      svg
        .append("circle")
        .attr("cx", centerX + r * Math.cos(angle))
        .attr("cy", centerY + r * Math.sin(angle))
        .attr("r", 5)
        .attr("fill", "#10b981")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0)
        .style("cursor", "pointer")
        .on("mouseover", function (event) {
          d3.select(this).attr("r", 8).attr("stroke-width", 2)
          tooltip
            .style("opacity", 1)
            .html(
              `<span style="color: #a1a1aa;">${d.subject}:</span> <span style="color: #10b981; font-weight: 600;">${d.raw}</span>`,
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px")
        })
        .on("mousemove", (event) => {
          tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 10 + "px")
        })
        .on("mouseout", function () {
          d3.select(this).attr("r", 5).attr("stroke-width", 0)
          tooltip.style("opacity", 0)
        })
    })

    return () => {
      tooltip.remove()
    }
  }, [data, dimensions])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">{title}</h3>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
      <p className="mt-4 text-base text-zinc-400">
        <strong className="text-zinc-300">Takeaway:</strong> {player.name}'s strongest attribute is{" "}
        {strongestAttr.subject} ({strongestAttr.raw}), while {weakestAttr.subject} ({weakestAttr.raw}) represents an
        area for potential improvement.
        {type === "attacker"
          ? ` As an attacker, focus on goal involvement and chance creation metrics.`
          : ` As a defender, the balance between tackles, interceptions, and aerial presence is key.`}
      </p>
    </div>
  )
}
