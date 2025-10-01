#!/usr/bin/env node
// Simple dev JSON server for local file persistence
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_PATH = path.resolve(__dirname, '..', 'data.json');

app.use(express.json());

// CORS headers for browser
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function readData() {
  if (!fs.existsSync(DATA_PATH)) return {};
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    console.error('Failed to read data.json', e);
    return {};
  }
}

function writeData(obj) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(obj, null, 2), 'utf-8');
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
  const incoming = req.body || {};
  const existing = readData();
  const merged = { ...existing, ...incoming };
  const ok = writeData(merged);
  if (!ok) return res.status(500).json({ error: 'write failed' });
  res.json(merged);
});

app.listen(PORT, () => {
  console.log(`Dev JSON server listening on http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_PATH}`);
});
