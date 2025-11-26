"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { IntroSection } from "@/components/intro-section"
import { DataSection } from "@/components/data-section"
import { PlayerColumn } from "@/components/player-column"
import { UniversalVisualizations } from "@/components/universal-visualizations"
import { SummarySection } from "@/components/summary-section"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { positions, leagues } from "@/lib/player-data"
import { usePlayerData } from "@/hooks/use-player-data"
import type { Player, Position, League } from "@/lib/types"

export default function Home() {
  const { players, teams, loading, error } = usePlayerData()

  const [player1, setPlayer1] = useState<Player | null>(null)
  const [player2, setPlayer2] = useState<Player | null>(null)
  const [positionFilter, setPositionFilter] = useState<Position | "All">("All")
  const [teamFilter, setTeamFilter] = useState<string>("All")
  const [leagueFilter, setLeagueFilter] = useState<League | "All">("All")

  useMemo(() => {
    if (players.length > 0 && !player1) {
      setPlayer1(players.find((p) => p.name === "Erling Haaland") || players[0])
    }
    if (players.length > 0 && !player2) {
      setPlayer2(players.find((p) => p.position === "Defender") || players[1])
    }
  }, [players, player1, player2])

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesPosition = positionFilter === "All" || player.position === positionFilter
      const matchesTeam = teamFilter === "All" || player.team === teamFilter
      const matchesLeague = leagueFilter === "All" || player.league === leagueFilter
      return matchesPosition && matchesTeam && matchesLeague
    })
  }, [players, positionFilter, teamFilter, leagueFilter])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading player data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>Error loading data: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <Header />

      <IntroSection />

      <DataSection players={players} />

      <UniversalVisualizations players={players} />

      <section className="py-12 px-4 bg-zinc-800/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2 text-center">Player Comparison Tool</h2>
          <p className="text-zinc-400 text-center mb-6 max-w-2xl mx-auto">
            Select two players below to compare their statistics side-by-side. Visualizations adapt based on player
            position (attackers vs defenders).
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Select value={leagueFilter} onValueChange={(v) => setLeagueFilter(v as League | "All")}>
              <SelectTrigger className="w-[160px] bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue placeholder="League" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="All" className="text-zinc-100">
                  All Leagues
                </SelectItem>
                {leagues.map((league) => (
                  <SelectItem key={league} value={league} className="text-zinc-100">
                    {league}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={positionFilter} onValueChange={(v) => setPositionFilter(v as Position | "All")}>
              <SelectTrigger className="w-[140px] bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="All" className="text-zinc-100">
                  All Positions
                </SelectItem>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos} className="text-zinc-100">
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="All" className="text-zinc-100">
                  All Teams
                </SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team} value={team} className="text-zinc-100">
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PlayerColumn
              players={filteredPlayers}
              selectedPlayer={player1}
              onSelect={setPlayer1}
              label="Select Player 1"
            />
            <PlayerColumn
              players={filteredPlayers}
              selectedPlayer={player2}
              onSelect={setPlayer2}
              label="Select Player 2"
            />
          </div>
        </div>
      </section>

      <SummarySection players={players} />

      <footer className="py-8 px-4 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center text-zinc-500 text-sm">
          <p>Big 5 Leagues Player Comparison | Data Source: FBref.com | 2022-23 Season</p>
        </div>
      </footer>
    </div>
  )
}
