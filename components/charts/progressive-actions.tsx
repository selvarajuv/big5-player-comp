"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { Player } from "@/lib/types"

interface ProgressiveActionsProps {
  player: Player
}

export function ProgressiveActions({ player }: ProgressiveActionsProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const carries = player.stats.progressiveCarries
  const passes = player.stats.progressivePasses
  const total = carries + passes

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = 200
    const nodeWidth = 100
    const nodeHeight = 60

    // Gradient definition
    const defs = svg.append("defs")
    const gradient = defs
      .append("linearGradient")
      .attr("id", "flowGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%")

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#10b981").attr("stop-opacity", 0.6)
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#10b981").attr("stop-opacity", 0.3)

    // Left nodes
    const leftX = 20
    const carryY = 40
    const passY = 130

    // Carries box
    svg
      .append("rect")
      .attr("x", leftX)
      .attr("y", carryY)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("fill", "#059669")
      .attr("rx", 8)
    svg
      .append("text")
      .attr("x", leftX + nodeWidth / 2)
      .attr("y", carryY + 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(carries)
    svg
      .append("text")
      .attr("x", leftX + nodeWidth / 2)
      .attr("y", carryY + 45)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.8)")
      .attr("font-size", "12px")
      .text("Prog. Carries")

    // Passes box
    svg
      .append("rect")
      .attr("x", leftX)
      .attr("y", passY)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("fill", "#10b981")
      .attr("rx", 8)
    svg
      .append("text")
      .attr("x", leftX + nodeWidth / 2)
      .attr("y", passY + 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(passes)
    svg
      .append("text")
      .attr("x", leftX + nodeWidth / 2)
      .attr("y", passY + 45)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.8)")
      .attr("font-size", "12px")
      .text("Prog. Passes")

    // Right node
    const rightX = width - nodeWidth - 20
    const rightY = 70

    svg
      .append("rect")
      .attr("x", rightX)
      .attr("y", rightY)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("fill", "#047857")
      .attr("rx", 8)
    svg
      .append("text")
      .attr("x", rightX + nodeWidth / 2)
      .attr("y", rightY + 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .text(total)
    svg
      .append("text")
      .attr("x", rightX + nodeWidth / 2)
      .attr("y", rightY + 48)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(255,255,255,0.8)")
      .attr("font-size", "11px")
      .text("Total Progressive")

    // Flow paths using D3 link generator
    const linkGenerator = d3
      .linkHorizontal()
      .x((d: [number, number]) => d[0])
      .y((d: [number, number]) => d[1])

    // Carry flow
    const carryPath = linkGenerator({
      source: [leftX + nodeWidth, carryY + nodeHeight / 2] as [number, number],
      target: [rightX, rightY + nodeHeight / 2] as [number, number],
    })

    svg
      .append("path")
      .attr("d", carryPath)
      .attr("fill", "none")
      .attr("stroke", "url(#flowGradient)")
      .attr("stroke-width", Math.max(10, (carries / total) * 30))
      .attr("opacity", 0.7)

    // Pass flow
    const passPath = linkGenerator({
      source: [leftX + nodeWidth, passY + nodeHeight / 2] as [number, number],
      target: [rightX, rightY + nodeHeight / 2] as [number, number],
    })

    svg
      .append("path")
      .attr("d", passPath)
      .attr("fill", "none")
      .attr("stroke", "url(#flowGradient)")
      .attr("stroke-width", Math.max(10, (passes / total) * 30))
      .attr("opacity", 0.7)
  }, [player, carries, passes, total])

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Progressive Actions Flow</h3>
      <svg ref={svgRef} className="w-full" style={{ height: 200 }} />
    </div>
  )
}
