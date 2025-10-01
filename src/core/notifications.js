import { loadData, saveData } from './storage.js';
import { showToast } from './toastService.js';

const storage = loadData() || {};
let notificationsByUser = storage.notificationsByUser || {};

export function addNotification(userId, type = 'generic', message) {
  if (!notificationsByUser[userId]) notificationsByUser[userId] = [];

  const now = Date.now();
  // dedupe: if the most recent notification for this user has same type+message within 30s, skip
  const recent = notificationsByUser[userId][0];
  if (recent && recent.type === type && recent.message === message) {
    const age = now - new Date(recent.timestamp).getTime();
    if (age < 30 * 1000) {
      // update timestamp instead of adding duplicate
      recent.timestamp = new Date().toISOString();
      saveData({ notificationsByUser });
      return recent;
    }
  }

  const notif = {
    id: String(now) + Math.floor(Math.random() * 1000),
    type,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };

  notificationsByUser[userId].unshift(notif);
  // cap stored notifications to 100 per user to avoid unbounded growth
  if (notificationsByUser[userId].length > 100) notificationsByUser[userId] = notificationsByUser[userId].slice(0, 100);

  saveData({ notificationsByUser });
  return notif;
}

export function markAsRead(userId, notifId) {
  const userNotifs = notificationsByUser[userId];
  if (!userNotifs) return;
  const notif = userNotifs.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
    saveData({ notificationsByUser });
  }
}

export function getNotifications(userId, onlyUnread = false) {
  const userNotifs = notificationsByUser[userId] || [];
  return onlyUnread ? userNotifs.filter(n => !n.read) : [...userNotifs];
}

export function notifyMissionUpdate(mission, userId) {
  const message = mission.completed
    ? `Mission "${mission.title}" completed!`
    : `Progress updated for mission "${mission.title}" (${mission.progress}%).`;
  const notif = addNotification(userId, 'mission', message);
  // show transient toast for completions and full progress updates (not every small progress)
  if (mission.completed || (mission.progress && mission.progress >= 100)) {
    try { showToast({ message, type: 'mission', timeout: 4000 }); } catch(e){}
  }
  return notif;
}

export function notifyAchievementUnlocked(badge, userId) {
  const message = `Badge unlocked: ${badge}`;
  const notif = addNotification(userId, 'achievement', message);
  try { showToast({ message, type: 'achievement', timeout: 5000 }); } catch(e){}
  return notif;
}

export function clearNotifications(userId) {
  notificationsByUser[userId] = [];
  saveData({ notificationsByUser });
}
