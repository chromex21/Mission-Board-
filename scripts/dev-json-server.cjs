#!/usr/bin/env node
// Hardened dev JSON server (CommonJS) for local file persistence
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 4000;
const DATA_PATH = path.resolve(__dirname, '..', 'data.json');

app.use(express.json({ limit: '1mb' }));

// CORS headers for browser
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      const initial = {
        missions: [],
        achievements: { points: 0, streak: 0, badges: [] },
        profiles: [],
        teams: [],
        notificationsByUser: {},
        currentUserId: null
      };
      // atomic write
      const tmp = DATA_PATH + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(initial, null, 2), 'utf-8');
      fs.renameSync(tmp, DATA_PATH);
      console.log('Initialized new data file at', DATA_PATH);
    }
  } catch (e) {
    console.error('Failed to initialize data file', e);
    throw e;
  }
}

function readData() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    console.error('Failed to read data.json', e);
    return {};
  }
}

function writeData(obj) {
  try {
    const tmp = DATA_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf-8');
    fs.renameSync(tmp, DATA_PATH);
    return true;
  } catch (e) {
    console.error('Failed to write data.json', e);
    return false;
  }
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/data', (req, res) => {
  const d = readData();
  res.json(d);
});

// POST /data - merge shallowly with existing data
app.post('/data', (req, res) => {
  try {
    const incoming = req.body || {};
    const existing = readData();
    // If incoming contains profiles, ensure no duplicate emails
    if (incoming.profiles) {
      const incomingProfiles = Array.isArray(incoming.profiles) ? incoming.profiles : [incoming.profiles];
      const existingProfiles = existing.profiles || [];
      for (const p of incomingProfiles) {
        if (!p.email) continue;
        const dup = existingProfiles.find(ep => ep.email === p.email && ep.id !== p.id);
        if (dup) return res.status(409).json({ error: 'duplicate email', email: p.email });
      }
    }

    const merged = { ...existing, ...incoming };
    const ok = writeData(merged);
    if (!ok) return res.status(500).json({ error: 'write failed' });
    res.json(merged);
  } catch (e) {
    console.error('POST /data error', e);
    res.status(500).json({ error: 'internal' });
  }
});

// ENTITY: profiles
app.get('/profiles', (req, res) => {
  const d = readData();
  res.json(d.profiles || []);
});

app.post('/profiles', (req, res) => {
  try {
    const incoming = req.body || [];
    const existing = readData();
    const profiles = Array.isArray(incoming) ? incoming : [incoming];
    const mergedProfiles = existing.profiles || [];
    // Validate duplicate emails: incoming profiles cannot use an email already owned by another profile
    for (const p of profiles) {
      if (!p.email) continue;
      const dup = mergedProfiles.find(ep => ep.email === p.email && ep.id !== p.id);
      if (dup) return res.status(409).json({ error: 'duplicate email', email: p.email });
    }

    // For each incoming profile: if id exists, update; else push
    profiles.forEach(p => {
      if (!p.id) p.id = String(Date.now()) + Math.floor(Math.random() * 1000);
      const idx = mergedProfiles.findIndex(x => x.id === p.id);
      if (idx === -1) mergedProfiles.push(p);
      else mergedProfiles[idx] = { ...mergedProfiles[idx], ...p };
    });

    const ok = writeData({ ...existing, profiles: mergedProfiles });
    if (!ok) return res.status(500).json({ error: 'write failed' });
    res.json(mergedProfiles);
  } catch (e) {
    console.error('POST /profiles error', e);
    res.status(500).json({ error: 'internal' });
  }
});

// ENTITY: missions
app.get('/missions', (req, res) => {
  const d = readData();
  res.json(d.missions || []);
});

app.post('/missions', (req, res) => {
  try {
    const incoming = req.body || [];
    const existing = readData();
    const missions = Array.isArray(incoming) ? incoming : [incoming];
    const mergedMissions = existing.missions || [];

    missions.forEach(m => {
      if (!m.id) m.id = String(Date.now()) + Math.floor(Math.random() * 1000);
      const idx = mergedMissions.findIndex(x => x.id === m.id);
      if (idx === -1) mergedMissions.push(m);
      else mergedMissions[idx] = { ...mergedMissions[idx], ...m };
    });

    const ok = writeData({ ...existing, missions: mergedMissions });
    if (!ok) return res.status(500).json({ error: 'write failed' });
    res.json(mergedMissions);
  } catch (e) {
    console.error('POST /missions error', e);
    res.status(500).json({ error: 'internal' });
  }
});

// Global error handlers and graceful shutdown
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception in dev-json-server:', err);
  // don't exit immediately - log and attempt to continue
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection in dev-json-server:', reason);
});

function startServer(port, attemptsLeft = 5) {
  try {
    const server = app.listen(port, () => {
      console.log(`Dev JSON server listening on http://localhost:${port}`);
      console.log(`Data file: ${DATA_PATH}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        console.warn(`Port ${port} in use, trying ${port + 1}... (${attemptsLeft - 1} attempts left)`);
        setTimeout(() => startServer(port + 1, attemptsLeft - 1), 300);
        return;
      }
      console.error('Server error:', err);
      process.exitCode = 1;
    });

    const shutdown = () => {
      console.log('Shutting down dev-json-server...');
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 2000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    return server;
  } catch (e) {
    console.error('Failed to start server', e);
    if (attemptsLeft > 0) return startServer(port + 1, attemptsLeft - 1);
    process.exitCode = 1;
  }
}

// Ensure data file exists before starting
try { ensureDataFile(); } catch (e) { console.error('Unable to ensure data file:', e); }

startServer(DEFAULT_PORT);
