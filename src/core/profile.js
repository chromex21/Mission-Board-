// src/core/profile.js
import { loadData, saveData, postEntity } from './storage.js';

const storage = loadData() || {};
let profiles = storage.profiles || [];

// --- Create profile ---
export async function createProfile(name, email, password = null, firebaseUid = null) {
  // prevent duplicate emails
  if (profiles.find(p => p.email === email)) {
    const err = new Error('Email already exists');
    err.code = 'EMAIL_EXISTS';
    throw err;
  }

  const newProfile = {
    id: String(Date.now()),
    name,
    email,
    // password is managed by Firebase for Email/Password users; keep null locally
    password: password || null,
    firebaseUid: firebaseUid || null,
    avatar: null,
    createdAt: new Date().toISOString(),
    achievements: { points: 0, streak: 0, badges: [] }
  };
  profiles.push(newProfile);
  saveData({ profiles });
  // attempt to post to remote entity endpoint and propagate errors
  await postEntity('profiles', newProfile);
  return newProfile;
}

// --- Update profile ---
export async function updateProfile(profileId, updates) {
  const p = profiles.find(p => p.id === profileId);
  if (!p) return null;

  // Password updates should be handled via Firebase Auth; ignore password field here
  if (updates.password) delete updates.password;

  Object.assign(p, updates);
  saveData({ profiles });
  await postEntity('profiles', p);
  return p;
}

// --- Get profile by ID ---
export function getProfile(profileId) {
  return profiles.find(p => p.id === profileId) || null;
}

// --- Get all profiles ---
export function getProfiles() {
  return [...profiles];
}

// --- Authenticate user ---
// Note: authentication is handled by Firebase Auth. Local authenticate removed.

// --- Leaderboard ---
export function getLeaderboard(metric = "points") {
  return profiles
    .map(p => ({
      id: p.id,
      name: p.name,
      value:
        metric === "points" ? p.achievements.points :
        metric === "streak" ? p.achievements.streak :
        p.achievements.badges.length
    }))
    .sort((a, b) => b.value - a.value);
}
