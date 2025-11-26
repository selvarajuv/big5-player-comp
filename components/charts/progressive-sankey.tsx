"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { sankey, sankeyLinkHorizontal } from "d3-sankey"
import type { Player } from "@/lib/types"

interface ProgressiveSankeyProps {
  player: Player
}

interface SankeyNodeData {
  name: string
  value?: number
}

interface SankeyLinkData {
  source: number
  target: number
  value: number
}

export function ProgressiveSankey({ player }: ProgressiveSankeyProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 280 })

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        if (width > 0) {
          setDimensions({ width: Math.max(width, 300), height: 280 })
        }
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const total = player.stats.progressiveCarries + player.stats.progressivePasses

  const carryRatio = total > 0 ? ((player.stats.progressiveCarries / total) * 100).toFixed(1) : "0"
  const passRatio = total > 0 ? ((player.stats.progressivePasses / total) * 100).toFixed(1) : "0"
  const dominantMethod = player.stats.progressiveCarries > player.stats.progressivePasses ? "carrying" : "passing"

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = dimensions.width
    const height = dimensions.height
    const margin = { top: 20, right: 160, bottom: 20, left: 140 }

    // Sankey data
    const nodes: SankeyNodeData[] = [
      { name: "Progressive Carries" },
      { name: "Progressive Passes" },
      { name: "Total Progressive Actions" },
    ]

    const links: SankeyLinkData[] = [
      { source: 0, target: 2, value: player.stats.progressiveCarries },
      { source: 1, target: 2, value: player.stats.progressivePasses },
    ]

    // Create sankey generator
    const sankeyGenerator = sankey<SankeyNodeData, SankeyLinkData>()
      .nodeWidth(20)
      .nodePadding(40)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])

    const { nodes: sankeyNodes, links: sankeyLinks } = sankeyGenerator({
      nodes: nodes.map((d) => ({ ...d })),
      links: links.map((d) => ({ ...d })),
    })

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "sankey-tooltip")
      .style("position", "absolute")
      .style("background", "#18181b")
      .style("border", "1px solid #3f3f46")
      .style("border-radius", "8px")
      .style("padding", "8px 12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000)
      .style("font-size", "12px")

    // Draw links
    svg
      .append("g")
      .selectAll("path")
      .data(sankeyLinks)
      .enter()
      .append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", (d, i) => (i === 0 ? "#10b981" : "#34d399"))
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.max(1, (d as any).width))
      .style("cursor", "pointer")
      .on("mouseover", function (event, d: any) {
        d3.select(this).attr("stroke-opacity", 0.9)
        const sourceName = (d.source as any).name
        tooltip
          .style("opacity", 1)
          .html(
            `<span style="color: #a1a1aa;">${sourceName}:</span> <span style="color: #10b981; font-weight: 600;">${d.value}</span>`,
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mousemove", (event) => {
        tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-opacity", 0.6)
        tooltip.style("opacity", 0)
      })

    // Draw nodes
    svg
      .append("g")
      .selectAll("rect")
      .data(sankeyNodes)
      .enter()
      .append("rect")
      .attr("x", (d: any) => d.x0)
      .attr("y", (d: any) => d.y0)
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => Math.max(1, d.y1 - d.y0))
      .attr("fill", (d, i) => {
        if (i === 0) return "#10b981"
        if (i === 1) return "#34d399"
        return "#059669"
      })
      .attr("rx", 4)

    // Node labels
    svg
      .append("g")
      .selectAll("text")
      .data(sankeyNodes)
      .enter()
      .append("text")
      .attr("x", (d: any) => (d.x0 < width / 2 ? d.x0 - 6 : d.x1 + 6))
      .attr("y", (d: any) => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => (d.x0 < width / 2 ? "end" : "start"))
      .attr("fill", "#e4e4e7")
      .attr("font-size", "11px")
      .text((d: any) => d.name)

    // Value labels on nodes
    svg
      .append("g")
      .selectAll(".value-label")
      .data(sankeyNodes)
      .enter()
      .append("text")
      .attr("x", (d: any) => (d.x0 + d.x1) / 2)
      .attr("y", (d: any) => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .text((d: any) => d.value || total)

    return () => {
      tooltip.remove()
    }
  }, [player, dimensions, total])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">Progressive Actions</h3>
      </div>
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
      </div>
      <p className="mt-4 text-base text-zinc-400">
        <strong className="text-zinc-300">Takeaway:</strong> {player.name} recorded {total} total progressive actions
        this season. With {player.stats.progressiveCarries} carries ({carryRatio}%) and {player.stats.progressivePasses}{" "}
        passes ({passRatio}%),
        {dominantMethod === "carrying"
          ? ` they prefer advancing the ball through dribbling rather than passing, indicating a more direct playing style.`
          : ` they favor progressing play through passing, suggesting a playmaker role in build-up.`}
      </p>
    </div>
  )
}
