// src/components/MissionList.js
import React, { useState, useEffect, useCallback } from "react";
import { getMissionsFor, toggleMission, increaseProgress } from "./missions.js";

export default function MissionList({ userId, ownerType = "user", showHeader = true }) {
  const [missions, setMissions] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("");

  const loadMissions = useCallback(() => {
    const all = getMissionsFor(ownerType, userId);
    setMissions(all);
  }, [ownerType, userId]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const filtered = missions.filter(m => {
    const matchCategory =
      categoryFilter === "All" || m.category === categoryFilter;
    const matchPriority =
      priorityFilter === "All" || m.priority === priorityFilter;
    const matchTag =
      !tagFilter || (m.tags && m.tags.some(t => t.toLowerCase().includes(tagFilter.toLowerCase())));
    return matchCategory && matchPriority && matchTag;
  });

  const handleToggle = (id) => {
    toggleMission(id, ownerType, userId);
    loadMissions();
  };

  const handleProgress = (id) => {
    increaseProgress(id, ownerType, userId, 20);
    loadMissions();
  };

  return (
    <div className="mission-list">
      {showHeader && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Missions</h2>
          <div className="small muted">{filtered.length} shown</div>
        </div>
      )}

      <div className="filters" style={{ marginTop: '0.75rem', marginBottom: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label className="small muted">Category:</label>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option>All</option>
            <option>Personal</option>
            <option>Work</option>
            <option>Fitness</option>
            <option>Study</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label className="small muted">Priority:</label>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option>All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px' }}>
          <label className="small muted">Tag:</label>
          <input className="input" type="text" placeholder="Filter by tag..." value={tagFilter} onChange={e => setTagFilter(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect x="8" y="18" width="104" height="54" rx="6" fill="none" stroke="rgba(0,0,0,0.06)" />
            <circle cx="28" cy="40" r="6" fill="rgba(16,185,129,0.12)" />
            <rect x="44" y="36" width="56" height="4" rx="2" fill="rgba(0,0,0,0.06)" />
            <rect x="44" y="44" width="36" height="4" rx="2" fill="rgba(0,0,0,0.04)" />
          </svg>
          <div className="hint">No missions yet — add your first mission.</div>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filtered.map(m => (
            <li key={m.id} className={`mission-item`} style={{ marginBottom: '0.75rem' }}>
              <div className="mission-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar">{(m.title || '').slice(0,1).toUpperCase()}</div>
                      <div>
                        <div className="mission-title">{m.title}</div>
                        <div className="small muted">{m.category} • <span className={`badge-priority priority-${m.priority}`}>{m.priority}</span></div>
                      </div>
                    </div>

                    <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>{m.description}</p>

                    <div className="small muted" style={{ marginTop: '0.35rem' }}>
                      Created: {m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}{m.nextDueDate ? ` • Next: ${new Date(m.nextDueDate).toLocaleString()}` : ''}
                    </div>

                    {m.tags && m.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {m.tags.map(t => <span key={t} className="chip">{t}</span>)}
                      </div>
                    )}

                    <div style={{ marginTop: '0.75rem' }}>
                      <div className="progress">
                        <i style={{ width: `${m.progress || 0}%` }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div className="small muted">{m.progress || 0}%</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn" onClick={() => handleProgress(m.id)}>+ Progress</button>
                      <button className="btn secondary" onClick={() => handleToggle(m.id)}>{m.completed ? 'Undo' : 'Complete'}</button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
