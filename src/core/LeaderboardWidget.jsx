import React, { useState, useEffect } from "react";
import { getLeaderboard } from "./profile.js";

export default function LeaderboardWidget({ metric = "points" }) {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    setLeaders(getLeaderboard(metric));
  }, [metric]);

  return (
    <div className="widget">
      <h2>Leaderboard ({metric})</h2>
      <ol>
        {leaders.map((l, idx) => (
          <li key={l.id}>
            {idx + 1}. {l.name} — {l.value}
          </li>
        ))}
      </ol>
    </div>
  );
}
