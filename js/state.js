// Centralized state management with pub/sub

const listeners = {};

export const state = {
  companies: [],
  persons: [],
  signatureConfigs: {},
  ui: {
    activeCompanyId: null,
    activePersonId: null,
    activeTab: 'company',
    previewClient: 'live'
  }
};

export function subscribe(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
  return () => {
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  };
}

export function emit(event, data) {
  (listeners[event] || []).forEach(cb => cb(data));
}

// Generate unique ID
export function generateId(prefix = 'id') {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

// Company mutations
export function setCompanies(companies) {
  state.companies = companies;
  emit('companies:changed', state.companies);
}

export function updateCompany(id, updates) {
  const idx = state.companies.findIndex(c => c.id === id);
  if (idx === -1) return;
  state.companies[idx] = { ...state.companies[idx], ...updates, updatedAt: new Date().toISOString() };
  emit('company:updated', state.companies[idx]);
  emit('companies:changed', state.companies);
}

// Person mutations
export function setPersons(persons) {
  state.persons = persons;
  emit('persons:changed', state.persons);
}

export function addPerson(person) {
  state.persons.push(person);
  emit('persons:changed', state.persons);
  emit('person:added', person);
}

export function updatePerson(id, updates) {
  const idx = state.persons.findIndex(p => p.id === id);
  if (idx === -1) return;
  state.persons[idx] = { ...state.persons[idx], ...updates, updatedAt: new Date().toISOString() };
  emit('person:updated', state.persons[idx]);
  emit('persons:changed', state.persons);
}

export function deletePerson(id) {
  state.persons = state.persons.filter(p => p.id !== id);
  emit('persons:changed', state.persons);
  emit('person:deleted', id);
  if (state.ui.activePersonId === id) {
    setActivePerson(null);
  }
}

// Signature config mutations
export function setSignatureConfigs(configs) {
  state.signatureConfigs = configs;
  emit('signatureConfigs:changed', state.signatureConfigs);
}

export function updateSignatureConfig(companyId, updates) {
  if (!state.signatureConfigs[companyId]) return;
  state.signatureConfigs[companyId] = { ...state.signatureConfigs[companyId], ...updates };
  emit('signatureConfig:updated', state.signatureConfigs[companyId]);
  emit('signatureConfigs:changed', state.signatureConfigs);
}

// UI mutations
export function setActiveCompany(id) {
  state.ui.activeCompanyId = id;
  // Reset active person when switching companies
  const companyPersons = state.persons.filter(p => p.companyId === id);
  if (companyPersons.length > 0 && (!state.ui.activePersonId || !companyPersons.find(p => p.id === state.ui.activePersonId))) {
    state.ui.activePersonId = companyPersons[0].id;
  } else if (companyPersons.length === 0) {
    state.ui.activePersonId = null;
  }
  emit('ui:companyChanged', id);
  emit('ui:personChanged', state.ui.activePersonId);
}

export function setActivePerson(id) {
  state.ui.activePersonId = id;
  emit('ui:personChanged', id);
}

export function setActiveTab(tab) {
  state.ui.activeTab = tab;
  emit('ui:tabChanged', tab);
}

export function setPreviewClient(client) {
  state.ui.previewClient = client;
  emit('ui:previewClientChanged', client);
}

// Getters
export function getActiveCompany() {
  return state.companies.find(c => c.id === state.ui.activeCompanyId) || null;
}

export function getActivePerson() {
  return state.persons.find(p => p.id === state.ui.activePersonId) || null;
}

export function getActiveSignatureConfig() {
  return state.signatureConfigs[state.ui.activeCompanyId] || null;
}

export function getCompanyPersons(companyId) {
  return state.persons.filter(p => p.companyId === companyId);
}
