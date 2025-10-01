// src/App.js
import React, { useState, useEffect } from "react";
import { getProfiles, createProfile as addProfile, getProfile } from "./core/profile.js";
import { prepareUserDashboard } from "./core/uiPrep.js";
import { saveCurrentUserId, loadCurrentUserId, clearCurrentUserId, syncRemoteData } from "./core/storage.js";
import ThemeHeader from './core/ThemeHeader.js';
import './styles/theme.scss';
import MissionForm from "./core/MissionForm.js";
import MissionList from "./core/MissionList.js";
import AchievementsWidget from "./core/AchievementsWidget.js";
import NotificationsWidget from "./core/NotificationsWidget.js";
import TeamWidget from "./core/TeamWidget.js";
import LeaderboardWidget from "./core/LeaderboardWidget.jsx";
import ProfilePage from './core/ProfilePage.js';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from './firebase.js';
import Toaster from './core/Toaster.js';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

function MainAppRouter() {
  const [, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [regMessage, setRegMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await syncRemoteData();
      setProfiles(getProfiles());
      const id = loadCurrentUserId();
      if (id) {
        const p = getProfile(id);
        if (p) setCurrentUser(p);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (currentUser) setDashboard(prepareUserDashboard(currentUser.id));
  }, [currentUser]);

  const handleLogin = async () => {
    try {
      const cred = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      const fuser = cred.user;
      const email = fuser.email;
      let local = getProfiles().find(p => p.email === email);
      if (!local) {
        local = await addProfile(fuser.displayName || email.split('@')[0], email, null);
        setProfiles(getProfiles());
      }
      setCurrentUser(local);
      saveCurrentUserId(local.id);
      navigate('/');
    } catch (err) {
      console.error('Login failed', err);
      setRegMessage('Invalid email or password');
    }
  };

  const handleRegister = async () => {
    if (!usernameInput || !emailInput || !passwordInput) { setRegMessage('Please fill all fields to register.'); return; }
    try {
      const cred = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
      const fuser = cred.user;
      await addProfile(usernameInput, emailInput, null, fuser.uid);
      setProfiles(getProfiles());
      await signOut(auth);
      setRegMessage('Registration successful. Please sign in using your email and password.');
      setPasswordInput(''); setUsernameInput(''); setEmailInput('');
    } catch (err) {
      console.error('Registration failed', err);
      if (err && err.code === 'auth/email-already-in-use') setRegMessage('Email already in use. Did you mean to sign in?');
      else setRegMessage('Registration failed (see console)');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const email = user.email;
      const name = user.displayName || email.split('@')[0];
      let local = getProfiles().find(p => p.email === email);
      if (!local) { local = await addProfile(name, email, null, user.uid); setProfiles(getProfiles()); }
      setCurrentUser(local);
      saveCurrentUserId(local.id);
      navigate('/');
    } catch (err) { console.error('Google sign-in error', err); setRegMessage('Google sign-in failed'); }
  };

  const handleLogout = () => { setCurrentUser(null); clearCurrentUserId(); navigate('/'); };

  if (loading) return <div style={{ padding: '2rem' }}>Loading…</div>;
  if (!currentUser) {
    return (
      <div style={{ padding: '2rem', maxWidth: '480px', margin: '0 auto' }}>
        <div className="card">
          <h1 style={{ marginTop: 0 }}>Welcome</h1>
          <p className="muted">Sign in or create an account to manage your missions.</p>
          <div style={{ marginTop: '1rem' }}>
            <button className="btn" onClick={handleGoogleSignIn} style={{ width: '100%', marginBottom: '0.5rem' }}>Sign in with Google</button>
          </div>
          <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
          <div>
            <label className="small muted">Email</label>
            <input className="input" type="email" placeholder="Email" value={emailInput} onChange={e => setEmailInput(e.target.value)} />
            <label className="small muted" style={{ marginTop: '0.5rem' }}>Password</label>
            <input className="input" type="password" placeholder="Password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn" onClick={handleLogin}>Sign in</button>
              <button className="btn secondary" onClick={handleRegister}>Create account</button>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div className="small muted">Quick register</div>
            <input className="input" type="text" placeholder="Username (for account)" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} />
          </div>
          {regMessage ? <div style={{ marginTop: '0.75rem', color: 'var(--green-600)' }}>{regMessage}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div>
      <ThemeHeader currentUser={currentUser} onLogout={handleLogout} onProfile={() => navigate('/profile')} />

      <main className="container">
        <Routes>
          <Route path="/" element={(
            <div className="grid">
              <div>
                <div className="card create-mission-card" style={{ marginBottom: '1rem' }}>
                  <div className="widget-title"><h2>Create Mission</h2><div className="small muted">Add a new mission</div></div>
                  <MissionForm userId={currentUser.id} onSave={() => setDashboard(prepareUserDashboard(currentUser.id))} />
                </div>

                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="widget-title"><h2>Missions</h2><div className="small muted">Active mission tasks</div></div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <MissionList userId={currentUser.id} showHeader={false} />
                  </div>
                </div>

                <div className="card" style={{ marginTop: '1rem' }}>
                  <div className="widget-title"><h3>Achievements</h3></div>
                  <AchievementsWidget achievements={dashboard?.achievements} />
                </div>

                <div style={{ height: 16 }} />
              </div>

              <aside>
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="widget-title"><h3>Leaderboard</h3></div>
                  <LeaderboardWidget metric="points" />
                  <div style={{ marginTop: '0.5rem' }}>
                    <LeaderboardWidget metric="streak" />
                  </div>
                </div>

                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="widget-title"><h3>Teams</h3></div>
                  <TeamWidget teams={dashboard?.teams} />
                </div>

                <div className="card">
                  <div className="widget-title"><h3>Notifications</h3></div>
                  <NotificationsWidget notifications={dashboard?.notifications} userId={currentUser.id} onClear={() => setDashboard(prepareUserDashboard(currentUser.id))} />
                </div>
              </aside>
            </div>
          )} />

          <Route path="/profile" element={(
            <div>
              <button className="btn secondary" onClick={() => navigate('/') } style={{ marginBottom: '1rem' }}>Back to dashboard</button>
              <ProfilePage userId={currentUser.id} onSave={() => setDashboard(prepareUserDashboard(currentUser.id))} />
            </div>
          )} />
        </Routes>
      </main>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainAppRouter />
    </BrowserRouter>
  );
}
                  <div className="widget-title"><h2>Missions</h2><div className="small muted">Active mission tasks</div></div>
