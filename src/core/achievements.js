// src/core/achievements.js

/**
 * Achievements & Rewards System
 * - Tracks points, levels, badges, and streaks
 * - Should hook into missions.js + events.js
 */

// In-memory (later we sync with storage.js)
let achievements = {
  points: 0,
  level: 1,
  streak: 0,
  lastCompletedDate: null,
  badges: [],
};

// --- Helper: Calculate level based on points ---
function calculateLevel(points) {
  return Math.floor(points / 100) + 1; // every 100 pts = new level
}

// --- Award points ---
export function awardPoints(amount = 10) {
  achievements.points += amount;
  achievements.level = calculateLevel(achievements.points);
  return achievements;
}

// --- Track streaks ---
export function updateStreak() {
  const today = new Date().toDateString();
  if (achievements.lastCompletedDate === today) {
    return achievements; // already counted today
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (achievements.lastCompletedDate === yesterday.toDateString()) {
    achievements.streak += 1; // continue streak
  } else {
    achievements.streak = 1; // reset streak
  }

  achievements.lastCompletedDate = today;
  return achievements;
}

// --- Award badges ---
export function checkBadges() {
  const { points, streak, badges } = achievements;

  const unlock = (badge) => {
    if (!badges.includes(badge)) {
      badges.push(badge);
    }
  };

  if (points >= 100) unlock("Rookie");       // 100 pts earned
  if (points >= 500) unlock("Pro");          // 500 pts earned
  if (streak >= 7) unlock("One Week Streak"); // 7-day streak
  if (streak >= 30) unlock("Monthly Master"); // 30-day streak

  return achievements;
}

// --- Get all achievements ---
export function getAchievements() {
  return { ...achievements };
}
