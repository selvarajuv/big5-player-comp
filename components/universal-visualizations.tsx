"use client"

import type { Player } from "@/lib/types"
import { AltairGoalsXGScatter } from "./charts/altair-attackers-scatter"
import { AltairTopPerformers } from "./charts/altair-top-performers"
import { AltairDefendersScatter } from "./charts/altair-defenders-scatter"

interface UniversalVisualizationsProps {
  players: Player[]
}

export function UniversalVisualizations({ players }: UniversalVisualizationsProps) {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-zinc-100 mb-2 text-center">League-Wide Analysis</h2>
        <p className="text-zinc-400 text-base text-center mb-8 max-w-2xl mx-auto">
          Explore interactive visualizations showing trends across all Big 5 League players. Hover over data points for
          detailed player information.
        </p>

        <div className="space-y-8">
          {/* Top Performers */}
          <div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-4">Top Performers</h3>
            <AltairTopPerformers players={players} />
          </div>

          {/* Attacking Analysis */}
          <div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-4">Attacking Analysis</h3>
            <AltairGoalsXGScatter players={players} />
          </div>

          {/* Defensive Analysis */}
          <div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-4">Defensive Analysis</h3>
            <AltairDefendersScatter players={players} />
          </div>
        </div>
      </div>
    </section>
  )
}
