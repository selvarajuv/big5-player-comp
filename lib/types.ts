export type Position = "Forward" | "Midfielder" | "Defender" | "Goalkeeper";

export type League =
  | "Premier League"
  | "La Liga"
  | "Serie A"
  | "Bundesliga"
  | "Ligue 1";

export interface PlayerStats {
  // Basic stats
  matches: number;
  starts: number;
  minutes: number;
  nineties: number;

  // Attacking stats
  goals: number;
  assists: number;
  xG: number;
  xAG: number;
  npxG: number;
  goalsPerNinety: number;
  assistsPerNinety: number;
  xGPerNinety: number;

  // Progressive actions
  progressiveCarries: number;
  progressivePasses: number;
  progressiveReceptions: number;

  // Defensive stats
  tackles: number;
  tacklesWon: number;
  interceptions: number;
  blocks: number;
  clearances: number;

  // Passing stats
  passesCompleted: number;
  passesAttempted: number;
  passCompletionPct: number;
  totalPassDist: number;
  progressivePassDist: number;

  shortPassesCompleted: number;
  shortPassesAttempted: number;
  shortPassCompletionPct: number;
  mediumPassesCompleted: number;
  mediumPassesAttempted: number;
  mediumPassCompletionPct: number;
  longPassesCompleted: number;
  longPassesAttempted: number;
  longPassCompletionPct: number;

  // Shot creating actions
  shotCreatingActions: number;
  goalCreatingActions: number;

  // Touches
  touches: number;
  touchesDefPen: number;
  touchesDefThird: number;
  touchesMidThird: number;
  touchesAttThird: number;
  touchesAttPen: number;

  // Shots
  shots: number;
  shotsOnTarget: number;
  shotsOnTargetPct: number;

  // Dribbles
  dribbles: number;
  dribblesSuccess: number;
  dribblesAttempted: number;

  // Carries
  carries: number;
  carriesProgressive: number;

  // Aerial duels
  aerialWins: number;
  aerialLosses: number;
  aerialWinPct: number;

  // Cards
  yellowCards: number;
  redCards: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: Position;
  age: number;
  nation: string;
  league: League;
  stats: PlayerStats;
}
