"use client"
import type { Position, League } from "@/lib/types"

interface HeaderProps {
  positionFilter: Position | "All"
  teamFilter: string
  leagueFilter: League | "All"
  onPositionChange: (value: Position | "All") => void
  onTeamChange: (value: string) => void
  onLeagueChange: (value: League | "All") => void
  teams: string[]
}

export function Header({
  positionFilter,
  teamFilter,
  leagueFilter,
  onPositionChange,
  onTeamChange,
  onLeagueChange,
  teams,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100">
            Big 5 Leagues Player Comparison <span className="text-emerald-500">2022-23</span>
          </h1>
        </div>
      </div>
    </header>
  )
}
