"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import type { Player } from "@/lib/types"

interface TouchZoneChartProps {
  player: Player
}

export function PassOriginHeatmap({ player }: TouchZoneChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })

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

  // Use real touch zone data from the dataset
  const zones = [
    { label: "Def Pen", value: player.stats.touchesDefPen || 0 },
    { label: "Def Third", value: player.stats.touchesDefThird || 0 },
    { label: "Mid Third", value: player.stats.touchesMidThird || 0 },
    { label: "Att Third", value: player.stats.touchesAttThird || 0 },
    { label: "Att Pen", value: player.stats.touchesAttPen || 0 },
  ]

  const totalTouches = zones.reduce((sum, z) => sum + z.value, 0)
  const dominantZone = [...zones].sort((a, b) => b.value - a.value)[0]
  const attackingTouches = (player.stats.touchesAttThird || 0) + (player.stats.touchesAttPen || 0)
  const defensiveTouches = (player.stats.touchesDefThird || 0) + (player.stats.touchesDefPen || 0)
  const attackingPercent = totalTouches > 0 ? ((attackingTouches / totalTouches) * 100).toFixed(1) : "0"

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = dimensions.width
    const height = dimensions.height
    const margin = { top: 20, right: 20, bottom: 55, left: 70 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)

    const maxValue = d3.max(zones, (d) => d.value) || 1

    const xScale = d3
      .scaleBand()
      .domain(zones.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.3)

    const yScale = d3.scaleLinear().domain([0, maxValue]).range([innerHeight, 0])

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "11px")

    g.selectAll(".domain, .tick line").attr("stroke", "#52525b")

    // Y axis
    g.append("g").call(d3.axisLeft(yScale).ticks(5)).selectAll("text").attr("fill", "#a1a1aa").attr("font-size", "11px")

    svg
      .append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "12px")
      .text("Pitch Zone")

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + innerHeight / 2))
      .attr("y", 18)
      .attr("text-anchor", "middle")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "12px")
      .text("Number of Touches")

    // Bars
    g.selectAll(".bar")
      .data(zones)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.label) || 0)
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.value))
      .attr("fill", "#10b981")
      .attr("rx", 4)

    // Value labels on bars
    g.selectAll(".label")
      .data(zones)
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text((d) => d.value)
  }, [player, dimensions])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Touches by Pitch Zone</h3>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
      <p className="text-base text-zinc-400 mt-4">
        <strong className="text-zinc-300">Takeaway:</strong> {player.name} had {totalTouches} total touches, with the
        most activity in the {dominantZone.label} ({dominantZone.value} touches).
        {attackingTouches > defensiveTouches
          ? ` ${attackingPercent}% of touches came in attacking areas, indicating an advanced position on the pitch.`
          : ` Most touches occurred in defensive/midfield zones, reflecting a deeper playing role.`}
      </p>
    </div>
  )
}
