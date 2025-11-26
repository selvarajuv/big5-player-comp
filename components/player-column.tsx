"use client"

import type { Player } from "@/lib/types"
import { PlayerSelector } from "./player-selector"
import { PlayerCard } from "./player-card"
import { RadarChart } from "./charts/radar-chart"
import { XGComparison } from "./charts/xg-comparison"
import { ProgressiveSankey } from "./charts/progressive-sankey"
import { PassOriginHeatmap } from "./charts/pass-origin-heatmap"
import { DefensivePie } from "./charts/defensive-pie"
import { PassCompletion } from "./charts/pass-completion"

interface PlayerColumnProps {
  players: Player[]
  selectedPlayer: Player | null
  onSelect: (player: Player) => void
  label: string
}

export function PlayerColumn({ players, selectedPlayer, onSelect, label }: PlayerColumnProps) {
  const isAttacker = selectedPlayer?.position === "Forward" || selectedPlayer?.position === "Midfielder"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="text-sm font-medium text-zinc-400 mb-2 block">{label}</label>
        <PlayerSelector players={players} selectedPlayer={selectedPlayer} onSelect={onSelect} label={label} />
      </div>

      {selectedPlayer && (
        <div className="flex flex-col gap-6 transition-all duration-300">
          <PlayerCard player={selectedPlayer} />

          {isAttacker ? (
            <>
              <RadarChart player={selectedPlayer} type="attacker" />
              <XGComparison player={selectedPlayer} />
              <ProgressiveSankey player={selectedPlayer} />
            </>
          ) : (
            <>
              <RadarChart player={selectedPlayer} type="defender" />
              <PassOriginHeatmap player={selectedPlayer} />
              <DefensivePie player={selectedPlayer} />
              <PassCompletion player={selectedPlayer} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
