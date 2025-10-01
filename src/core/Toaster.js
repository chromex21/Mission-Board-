import React, { useEffect, useState } from 'react';
import { subscribe } from './toastService.js';

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsub = subscribe((t) => {
      if (t._remove) {
        setToasts(prev => prev.filter(x => x.id !== t.id));
      } else {
        setToasts(prev => [t, ...prev].slice(0, 5));
      }
    });
    return unsub;
  }, []);

  return (
    <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 9999, display: 'flex', flexDirection: 'column-reverse', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} style={{ minWidth: 220, padding: '0.6rem 0.9rem', borderRadius: 10, boxShadow: '0 8px 26px rgba(0,0,0,0.12)', background: 'white' }}>
          <div style={{ fontWeight: 700 }}>{t.type === 'achievement' ? 'Achievement' : t.type === 'error' ? 'Error' : 'Info'}</div>
          <div style={{ marginTop: 4 }}>{t.message}</div>
        </div>
      ))}
    </div>
  );
}
