import { loadData, saveData } from './storage.js';

const storage = loadData() || {};
let users = storage.users || []; // array of { username, passwordHash, profileId }
let currentUser = storage.currentUser || null;

// Simple demo security helpers. In production replace with a secure backend.
export function register(username, password, profileId) {
  if (users.find(u => u.username === username)) {
    throw new Error('Username already exists');
  }
  const newUser = {
    username,
    passwordHash: btoa(password), // demo only
    profileId
  };
  users.push(newUser);
  saveData({ users });
  return newUser;
}

export function login(username, password) {
  const user = users.find(u => u.username === username);
  if (!user || user.passwordHash !== btoa(password)) return null;
  currentUser = user;
  saveData({ currentUser });
  return user;
}

export function logout() {
  currentUser = null;
  saveData({ currentUser });
}

export function getCurrentUser() {
  return currentUser;
}
