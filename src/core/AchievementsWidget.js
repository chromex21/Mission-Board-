import React from "react";

export default function AchievementsWidget({ achievements }) {
  if (!achievements) return null;

  return (
    <div className="widget achievements">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>🏆 Achievements</h3>
        <div className="small muted">Level {achievements.level}</div>
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="small muted">Points</div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{achievements.points}</div>
          </div>
          <div style={{ flex: 1, marginLeft: '1rem' }}>
            <div className="progress">
              <i style={{ width: `${(achievements.points % 100) || 0}%` }} />
            </div>
            <div className="small muted" style={{ marginTop: '0.25rem' }}>{achievements.points % 100} / 100 to next level</div>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <div className="small muted">Badges</div>
          <div style={{ marginTop: '0.5rem' }}>
            {achievements.badges.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{achievements.badges.map(b => <span key={b} className="chip">{b}</span>)}</div>
            ) : (
              <div className="empty-state" style={{ padding: '0.5rem' }}>
                <svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <rect x="6" y="10" width="68" height="40" rx="6" fill="none" stroke="rgba(0,0,0,0.06)" />
                  <path d="M20 34 L28 22 L36 34 L48 14" stroke="rgba(16,185,129,0.12)" strokeWidth="3" fill="none" />
                </svg>
                <div className="hint">No badges yet — complete missions to earn badges.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
