"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import type { Player } from "@/lib/types"

interface PassCompletionProps {
  player: Player
}

export function PassCompletion({ player }: PassCompletionProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 240 })

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        if (width > 0) {
          setDimensions({ width: Math.max(width, 300), height: 240 })
        }
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const data = [
    {
      name: "Short (0-15y)",
      completed: player.stats.shortPassesCompleted,
      missed: player.stats.shortPassesAttempted - player.stats.shortPassesCompleted,
    },
    {
      name: "Medium (15-30y)",
      completed: player.stats.mediumPassesCompleted,
      missed: player.stats.mediumPassesAttempted - player.stats.mediumPassesCompleted,
    },
    {
      name: "Long (30y+)",
      completed: player.stats.longPassesCompleted,
      missed: player.stats.longPassesAttempted - player.stats.longPassesCompleted,
    },
  ]

  const totalAttempted =
    player.stats.shortPassesAttempted + player.stats.mediumPassesAttempted + player.stats.longPassesAttempted
  const totalCompleted =
    player.stats.shortPassesCompleted + player.stats.mediumPassesCompleted + player.stats.longPassesCompleted
  const overallPercent = totalAttempted > 0 ? ((totalCompleted / totalAttempted) * 100).toFixed(1) : "0"

  const shortPct =
    player.stats.shortPassesAttempted > 0
      ? ((player.stats.shortPassesCompleted / player.stats.shortPassesAttempted) * 100).toFixed(1)
      : "0"
  const medPct =
    player.stats.mediumPassesAttempted > 0
      ? ((player.stats.mediumPassesCompleted / player.stats.mediumPassesAttempted) * 100).toFixed(1)
      : "0"
  const longPct =
    player.stats.longPassesAttempted > 0
      ? ((player.stats.longPassesCompleted / player.stats.longPassesAttempted) * 100).toFixed(1)
      : "0"

  const mostAttempted = data.reduce(
    (max, d) => (d.completed + d.missed > max.completed + max.missed ? d : max),
    data[0],
  )

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = dimensions.width
    const height = dimensions.height
    const margin = { top: 40, right: 30, left: 110, bottom: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const maxValue = d3.max(data, (d) => d.completed + d.missed) || 0

    const xScale = d3.scaleLinear().domain([0, maxValue]).nice().range([0, innerWidth])

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerHeight])
      .padding(0.35)

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${margin.left}, 10)`)

    legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 14).attr("height", 14).attr("fill", "#10b981")
    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 11)
      .attr("fill", "#d4d4d8")
      .attr("font-size", "12px")
      .text("Completed")

    legend.append("rect").attr("x", 100).attr("y", 0).attr("width", 14).attr("height", 14).attr("fill", "#ef4444")
    legend.append("text").attr("x", 120).attr("y", 11).attr("fill", "#d4d4d8").attr("font-size", "12px").text("Missed")

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .selectAll("text")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "12px")

    g.selectAll(".domain").remove()
    g.selectAll(".tick line").attr("stroke", "#3f3f46")

    svg
      .append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "12px")
      .text("Number of Passes")

    // Y axis labels
    g.selectAll(".y-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "y-label")
      .attr("x", -10)
      .attr("y", (d) => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "11px")
      .text((d) => d.name)

    g.selectAll(".bar-completed")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-completed")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.name) || 0)
      .attr("width", (d) => xScale(d.completed))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#10b981")

    g.selectAll(".bar-missed")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-missed")
      .attr("x", (d) => xScale(d.completed))
      .attr("y", (d) => yScale(d.name) || 0)
      .attr("width", (d) => xScale(d.missed))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#ef4444")
  }, [player, dimensions])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <h3 className="text-lg font-semibold text-zinc-100 mb-1">Pass Completion by Range</h3>
      <p className="text-sm text-zinc-400 mb-4">
        Total: {totalCompleted}/{totalAttempted} ({overallPercent}%)
      </p>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
      <p className="mt-4 text-base text-zinc-400">
        <strong className="text-zinc-300">Takeaway:</strong> {player.name} completes {overallPercent}% of passes
        overall. Short passes have a {shortPct}% success rate, medium passes {medPct}%, and long passes {longPct}%.
        {mostAttempted.name} passes are most frequently attempted,
        {Number(longPct) > 60
          ? " and strong long-ball accuracy suggests good distribution ability."
          : Number(shortPct) > 85
            ? " with excellent short-range passing indicating secure ball retention."
            : " showing a balanced passing profile across distances."}
      </p>
    </div>
  )
}
