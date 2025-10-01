// Browser-friendly storage using localStorage. Keeps a single JSON blob under a key.
const STORAGE_KEY = 'missions_board_data';

export function saveData(data) {
  try {
    // If REACT_APP_DATA_URL is configured, attempt remote save first (fire-and-forget)
    const remote = typeof process !== 'undefined' && process.env && process.env.REACT_APP_DATA_URL;
    const prevRaw = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
    const prev = prevRaw ? JSON.parse(prevRaw) : {};
    const merged = { ...prev, ...data };
    if (remote && typeof window !== 'undefined' && window.fetch) {
      // attempt remote POST; don't await to avoid blocking
      fetch(`${remote}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      }).catch(err => console.error('remote save failed', err));
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
  } catch (e) {
    // swallow in browser, or you can implement fallback
    console.error('saveData failed', e);
  }
}

export function loadData() {
  try {
    const remote = typeof process !== 'undefined' && process.env && process.env.REACT_APP_DATA_URL;
    if (remote && typeof window !== 'undefined' && window.fetch) {
      // we can synchronously try to use cached localStorage first, then background-fetch to replace it
      const raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        // kick off background refresh
        fetch(`${remote}/data`).then(r => r.json()).then(d => {
          if (d) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
        }).catch(() => {});
        return JSON.parse(raw);
      }
      // no local cache: attempt fetch (blocking via await isn't allowed here), so return empty and let app refresh later
    } else if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { missions: [], achievements: { points: 0, badges: [], streak: 0 }, profiles: [], teams: [], notificationsByUser: {} };
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('loadData failed', e);
  }
  return { missions: [], achievements: { points: 0, badges: [], streak: 0 }, profiles: [], teams: [], notificationsByUser: {} };
}

/**
 * Sync remote data from configured REACT_APP_DATA_URL into localStorage.
 * This is intended to be called once on app startup to ensure local cache is up-to-date.
 */
export async function syncRemoteData() {
  try {
    const remote = typeof process !== 'undefined' && process.env && process.env.REACT_APP_DATA_URL;
    if (remote && typeof window !== 'undefined' && window.fetch) {
      const res = await fetch(`${remote}/data`);
      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (e) {
    // ignore and allow app to continue with local data
    console.error('syncRemoteData failed', e);
  }
  return loadData();
}

/**
 * POST/PUT a single entity to the dev JSON server if configured, and update localStorage.
 * entity: 'profiles' | 'missions' | ...
 * payload: object or array
 */
export async function postEntity(entity, payload) {
  try {
    const remote = typeof process !== 'undefined' && process.env && process.env.REACT_APP_DATA_URL;
    // update local cache first
    const local = loadData();
    let updated = local;

    if (Array.isArray(payload)) {
      updated = { ...local, [entity]: payload };
    } else if (payload && payload.id) {
      const arr = (local[entity] || []).slice();
      const idx = arr.findIndex(x => x.id === payload.id);
      if (idx === -1) arr.push(payload);
      else arr[idx] = { ...arr[idx], ...payload };
      updated = { ...local, [entity]: arr };
    } else {
      // if payload has no id and is not array, append with generated id
      const arr = (local[entity] || []).slice();
      const obj = { ...payload, id: String(Date.now()) + Math.floor(Math.random() * 1000) };
      arr.push(obj);
      updated = { ...local, [entity]: arr };
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    if (remote && typeof window !== 'undefined' && window.fetch) {
      const res = await fetch(`${remote}/${entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        // attempt to parse body
        let body;
        try { body = await res.json(); } catch(e) { body = await res.text().catch(()=>null); }
        const err = new Error('postEntity failed');
        err.status = res.status;
        err.body = body;
        throw err;
      }
      return await res.json();
    }

    return updated[entity];
  } catch (e) {
    console.error('postEntity failed', e);
    return null;
  }
}

export async function fetchEntity(entity) {
  try {
    const remote = typeof process !== 'undefined' && process.env && process.env.REACT_APP_DATA_URL;
    if (remote && typeof window !== 'undefined' && window.fetch) {
      const res = await fetch(`${remote}/${entity}`);
      if (res.ok) {
        const j = await res.json();
        // update local cache
        const local = loadData();
        const merged = { ...local, [entity]: j };
        if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return j;
      }
    }
    const local = loadData();
    return local[entity] || [];
  } catch (e) {
    console.error('fetchEntity failed', e);
    return loadData()[entity] || [];
  }
}

// Helpers for persisting current user session (client-side only)
export function saveCurrentUserId(id) {
  try {
    saveData({ currentUserId: id });
  } catch (e) {
    console.error('saveCurrentUserId failed', e);
  }
}

export function loadCurrentUserId() {
  try {
    const d = loadData();
    return d && d.currentUserId ? d.currentUserId : null;
  } catch (e) {
    return null;
  }
}

export function clearCurrentUserId() {
  try {
    saveData({ currentUserId: null });
  } catch (e) {
    console.error('clearCurrentUserId failed', e);
  }
}
