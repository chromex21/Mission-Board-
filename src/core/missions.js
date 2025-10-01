// src/core/missions.js
import { loadData, saveData, postEntity } from "./storage.js";
import { notifyMissionUpdate } from "./notifications.js";
import { awardPoints, updateStreak, checkBadges } from "./achievements.js";

const storage = loadData() || {};
let missions = storage.missions || [];

export function getMissionsFor(ownerType, ownerId, filters = {}) {
  return missions
    .filter(m => m.ownerType === ownerType && m.ownerId === ownerId)
    .filter(m => {
      if (filters.category && filters.category !== "All" && m.category !== filters.category) return false;
      if (filters.priority && filters.priority !== "All" && m.priority !== filters.priority) return false;
      if (filters.tags && filters.tags.length > 0 && !filters.tags.some(t => m.tags?.includes(t))) return false;
      return true;
    });
}

// remove exact-title duplicates for a given owner (keep newest by createdAt)
export function dedupeMissionsFor(ownerType, ownerId) {
  const userMissions = missions.filter(m => m.ownerType === ownerType && m.ownerId === ownerId);
  const seen = {};
  // keep missions with newest createdAt when titles duplicate
  userMissions.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const keep = [];
  for (const m of userMissions) {
    const key = (m.title || '').trim().toLowerCase();
    if (!seen[key]) {
      seen[key] = true;
      keep.push(m);
    }
  }
  // replace user's missions with deduped set (keep global order: newest first)
  missions = missions.filter(m => !(m.ownerType === ownerType && m.ownerId === ownerId));
  missions = [...keep, ...missions];
  saveData({ missions });
  (async () => { try { await postEntity('missions', missions); } catch(e){} })();
  return keep;
}

export function addMission({
  title = "Untitled",
  description = "",
  category = "Personal",
  points = 10,
  ownerType = "user",
  ownerId,
  recurrence = null,
  customInterval = 0,
  priority = "medium",
  tags = []
}) {
  const newMission = {
    id: String(Date.now()),
    title,
    description,
    category,
    points,
    ownerType,
    ownerId,
    completed: false,
    progress: 0,
    createdAt: new Date().toISOString(),
    recurrence,
    customInterval,
    priority,
    tags,
    nextDueDate: recurrence ? new Date().toISOString() : null
  };

  missions.unshift(newMission);
  saveData({ missions });
  (async () => { try { await postEntity('missions', newMission); } catch(e){} })();
  notifyMissionUpdate(newMission, ownerId);
  return newMission;
}

export function toggleMission(id, ownerType, ownerId) {
  const m = missions.find(m => m.id === id && m.ownerType === ownerType && m.ownerId === ownerId);
  if (!m) return null;

  m.completed = !m.completed;

  if (m.completed) {
    awardPoints(ownerId, m.points);
    updateStreak(ownerId);
    checkBadges(ownerId);

    if (m.recurrence) {
      let nextDate = new Date();
      if (m.recurrence === "daily") nextDate.setDate(nextDate.getDate() + 1);
      else if (m.recurrence === "weekly") nextDate.setDate(nextDate.getDate() + 7);
      else if (m.recurrence === "custom" && m.customInterval > 0) {
        nextDate.setDate(nextDate.getDate() + m.customInterval);
      }
      m.nextDueDate = nextDate.toISOString();
      m.completed = false;
      m.progress = 0;
    }
  }

  saveData({ missions });
  (async () => { try { await postEntity('missions', m); } catch(e){} })();
  notifyMissionUpdate(m, ownerId);
  return m;
}

export function increaseProgress(id, ownerType, ownerId, amount = 10) {
  const m = missions.find(m => m.id === id && m.ownerType === ownerType && m.ownerId === ownerId);
  if (!m) return null;

  m.progress = Math.min(100, (m.progress || 0) + amount);

  if (m.progress >= 100 && !m.completed) {
    m.completed = true;
    awardPoints(ownerId, m.points);
    updateStreak(ownerId);
    checkBadges(ownerId);
  }

  saveData({ missions });
  (async () => { try { await postEntity('missions', m); } catch(e){} })();
  notifyMissionUpdate(m, ownerId);
  return m;
}

export function updateMission(id, updates, ownerType, ownerId) {
  const m = missions.find(m => m.id === id && m.ownerType === ownerType && m.ownerId === ownerId);
  if (!m) return null;
  Object.assign(m, updates);
  saveData({ missions });
  (async () => { try { await postEntity('missions', m); } catch(e){} })();
  return m;
}

export function removeMission(id, ownerType, ownerId) {
  const index = missions.findIndex(m => m.id === id && m.ownerType === ownerType && m.ownerId === ownerId);
  if (index === -1) return false;
  missions.splice(index, 1);
  saveData({ missions });
  (async () => { try { await postEntity('missions', missions); } catch(e){} })();
  return true;
}
