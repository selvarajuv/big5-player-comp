"use client"

import { useMemo, useRef, useEffect, useState } from "react"
import * as d3 from "d3"
import type { Player } from "@/lib/types"

interface DataSectionProps {
  players: Player[]
}

function MiniBarChart({
  data,
  color = "#10b981",
  xLabel,
  yLabel,
}: {
  data: { label: string; value: number }[]
  color?: string
  xLabel: string
  yLabel: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0 || !mounted) return

    const width = 380
    const height = 180
    const margin = { top: 20, right: 15, bottom: 50, left: 50 }

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    svg.attr("width", width).attr("height", height)

    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const maxValue = d3.max(data, (d) => d.value) || 0

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.3)

    const yScale = d3.scaleLinear().domain([0, maxValue]).range([innerHeight, 0])

    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)

    // Bars
    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => xScale(d.label) || 0)
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.value))
      .attr("fill", color)
      .attr("rx", 3)

    // Value labels on top of bars
    g.selectAll(".value-label")
      .data(data)
      .join("text")
      .attr("class", "value-label")
      .attr("x", (d) => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.value) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#e4e4e7")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .text((d) => d.value)

    // X-axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "10px")
      .attr("transform", "rotate(-20)")
      .attr("text-anchor", "end")
      .attr("dx", "-0.2em")
      .attr("dy", "0.5em")

    g.selectAll(".domain").attr("stroke", "#52525b")
    g.selectAll(".tick line").attr("stroke", "#52525b")

    // Y-axis
    g.append("g").call(d3.axisLeft(yScale).ticks(5)).selectAll("text").attr("fill", "#a1a1aa").attr("font-size", "10px")

    svg
      .append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "11px")
      .text(xLabel)

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + innerHeight / 2))
      .attr("y", 14)
      .attr("text-anchor", "middle")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "11px")
      .text(yLabel)
  }, [data, color, mounted, xLabel, yLabel])

  return (
    <div ref={containerRef} className="w-[380px] h-[180px]">
      <svg ref={svgRef}></svg>
    </div>
  )
}

