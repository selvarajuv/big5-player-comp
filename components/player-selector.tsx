"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Player } from "@/lib/types"

interface PlayerSelectorProps {
  players: Player[]
  selectedPlayer: Player | null
  onSelect: (player: Player) => void
  label: string
}

export function PlayerSelector({ players, selectedPlayer, onSelect, label }: PlayerSelectorProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700 hover:text-zinc-100"
        >
          {selectedPlayer ? (
            <span className="truncate">
              {selectedPlayer.name} ({selectedPlayer.team})
            </span>
          ) : (
            <span className="text-zinc-400">Search or select a player...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-zinc-800 border-zinc-700">
        <Command className="bg-zinc-800">
          <CommandInput placeholder="Search players..." className="text-zinc-100" />
          <CommandList>
            <CommandEmpty className="text-zinc-400 py-6 text-center text-sm">No player found.</CommandEmpty>
            <CommandGroup className="text-zinc-100">
              {players.map((player) => (
                <CommandItem
                  key={player.id}
                  value={`${player.name} ${player.team}`}
                  onSelect={() => {
                    onSelect(player)
                    setOpen(false)
                  }}
                  className="text-zinc-100 hover:bg-zinc-700 cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedPlayer?.id === player.id ? "opacity-100 text-emerald-500" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{player.name}</span>
                    <span className="text-xs text-zinc-400">
                      {player.team} • {player.position}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
