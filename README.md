# Premier League Player Comparison

A web application for comparing football players across the Big 5 European leagues (2022-23 season).

## Features

- **Side-by-side player comparison** with searchable dropdowns
- **Filter by:** League, Position, Team
- **Position-specific visualizations** (different charts for attackers vs defenders)
- **5 interactive visualizations** per player including radar charts, shot maps, heatmaps, and more

## Tech Stack

- **React** + TypeScript
- **Recharts** / D3.js / Vega-Lite for visualizations
- **Python** + Pandas for data processing
- **2,889 players** across Premier League, La Liga, Bundesliga, Serie A, Ligue 1

## Data

**Source:** Big 5 European leagues 2022-23 season statistics

**Key Metrics:**

- Attacking: Goals, Assists, xG, Shots, Dribbles, Progressive Actions
- Defending: Tackles, Interceptions, Blocks, Clearances, Aerial Duels
- Possession: Touches by zone, Pass completion by range

## Visualizations

### Attackers

1. Radar Chart - Performance profile
2. Shot Map - Shot locations on pitch
3. xG vs Actual Goals - Efficiency comparison
4. Touch Heatmap - Activity zones
5. Progressive Actions Flow - Ball advancement

### Defenders

1. Radar Chart - Defensive profile
2. Pass Origin Heatmap - Passing zones
3. Defensive Actions - Pie chart breakdown
4. Tackle Heatmap - Tackle locations
5. Pass Completion - By range (short/medium/long)
