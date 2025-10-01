import React, { useState } from 'react';
import { getProfile, updateProfile } from './profile.js';

export default function ProfilePage({ userId, onSave = null }) {
  const p = getProfile(userId) || {};
  const [name, setName] = useState(p.name || '');
  const [email] = useState(p.email || '');
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      await updateProfile(userId, { name });
      setMessage('Profile updated');
      if (onSave) onSave();
    } catch (e) {
      setMessage('Save failed');
    }
  };

  return (
    <div className="card">
      <div className="widget-title"><h3>Profile</h3></div>
      <div style={{ display: 'grid', gap: '0.6rem' }}>
        <label className="small muted">Name</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} />
        <label className="small muted">Email (read-only)</label>
        <input className="input" value={email} readOnly />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button className="btn" onClick={handleSave}>Save</button>
        </div>
        {message && <div className="small muted">{message}</div>}
      </div>
    </div>
  );
}
