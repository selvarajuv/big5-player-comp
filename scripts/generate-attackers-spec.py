"""
Generate Vega-Lite spec for Goals vs xG scatter chart using Altair.
This script creates the chart template that React will use with dynamic data.
"""

import altair as alt
import json

# Create sample data structure (React will replace this with actual data)
sample_data = [
    {"name": "Player", "team": "Team", "league": "League", "goals": 0, "xG": 0, "diff": 0, "performance": "Average"}
]

# Reference line data
line_data = [{"x": 0, "y": 0}, {"x": 35, "y": 35}]

# Create the reference line
reference_line = alt.Chart(alt.Data(values=line_data)).mark_line(
    strokeDash=[5, 5],
    color="#52525b"
).encode(
    x="x:Q",
    y="y:Q"
)

# Create the scatter plot
scatter = alt.Chart(alt.Data(values=sample_data)).mark_circle(
    opacity=0.7,
    size=100
).encode(
    x=alt.X("xG:Q", title="Expected Goals (xG)", axis=alt.Axis(labelColor="#a1a1aa", titleColor="#e4e4e7", gridColor="#3f3f46")),
    y=alt.Y("goals:Q", title="Actual Goals", axis=alt.Axis(labelColor="#a1a1aa", titleColor="#e4e4e7", gridColor="#3f3f46")),
    color=alt.Color(
        "performance:N",
        scale=alt.Scale(
            domain=["Overperformer", "Average", "Underperformer"],
            range=["#10b981", "#3b82f6", "#ef4444"]
        ),
        legend=alt.Legend(title="Performance", labelColor="#a1a1aa", titleColor="#e4e4e7", orient="bottom")
    ),
    tooltip=[
        alt.Tooltip("name:N", title="Player"),
        alt.Tooltip("team:N", title="Team"),
        alt.Tooltip("league:N", title="League"),
        alt.Tooltip("goals:Q", title="Goals"),
        alt.Tooltip("xG:Q", title="xG", format=".1f"),
        alt.Tooltip("diff:Q", title="G-xG", format="+.1f"),
    ]
)

# Layer the charts
chart = alt.layer(reference_line, scatter).properties(
    width="container",
    height=400,
    title=alt.Title(
        text="Goals vs Expected Goals (xG)",
        subtitle="Players above the diagonal are outperforming their xG",
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
with open("public/charts/goals-xg-spec.json", "w") as f:
    json.dump(spec, f, indent=2)

print("Generated: public/charts/goals-xg-spec.json")
