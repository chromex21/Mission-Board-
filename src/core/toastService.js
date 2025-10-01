let listeners = [];

export function subscribe(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

export function showToast({ message = '', type = 'info', timeout = 4000 } = {}) {
  const id = String(Date.now()) + Math.floor(Math.random() * 1000);
  const t = { id, message, type };
  listeners.forEach(l => {
    try { l(t); } catch (e) {}
  });
  if (timeout > 0) {
    setTimeout(() => {
      listeners.forEach(l => { try { l({ ...t, _remove: true }); } catch(e) {} });
    }, timeout);
  }
  return id;
}
