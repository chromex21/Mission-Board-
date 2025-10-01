// src/core/teams.js
import { loadData, saveData } from "./storage.js";
import { getProfiles } from "./profile.js";

// Initialize teams from storage or empty
const storage = loadData() || {};
let teams = storage.teams || [];

export function createTeam(name) {
  const newTeam = {
    id: String(Date.now()),
    name,
    members: [],
    missions: [],
    createdAt: new Date().toISOString(),
  };
  teams.push(newTeam);
  saveData({ teams });
  return newTeam;
}

export function addMember(teamId, profileId) {
  const team = teams.find(t => t.id === teamId);
  const profile = getProfiles().find(p => p.id === profileId);
  if (!team || !profile) return null;
  if (!team.members.includes(profileId)) team.members.push(profileId);
  saveData({ teams });
  return team;
}

export function removeMember(teamId, profileId) {
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;
  team.members = team.members.filter(id => id !== profileId);
  saveData({ teams });
  return team;
}

export function assignMission(teamId, missionId) {
  const team = teams.find(t => t.id === teamId);
  if (!team) return null;
  if (!team.missions.includes(missionId)) team.missions.push(missionId);
  saveData({ teams });
  return team;
}

export function getTeams() {
  return [...teams];
}

export function getTeamsWithProfiles() {
  const profiles = getProfiles();
  return teams.map(team => ({
    ...team,
    members: team.members.map(id => profiles.find(p => p.id === id) || { id, name: "Unknown" })
  }));
}
