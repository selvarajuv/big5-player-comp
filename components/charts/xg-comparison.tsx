"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import type { Player } from "@/lib/types"

interface XGComparisonProps {
  player: Player
}

export function XGComparison({ player }: XGComparisonProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 220 })

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        if (width > 0) {
          setDimensions({ width: Math.max(width, 300), height: 220 })
        }
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const diff = player.stats.goals - player.stats.xG
  const label = diff > 0 ? "Clinical Finisher" : diff < 0 ? "Wasteful" : "On Par"

  const percentDiff = player.stats.xG > 0 ? ((diff / player.stats.xG) * 100).toFixed(1) : "0"

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = dimensions.width
    const height = dimensions.height
    const margin = { top: 20, right: 50, left: 140, bottom: 40 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const data = [
      { name: "Expected Goals (xG)", value: player.stats.xG, fill: "#6ee7b7" },
      { name: "Actual Goals", value: player.stats.goals, fill: "#10b981" },
    ]

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice()
      .range([0, innerWidth])

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, innerHeight])
      .padding(0.4)

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)

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
      .text("Goals")

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
      .attr("font-size", "12px")
      .text((d) => d.name)

    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.name) || 0)
      .attr("width", (d) => xScale(d.value))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => d.fill)
      .attr("rx", 4)

    // Value labels
    g.selectAll(".value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => xScale(d.value) + 8)
      .attr("y", (d) => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "14px")
      .text((d) => d.value.toFixed(1))
  }, [player, dimensions])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <h3 className="text-lg font-semibold text-zinc-100 mb-1">Expected Goals vs Actual Goals</h3>
      <p className="text-sm text-zinc-400 mb-4">
        G-xG: {diff > 0 ? "+" : ""}
        {diff.toFixed(1)} ({label})
      </p>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
      <p className="mt-4 text-base text-zinc-400">
        <strong className="text-zinc-300">Takeaway:</strong> {player.name} scored {player.stats.goals} goals from{" "}
        {player.stats.xG.toFixed(1)} xG,
        {diff > 0
          ? ` exceeding expectations by ${diff.toFixed(1)} goals (${percentDiff}% above xG). This suggests exceptional finishing ability.`
          : diff < 0
            ? ` falling ${Math.abs(diff).toFixed(1)} goals short of expectations (${Math.abs(Number(percentDiff))}% below xG). This may indicate missed chances or difficult shot selection.`
            : ` performing exactly as expected based on shot quality.`}
      </p>
    </div>
  )
}
