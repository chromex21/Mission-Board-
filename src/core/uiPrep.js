// src/core/uiPrep.js
import { getMissionsFor } from './missions.js';
import { dedupeMissionsFor } from './missions.js';
import { getAchievements } from './achievements.js';
import { getTeams } from './teams.js';
import { getProfiles } from './profile.js';
import { getNotifications } from './notifications.js';

export function prepareTeams() {
  const profiles = getProfiles();
  return getTeams().map(t => ({
    id: t.id,
    name: t.name,
    members: t.members.map(memberId => profiles.find(p => p.id === memberId) || { id: memberId, name: "Unknown" }),
    missions: [...t.missions],
    createdAt: t.createdAt,
  }));
}

export function prepareUserDashboard(userId) {
  const profiles = getProfiles();
  // ensure duplicates are removed for this user on dashboard prepare
  try { dedupeMissionsFor('user', userId); } catch(e) {}

  return {
    missions: getMissionsFor('user', userId),
    achievements: getAchievements(userId),
    teams: getTeams().filter(team => team.members.includes(userId))
                     .map(t => ({
                        ...t,
                        members: t.members.map(mid => profiles.find(p => p.id === mid) || { id: mid, name: "Unknown" })
                     })),
    profiles,
    notifications: getNotifications(userId)
  };
}
