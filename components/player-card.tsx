import type { Player } from "@/lib/types"

interface PlayerCardProps {
  player: Player
}

export function PlayerCard({ player }: PlayerCardProps) {
  const initials = player.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-white">{initials}</span>
        </div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-1">{player.name}</h2>
        <p className="text-zinc-400 text-sm mb-4">
          {player.team} • {player.position} • {player.age} years
        </p>
        <div className="grid grid-cols-4 gap-4 w-full">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-500">{player.stats.goals}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide">Goals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-500">{player.stats.assists}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide">Assists</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-500">{player.stats.matches}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide">Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-500">{player.stats.minutes}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wide">Minutes</div>
          </div>
        </div>
      </div>
    </div>
  )
}
