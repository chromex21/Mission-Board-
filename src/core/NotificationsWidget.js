// src/core/NotificationsWidget.js
import { clearNotifications } from './notifications.js';

export default function NotificationsWidget({ notifications = [], userId = null, onClear = null }) {
  const handleClear = () => {
    if (!userId) return;
    clearNotifications(userId);
    if (onClear) onClear();
  };

  return (
    <div className="notifications-widget">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Notifications</h3>
        <button className="btn secondary" onClick={handleClear}>Clear</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
        {notifications.length === 0 && <li className="small muted">No notifications</li>}
        {notifications.map(n => (
          <li key={n.id} style={{ padding: '0.45rem 0', borderBottom: '1px dashed var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>{n.message}</div>
              <div className="small muted">{n.timestamp ? new Date(n.timestamp).toLocaleString() : ''}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
