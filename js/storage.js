// localStorage abstraction with siggen_ prefix

const PREFIX = 'siggen_';

function getKey(key) {
  return PREFIX + key;
}

export function loadData(key) {
  try {
    const raw = localStorage.getItem(getKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return null;
  }
}

export function saveData(key, data) {
  try {
    localStorage.setItem(getKey(key), JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

export function clearAll() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(k => localStorage.removeItem(k));
}

// Export all data as JSON object
export function exportAllData() {
  return {
    companies: loadData('companies'),
    persons: loadData('persons'),
    signatureConfigs: loadData('signatureConfigs'),
    ui: loadData('ui'),
    exportedAt: new Date().toISOString(),
    version: 1
  };
}

// Import data from JSON object
export function importAllData(data) {
  if (!data || !data.companies || !data.persons) {
    throw new Error('Neplatný formát dat');
  }
  saveData('companies', data.companies);
  saveData('persons', data.persons);
  if (data.signatureConfigs) saveData('signatureConfigs', data.signatureConfigs);
  if (data.ui) saveData('ui', data.ui);
}
