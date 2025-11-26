"use client"

import { useMemo } from "react"
import type { Player, League } from "@/lib/types"

interface SummarySectionProps {
  players: Player[]
}

export function SummarySection({ players }: SummarySectionProps) {
  // Calculate statistics for findings
  const stats = useMemo(() => {
    if (players.length === 0) return null

    // 1. xG Analysis - players with goals and xG
    const playersWithGoals = players.filter((p) => p.stats.goals > 0 || p.stats.xG > 0)
    const xGDiffs = playersWithGoals.map((p) => ({
      name: p.name,
      goals: p.stats.goals,
      xG: p.stats.xG,
      diff: p.stats.goals - p.stats.xG,
    }))
    const overperformers = xGDiffs.filter((p) => p.diff > 0).length
    const underperformers = xGDiffs.filter((p) => p.diff < 0).length
    const avgXGDiff = xGDiffs.reduce((sum, p) => sum + p.diff, 0) / xGDiffs.length
    const topOverperformer = xGDiffs.sort((a, b) => b.diff - a.diff)[0]
    const topUnderperformer = xGDiffs.sort((a, b) => a.diff - b.diff)[0]

    // 2. League-level patterns
    const leagues: League[] = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"]
    const leagueStats = leagues.map((league) => {
      const leaguePlayers = players.filter((p) => p.league === league)
      const avgGoals = leaguePlayers.reduce((sum, p) => sum + p.stats.goals, 0) / leaguePlayers.length
      const avgXG = leaguePlayers.reduce((sum, p) => sum + p.stats.xG, 0) / leaguePlayers.length
      const avgTackles = leaguePlayers.reduce((sum, p) => sum + p.stats.tackles, 0) / leaguePlayers.length
      return { league, avgGoals, avgXG, avgTackles, count: leaguePlayers.length }
    })
    const highestScoringLeague = leagueStats.sort((a, b) => b.avgGoals - a.avgGoals)[0]
    const mostDefensiveLeague = leagueStats.sort((a, b) => b.avgTackles - a.avgTackles)[0]

    // 3. Progressive play styles
    const playersWithProgressive = players.filter(
      (p) => p.stats.progressiveCarries > 0 || p.stats.progressivePasses > 0,
    )
    const carryDominant = playersWithProgressive.filter(
      (p) => p.stats.progressiveCarries > p.stats.progressivePasses,
    ).length
    const passDominant = playersWithProgressive.filter(
      (p) => p.stats.progressivePasses > p.stats.progressiveCarries,
    ).length
    const balanced = playersWithProgressive.length - carryDominant - passDominant
    const avgCarries =
      playersWithProgressive.reduce((sum, p) => sum + p.stats.progressiveCarries, 0) / playersWithProgressive.length
    const avgPasses =
      playersWithProgressive.reduce((sum, p) => sum + p.stats.progressivePasses, 0) / playersWithProgressive.length
    const topCarrier = players.sort((a, b) => b.stats.progressiveCarries - a.stats.progressiveCarries)[0]
    const topPasser = players.sort((a, b) => b.stats.progressivePasses - a.stats.progressivePasses)[0]

    // 4. Defensive archetypes
    const defenders = players.filter((p) => p.position === "Defender")
    const tacklers = defenders.filter((p) => p.stats.tackles > p.stats.interceptions).length
    const readers = defenders.filter((p) => p.stats.interceptions > p.stats.tackles).length
    const avgDefTackles = defenders.reduce((sum, p) => sum + p.stats.tackles, 0) / defenders.length
    const avgDefInterceptions = defenders.reduce((sum, p) => sum + p.stats.interceptions, 0) / defenders.length
    const topTackler = defenders.sort((a, b) => b.stats.tackles - a.stats.tackles)[0]
    const topInterceptor = defenders.sort((a, b) => b.stats.interceptions - a.stats.interceptions)[0]

    return {
      // xG stats
      playersWithGoals: playersWithGoals.length,
      overperformers,
      underperformers,
      avgXGDiff,
      topOverperformer,
      topUnderperformer,
      // League stats
      leagueStats,
      highestScoringLeague,
      mostDefensiveLeague,
      // Progressive stats
      carryDominant,
      passDominant,
      balanced,
      avgCarries,
      avgPasses,
      topCarrier,
      topPasser,
      carryPct: Math.round((carryDominant / playersWithProgressive.length) * 100),
      passPct: Math.round((passDominant / playersWithProgressive.length) * 100),
      // Defensive stats
      defenderCount: defenders.length,
      tacklers,
      readers,
      avgDefTackles,
      avgDefInterceptions,
      topTackler,
      topInterceptor,
      tacklerPct: Math.round((tacklers / defenders.length) * 100),
      readerPct: Math.round((readers / defenders.length) * 100),
    }
  }, [players])

  if (!stats) {
    return (
      <section className="py-16 px-4 bg-zinc-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">Key Findings & Conclusions</h2>
          <p className="text-zinc-400">Loading statistics...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-zinc-800/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-zinc-100 mb-6">Key Findings & Conclusions</h2>

        <div className="space-y-6">
          {/* Finding 1: xG Analysis */}
          <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
            <h3 className="text-lg font-semibold text-emerald-500 mb-3">1. Clinical Finishing vs Expected Goals</h3>
            <p className="text-zinc-300 text-base">
              Across {stats.playersWithGoals.toLocaleString()} players with goal involvement,{" "}
              {stats.overperformers.toLocaleString()} (
              {Math.round((stats.overperformers / stats.playersWithGoals) * 100)}%) outperformed their expected goals
              while {stats.underperformers.toLocaleString()} (
              {Math.round((stats.underperformers / stats.playersWithGoals) * 100)}%) underperformed. The average xG
              difference was {stats.avgXGDiff > 0 ? "+" : ""}
              {stats.avgXGDiff.toFixed(2)} goals.
              {stats.topOverperformer &&
                ` ${stats.topOverperformer.name} was the most clinical finisher, scoring ${stats.topOverperformer.goals} goals from just ${stats.topOverperformer.xG.toFixed(1)} xG (+${stats.topOverperformer.diff.toFixed(1)} difference).`}
            </p>
          </div>

          {/* Finding 2: League Patterns */}
          <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
            <h3 className="text-lg font-semibold text-emerald-500 mb-3">
              2. League-Level Scoring and Defensive Patterns
            </h3>
            <p className="text-zinc-300 text-base">
              {stats.highestScoringLeague.league} had the highest average goals per player (
              {stats.highestScoringLeague.avgGoals.toFixed(2)}), while {stats.mostDefensiveLeague.league} showed the
              highest defensive intensity with an average of {stats.mostDefensiveLeague.avgTackles.toFixed(1)} tackles
              per player. The five leagues varied significantly:{" "}
              {stats.leagueStats.map((l) => `${l.league} (${l.avgGoals.toFixed(2)} avg goals)`).join(", ")}. This
              suggests different tactical approaches and scoring opportunities across Europe's top competitions.
            </p>
          </div>

          {/* Finding 3: Progressive Play */}
          <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
            <h3 className="text-lg font-semibold text-emerald-500 mb-3">
              3. Progressive Play Styles: Carriers vs Passers
            </h3>
            <p className="text-zinc-300 text-base">
              {stats.carryPct}% of players favor progressive carries over passes, while {stats.passPct}% prefer passing
              to advance the ball. On average, players made {stats.avgCarries.toFixed(1)} progressive carries and{" "}
              {stats.avgPasses.toFixed(1)} progressive passes per season.
              {stats.topCarrier &&
                ` ${stats.topCarrier.name} led in progressive carries (${stats.topCarrier.stats.progressiveCarries}),`}
              {stats.topPasser &&
                ` while ${stats.topPasser.name} topped progressive passes (${stats.topPasser.stats.progressivePasses}).`}
            </p>
          </div>

          {/* Finding 4: Defensive Archetypes */}
          <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
            <h3 className="text-lg font-semibold text-emerald-500 mb-3">
              4. Defensive Archetypes: Tacklers vs Readers
            </h3>
            <p className="text-zinc-300 text-base">
              Among {stats.defenderCount} defenders analyzed, {stats.tacklerPct}% are "tacklers" (more tackles than
              interceptions) and {stats.readerPct}% are "readers of the game" (more interceptions than tackles).
              Defenders averaged {stats.avgDefTackles.toFixed(1)} tackles and {stats.avgDefInterceptions.toFixed(1)}{" "}
              interceptions per season.
              {stats.topTackler && ` ${stats.topTackler.name} led in tackles (${stats.topTackler.stats.tackles}),`}
              {stats.topInterceptor &&
                ` while ${stats.topInterceptor.name} topped interceptions (${stats.topInterceptor.stats.interceptions}).`}
            </p>
          </div>
        </div>

        {/* Limitations */}
        <div className="mt-8 p-6 bg-zinc-800 border border-zinc-700 rounded-xl">
          <h3 className="text-lg font-semibold text-zinc-300 mb-3">Limitations</h3>
          <p className="text-zinc-400 text-base">
            This analysis is based on a single season (2022-23) snapshot, which may not capture long-term player trends
            or consistency. Players with fewer than 90 minutes of play were excluded, potentially omitting promising
            young players or injured stars. Additionally, context such as team strength, opposition quality, and match
            importance is not factored into these statistics.
          </p>
        </div>

        {/* Future Work */}
        <div className="mt-4 p-6 bg-emerald-900/20 border border-emerald-800/50 rounded-xl">
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">Future Work</h3>
          <p className="text-zinc-300 text-base">
            Future iterations could incorporate multi-season data for trend analysis, enabling identification of players
            improving or declining over time. Additional visualizations such as pass networks, shot location maps, and
            pressure heatmaps would provide deeper tactical insights. Integrating per-90-minute normalization across all
            metrics would allow fairer comparisons between regular starters and squad rotation players.
          </p>
        </div>
      </div>
    </section>
  )
}
