"""
Generate Vega-Lite spec for Defenders scatter chart using Altair.
This script creates the chart template that React will use with dynamic data.
"""

import altair as alt
import json

# Create sample data structure (React will replace this with actual data)
sample_data = [
    {"name": "Player", "team": "Team", "league": "Premier League", "tackles": 0, "interceptions": 0, "clearances": 0, "blocks": 0, "totalDefensive": 0}
]

chart = alt.Chart(alt.Data(values=sample_data)).mark_point(
    size=400,
    filled=True,
    opacity=0.7
).encode(
    x=alt.X("tackles:Q", title="Tackles", axis=alt.Axis(labelColor="#a1a1aa", titleColor="#e4e4e7", gridColor="#3f3f46")),
    y=alt.Y("interceptions:Q", title="Interceptions", axis=alt.Axis(labelColor="#a1a1aa", titleColor="#e4e4e7", gridColor="#3f3f46")),
    color=alt.Color(
        "league:N",
        scale=alt.Scale(
            domain=["Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1"],
            range=["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]
        ),
        legend=alt.Legend(title="League", labelColor="#a1a1aa", titleColor="#e4e4e7", orient="bottom")
    ),
    tooltip=[
        alt.Tooltip("name:N", title="Player"),
        alt.Tooltip("team:N", title="Team"),
        alt.Tooltip("league:N", title="League"),
        alt.Tooltip("tackles:Q", title="Tackles"),
        alt.Tooltip("interceptions:Q", title="Interceptions"),
        alt.Tooltip("clearances:Q", title="Clearances"),
        alt.Tooltip("blocks:Q", title="Blocks"),
    ]
).properties(
    width="container",
    height=400,
    title=alt.Title(
        text="Top Defenders: Tackles vs Interceptions",
        subtitle="Defensive contribution analysis across Big 5 Leagues",
        color="#e4e4e7",
        subtitleColor="#a1a1aa"
    ),
    background="transparent"
).configure_view(
    stroke=None
)

# Export the Vega-Lite spec
spec = chart.to_dict()

# Save to public/charts directory
with open("public/charts/defenders-spec.json", "w") as f:
    json.dump(spec, f, indent=2)

print("Generated: public/charts/defenders-spec.json")
