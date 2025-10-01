import React, { useEffect, useState } from 'react';
import '../styles/theme.scss';

export default function ThemeHeader({ currentUser, onLogout, onProfile }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : '');
  }, [dark]);

  return (
    <header style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'transparent' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ width:40, height:40, borderRadius:8, background:'var(--green)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>MB</div>
          <div style={{ fontWeight:700 }}>Mission Board</div>
        </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems:'center' }}>
          <button className="btn secondary" onClick={() => setDark(!dark)}>{dark ? 'Light' : 'Dark'}</button>
          {currentUser && <button className="btn" onClick={() => onProfile && onProfile()} >Profile</button>}
          {currentUser && <button className="btn" onClick={onLogout}>Logout</button>}
        </div>
      </div>
    </header>
  );
}
