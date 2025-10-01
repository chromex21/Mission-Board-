#!/usr/bin/env node
const { spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');

const serverScript = path.resolve(__dirname, 'dev-json-server.cjs');
const server = spawn(process.execPath, [serverScript], { stdio: 'inherit' });

const HEALTH = 'http://localhost:4000/health';
const PROFILES = 'http://localhost:4000/profiles';

function waitForHealth(retries = 30) {
  return new Promise((resolve, reject) => {
    const attempt = async (n) => {
      try {
        const res = await fetch(HEALTH, { timeout: 2000 });
        if (res.ok) return resolve(true);
      } catch (e) {}
      if (n <= 0) return reject(new Error('Health check timed out'));
      setTimeout(() => attempt(n - 1), 500);
    };
    attempt(retries);
  });
}

(async () => {
  try {
    console.log('Waiting for dev JSON server to be healthy...');
    await waitForHealth(30);
    console.log('Server healthy. Posting test profile...');

    const profile = { name: 'Smoke Test User', email: `smoke-${Date.now()}@example.com` };
    const res = await fetch(PROFILES, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error(`POST /profiles failed: ${res.status}`);
    const body = await res.json();
    if (!Array.isArray(body) && !body.id && !body.length) {
      console.warn('Unexpected response:', body);
    }
    console.log('Smoke test succeeded. Cleaning up.');
  } catch (e) {
    console.error('Smoke test failed:', e);
    process.exitCode = 2;
  } finally {
    // attempt to kill the spawned server
    try { server.kill(); } catch(e){}
    process.exit();
  }
})();
