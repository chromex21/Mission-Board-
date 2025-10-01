// src/core/events.js

import { awardPoints, updateStreak, checkBadges } from "./achievements.js";

let eventListeners = {};

export function on(event, callback) {
  if (!eventListeners[event]) {
    eventListeners[event] = [];
  }
  eventListeners[event].push(callback);
}

export function emit(event, payload) {
  if (eventListeners[event]) {
    eventListeners[event].forEach((callback) => callback(payload));
  }

  // 🔥 Hook Achievements into mission completion
  if (event === "mission:completed") {
    awardPoints(20);    // reward 20 pts per mission
    updateStreak();     // streak tracker
    checkBadges();      // unlock new badges
  }
}
