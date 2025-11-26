"use client"

import { useState, useEffect } from "react"
import type { Player } from "@/lib/types"
import { fetchPlayerData } from "@/lib/player-data"

export function usePlayerData() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchPlayerData()
        setPlayers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load player data")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const teams = [...new Set(players.map((p) => p.team))].sort()

  return { players, teams, loading, error }
}
