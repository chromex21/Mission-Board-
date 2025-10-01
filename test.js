import pkg from "./src/core/missions.js";
const { addMission, getMissions, toggleMission } = pkg;

import storage from "./src/core/storage.js";
const { saveMissions, loadMissions } = storage;

import events from "./src/core/events.js";
const { emit, on } = events;


// Quick self-test file (not run in production). Use the exported functions from core to run isolated tests.
