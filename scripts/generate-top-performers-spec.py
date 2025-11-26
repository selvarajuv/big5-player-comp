"""
Generate Vega-Lite spec for Top Performers bar chart using Altair.
This script creates the chart template that React will use with dynamic data.
"""

import altair as alt
import json

# Create sample data structure (React will replace this with actual data)
sample_data = [
    {"name": "Player", "team": "Team", "league": "League", "value": 0, "rank": 1}
]

# Create the Altair chart
chart = alt.Chart(alt.Data(values=sample_data)).mark_bar(
    cornerRadiusEnd=4,
    color="#059669"
).encode(
    y=alt.Y("name:N", title=None, sort="-x", axis=alt.Axis(labelColor="#e4e4e7", labelLimit=120)),
    x=alt.X("value:Q", title="Goals", axis=alt.Axis(labelColor="#a1a1aa", titleColor="#e4e4e7", gridColor="#3f3f46")),
    tooltip=[
        alt.Tooltip("rank:Q", title="Rank"),
        alt.Tooltip("name:N", title="Player"),
        alt.Tooltip("team:N", title="Team"),
        alt.Tooltip("league:N", title="League"),
        alt.Tooltip("value:Q", title="Value"),
    ]
).properties(
    width="container",
    height=400,
    title=alt.Title(
        text="Top Players by Goals",
        color="#e4e4e7"
    ),
    background="transparent"
).configure_view(
    stroke=None
)

# Export the Vega-Lite spec
spec = chart.to_dict()

# Save to public/charts directory
with open("public/charts/top-performers-spec.json", "w") as f:
    json.dump(spec, f, indent=2)

print("Generated: public/charts/top-performers-spec.json")
