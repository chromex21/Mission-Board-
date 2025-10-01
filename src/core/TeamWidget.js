// src/core/TeamWidget.js
import React from "react";

export default function TeamWidget({ teams }) {
  if (!teams || teams.length === 0) {
    return (
      <div style={styles.card}>
        <h2>Teams</h2>
        <p>No teams yet. Join or create one!</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2>Teams</h2>
      <ul style={styles.list}>
        {teams.map((team) => (
          <li key={team.id} style={styles.listItem}>
            <strong>{team.name}</strong>
            <br />
            Members: {team.members.map((m) => m.name).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    backgroundColor: "#fafafa",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    marginBottom: "0.5rem",
  },
};