export function DataSection({ players }: DataSectionProps) {
  const stats = useMemo(() => {
    if (players.length === 0) return null

    const leagueCounts: Record<string, number> = {}
    const positionCounts: Record<string, number> = {}
    let totalGoals = 0
    let totalAssists = 0
    let totalxG = 0

    players.forEach((p) => {
      const league = p.league || "Unknown"
      leagueCounts[league] = (leagueCounts[league] || 0) + 1
      positionCounts[p.position] = (positionCounts[p.position] || 0) + 1
      totalGoals += p.stats.goals
      totalAssists += p.stats.assists
      totalxG += p.stats.xG
    })

    const leagueData = Object.entries(leagueCounts)
      .map(([label, value]) => ({
        label: label.replace(" League", "").replace("Premier", "PL"),
        value,
      }))
      .sort((a, b) => b.value - a.value)

    const positionData = Object.entries(positionCounts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)

    return {
      totalPlayers: players.length,
      leagueData,
      positionData,
      avgGoals: (totalGoals / players.length).toFixed(2),
      avgAssists: (totalAssists / players.length).toFixed(2),
      avgxG: (totalxG / players.length).toFixed(2),
      topLeague: leagueData[0]?.label || "N/A",
      topLeagueCount: leagueData[0]?.value || 0,
    }
  }, [players])

  if (!stats) {
    return (
      <section className="py-12 px-4 bg-zinc-800/30">
        <div className="max-w-5xl mx-auto text-center text-zinc-400">Loading data statistics...</div>
      </section>
    )
  }

  return (
    <section className="py-12 px-4 bg-zinc-800/30">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <h2 className="text-2xl font-bold text-zinc-100 mb-6 text-center">About the Data</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 w-full max-w-3xl">
          <div className="bg-zinc-800 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-emerald-500">{stats.totalPlayers.toLocaleString()}</p>
            <p className="text-zinc-400 text-base">Total Players</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-emerald-500">5</p>
            <p className="text-zinc-400 text-base">Leagues Covered</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-emerald-500">{stats.avgGoals}</p>
            <p className="text-zinc-400 text-base">Avg Goals/Player</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-emerald-500">{stats.avgxG}</p>
            <p className="text-zinc-400 text-base">Avg xG/Player</p>
          </div>
        </div>

        <div className="mb-8 w-full max-w-3xl text-center">
          <h3 className="text-lg font-semibold text-emerald-500 mb-3">Data Source</h3>
          <p className="text-zinc-400 text-base leading-relaxed mb-4">
            This dataset comes from FBref.com, aggregating comprehensive statistics from Europe's top 5 leagues for the
            2022-23 season. Players with fewer than 90 minutes are excluded to ensure statistical relevance.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <a
              href="https://fbref.com/en/comps/Big5/stats/players/Big-5-European-Leagues-Stats"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400 underline text-base"
            >
              FBref Big 5 European Leagues Stats
            </a>
            <span className="text-zinc-600">|</span>
            <a
              href="https://statsbomb.com/what-we-do/hub/metrics/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400 underline text-base"
            >
              StatsBomb Metrics Explained
            </a>
          </div>
        </div>

        <div className="mb-8 w-full max-w-3xl text-center">
          <h3 className="text-lg font-semibold text-emerald-500 mb-3">Data Filtering</h3>
          <ul className="text-zinc-400 space-y-1 text-base text-center">
            <li>
              <span className="text-zinc-300">Minimum 90 minutes played</span> - ensures meaningful sample size
            </li>
            <li>
              <span className="text-zinc-300">Goalkeepers excluded</span> - different stat profile from outfield players
            </li>
            <li>
              <span className="text-zinc-300">Positions grouped</span> - FW, MF, DF based on primary role
            </li>
          </ul>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mb-8 justify-center items-center">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-emerald-500 mb-3">Players by League</h3>
            <MiniBarChart data={stats.leagueData} color="#10b981" xLabel="League" yLabel="Number of Players" />
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-emerald-500 mb-3">Players by Position</h3>
            <MiniBarChart data={stats.positionData} color="#6366f1" xLabel="Position" yLabel="Number of Players" />
          </div>
        </div>

        <div className="mb-8 w-full max-w-3xl">
          <h3 className="text-lg font-semibold text-emerald-500 mb-3 text-center">Key Metric Definitions</h3>
          <ul className="text-zinc-400 space-y-2 text-base text-center">
            <li>
              <span className="text-zinc-300 font-medium">xG (Expected Goals):</span> Probability a shot becomes a goal
              based on shot quality.
            </li>
            <li>
              <span className="text-zinc-300 font-medium">xAG (Expected Assists):</span> Likelihood a pass leads to a
              goal based on the resulting shot.
            </li>
            <li>
              <span className="text-zinc-300 font-medium">Progressive Carries:</span> Dribbles moving the ball 10+ yards
              toward goal.
            </li>
            <li>
              <span className="text-zinc-300 font-medium">Progressive Passes:</span> Passes moving the ball 10+ yards
              toward goal.
            </li>
            <li>
              <span className="text-zinc-300 font-medium">Per-90 Stats:</span> Metrics normalized to 90 minutes for fair
              comparison.
            </li>
          </ul>
        </div>

        <div className="w-full max-w-3xl">
          <h3 className="text-lg font-semibold text-emerald-500 mb-3 text-center">Metric Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-base">
            <div className="bg-zinc-800 p-4 rounded-lg">
              <p className="text-zinc-300 font-medium">Attacking</p>
              <p className="text-zinc-500">Goals, Assists, xG, Shots</p>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <p className="text-zinc-300 font-medium">Progressive</p>
              <p className="text-zinc-500">Carries & passes advancing ball</p>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <p className="text-zinc-300 font-medium">Defensive</p>
              <p className="text-zinc-500">Tackles, interceptions, blocks</p>
            </div>
            <div className="bg-zinc-800 p-4 rounded-lg">
              <p className="text-zinc-300 font-medium">Passing</p>
              <p className="text-zinc-500">Completion by distance</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
