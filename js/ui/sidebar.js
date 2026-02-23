// Sidebar: company list + person list

import { state, subscribe, setActiveCompany, setActivePerson, addPerson, deletePerson, generateId } from '../state.js';
import { createDefaultPerson } from '../defaults.js';

let companyListEl = null;
let personListEl = null;

export function initSidebar() {
  companyListEl = document.getElementById('company-list');
  personListEl = document.getElementById('person-list');
  const addBtn = document.getElementById('btn-add-person');

  if (addBtn) {
    addBtn.addEventListener('click', handleAddPerson);
  }

  subscribe('companies:changed', renderCompanyList);
  subscribe('persons:changed', renderPersonList);
  subscribe('ui:companyChanged', () => {
    renderCompanyList();
    renderPersonList();
  });
  subscribe('ui:personChanged', renderPersonList);

  renderCompanyList();
  renderPersonList();
}

function renderCompanyList() {
  if (!companyListEl) return;
  companyListEl.innerHTML = '';

  state.companies.forEach(company => {
    const isActive = company.id === state.ui.activeCompanyId;
    const item = document.createElement('div');
    item.className = `sg-list-item${isActive ? ' sg-list-item--active' : ''}`;
    item.innerHTML = `
      <span class="sg-list-item__dot" style="background-color: ${company.colors.primary}"></span>
      <span class="sg-list-item__name">${escHtml(company.name)}</span>
    `;
    item.addEventListener('click', () => setActiveCompany(company.id));
    companyListEl.appendChild(item);
  });
}

function renderPersonList() {
  if (!personListEl) return;
  personListEl.innerHTML = '';

  const companyId = state.ui.activeCompanyId;
  if (!companyId) return;

  const persons = state.persons.filter(p => p.companyId === companyId);

  if (persons.length === 0) {
    personListEl.innerHTML = '<div class="sg-empty" style="padding:16px 0"><div class="sg-empty__text">Zatím žádné osoby</div></div>';
    return;
  }

  persons.forEach(person => {
    const isActive = person.id === state.ui.activePersonId;
    const item = document.createElement('div');
    item.className = `sg-list-item${isActive ? ' sg-list-item--active' : ''}`;
    item.innerHTML = `
      <span class="sg-list-item__name">${escHtml(person.name || 'Nová osoba')}</span>
      <button class="sg-list-item__delete" title="Smazat osobu">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      </button>
    `;

    const nameSpan = item.querySelector('.sg-list-item__name');
    nameSpan.addEventListener('click', () => setActivePerson(person.id));

    const deleteBtn = item.querySelector('.sg-list-item__delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Smazat osobu "${person.name || 'Nová osoba'}"?`)) {
        deletePerson(person.id);
      }
    });

    item.addEventListener('click', (e) => {
      if (!e.target.closest('.sg-list-item__delete')) {
        setActivePerson(person.id);
      }
    });

    personListEl.appendChild(item);
  });
}

function handleAddPerson() {
  const companyId = state.ui.activeCompanyId;
  if (!companyId) return;

  const newPerson = createDefaultPerson(companyId);
  newPerson.id = generateId('person');
  addPerson(newPerson);
  setActivePerson(newPerson.id);
}

function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
