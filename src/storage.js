const STORAGE_KEY = 'monthlyTasks.tasks';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function createTask(task) {
  const tasks = readAll();
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
  const newTask = { id, createdAt: new Date().toISOString(), ...task };
  tasks.push(newTask);
  writeAll(tasks);
  return newTask;
}

export function createMany(rawTasks) {
  const tasks = readAll();
  const nowIso = new Date().toISOString();
  const makeKey = (t) => [t.date || '', (t.project || '').trim().toLowerCase(), (t.title || '').trim().toLowerCase(), (t.assignedBy || '').trim().toLowerCase(), (t.description || '').trim().toLowerCase()].join('|');
  const existing = new Set(tasks.map(makeKey));
  let added = 0;
  for (const t of rawTasks) {
    const key = makeKey(t);
    if (existing.has(key)) continue;
    existing.add(key);
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    tasks.push({ id, createdAt: nowIso, ...t });
    added += 1;
  }
  writeAll(tasks);
  return { added };
}

export function updateTask(id, updates) {
  const tasks = readAll();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...updates };
  writeAll(tasks);
  return tasks[idx];
}

export function deleteTask(id) {
  const tasks = readAll();
  const next = tasks.filter(t => t.id !== id);
  writeAll(next);
}

export function listTasksByDateRange(startDate, endDate) {
  const tasks = readAll();
  return tasks
    .filter(t => t.date >= startDate && t.date <= endDate)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function subscribe(callback) {
  const handler = (e) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}


