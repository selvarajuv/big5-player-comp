import type { Player, Position, League } from "./types"

// Parse CSV data
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split("\n")
  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })
    rows.push(row)
  }
  return rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())

  return result
}

// Process raw data into Player objects
function processPlayerData(rows: Record<string, string>[]): Player[] {
  const players: Player[] = []
  const seenPlayers = new Set<string>()
  const parseNum = (val: string): number => Number.parseFloat(val) || 0

  for (const row of rows) {
    const validLeagues = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"]
    if (!validLeagues.includes(row.Comp)) continue

    const minutes = parseNum(row.Min?.replace(",", ""))
    if (minutes < 90) continue

    const playerId = `${row.Player}-${row.Squad}`.replace(/\s/g, "-")
    if (seenPlayers.has(playerId)) continue
    seenPlayers.add(playerId)

    const pos = row.Pos || ""
    let position: Position = "Midfielder"

    if (pos.startsWith("DF")) {
      position = "Defender"
    } else if (pos.startsWith("FW")) {
      position = "Forward"
    } else if (pos === "GK") {
      position = "Goalkeeper"
    } else if (pos.startsWith("MF") || pos.includes("MF")) {
      position = "Midfielder"
    }

    players.push({
      id: playerId,
      name: row.Player || "",
      team: row.Squad || "",
      position,
      age: parseNum(row.Age),
      nation: row.Nation || "",
      league: row.Comp as League,
      stats: {
        matches: parseNum(row.MP),
        starts: parseNum(row.Starts),
        minutes,
        nineties: parseNum(row["90s"]),
        goals: parseNum(row.Gls),
        assists: parseNum(row.Ast),
        xG: parseNum(row.xG),
        xAG: parseNum(row.xAG),
        npxG: parseNum(row.npxG),
        goalsPerNinety: parseNum(row["Gls.1"]),
        assistsPerNinety: parseNum(row["Ast.1"]),
        xGPerNinety: parseNum(row["xG.1"]),
        progressiveCarries: parseNum(row.PrgC),
        progressivePasses: parseNum(row.PrgP),
        progressiveReceptions: parseNum(row.PrgR),
        tackles: parseNum(row.Tkl),
        tacklesWon: parseNum(row.TklW),
        interceptions: parseNum(row.Int),
        blocks: parseNum(row.Blocks),
        clearances: parseNum(row.Clr),
        passesCompleted: parseNum(row.Cmp),
        passesAttempted: parseNum(row.Att),
        passCompletionPct: parseNum(row["Cmp%"]),
        totalPassDist: parseNum(row.TotDist),
        progressivePassDist: parseNum(row.PrgDist),
        shortPassesCompleted: parseNum(row["Cmp.1"]),
        shortPassesAttempted: parseNum(row["Att.1"]),
        shortPassCompletionPct: parseNum(row["Cmp%.1"]),
        mediumPassesCompleted: parseNum(row["Cmp.2"]),
        mediumPassesAttempted: parseNum(row["Att.2"]),
        mediumPassCompletionPct: parseNum(row["Cmp%.2"]),
        longPassesCompleted: parseNum(row["Cmp.3"]),
        longPassesAttempted: parseNum(row["Att.3"]),
        longPassCompletionPct: parseNum(row["Cmp%.3"]),
        shotCreatingActions: parseNum(row.SCA),
        goalCreatingActions: parseNum(row.GCA),
        touches: parseNum(row.Touches),
        touchesDefPen: parseNum(row["Def Pen"]),
        touchesDefThird: parseNum(row["Def 3rd"]),
        touchesMidThird: parseNum(row["Mid 3rd"]),
        touchesAttThird: parseNum(row["Att 3rd"]),
        touchesAttPen: parseNum(row["Att Pen"]),
        shots: parseNum(row.Sh),
        shotsOnTarget: parseNum(row.SoT),
        shotsOnTargetPct: parseNum(row["SoT%"]),
        dribbles: parseNum(row.Succ),
        dribblesSuccess: parseNum(row.Succ),
        dribblesAttempted: parseNum(row.Succ) + parseNum(row.Tkld),
        carries: parseNum(row.Carries),
        carriesProgressive: parseNum(row.PrgC),
        aerialWins: parseNum(row.Won),
        aerialLosses: parseNum(row.Lost),
        aerialWinPct: parseNum(row["Won%"]),
        yellowCards: parseNum(row.CrdY),
        redCards: parseNum(row.CrdR),
      },
    })
  }

  return players
}

export async function fetchPlayerData(): Promise<Player[]> {
  const response = await fetch("/data/big5-combined-2022-23.csv")
  const csvText = await response.text()
  const rows = parseCSV(csvText)
  return processPlayerData(rows)
}

export function getTeams(players: Player[]): string[] {
  return [...new Set(players.map((p) => p.team))].sort()
}

export function getLeagues(): League[] {
  return ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"]
}

export const positions: Array<"Forward" | "Midfielder" | "Defender" | "Goalkeeper"> = [
  "Forward",
  "Midfielder",
  "Defender",
  "Goalkeeper",
]

export const leagues: League[] = ["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"]
