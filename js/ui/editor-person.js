// Person editor panel

import { subscribe, updatePerson, getActivePerson, generateId } from '../state.js';

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const PERSON_FIELDS = {
  'person-name': 'name',
  'person-position': 'position',
  'person-email': 'email',
  'person-phone-mobile': 'phoneMobile',
  'person-phone-office': 'phoneOffice',
  'person-photo': 'photoUrl'
};

const VISIBILITY_FIELDS = [
  { key: 'name', label: 'Jméno', disabled: true },
  { key: 'position', label: 'Pozice' },
  { key: 'email', label: 'E-mail' },
  { key: 'phoneMobile', label: 'Mobil' },
  { key: 'phoneOffice', label: 'Telefon kancelář' },
  { key: 'photo', label: 'Fotografie' },
  { key: 'companyLogo', label: 'Logo firmy' },
  { key: 'companyWeb', label: 'Web firmy' },
  { key: 'companyAddress', label: 'Adresa firmy' },
  { key: 'companyPhone', label: 'Telefon firmy' },
  { key: 'companyEmail', label: 'E-mail firmy' },
  { key: 'socialLinks', label: 'Sociální sítě' },
  { key: 'customFields', label: 'Vlastní pole' }
];

export function initPersonEditor() {
  subscribe('ui:personChanged', populatePersonEditor);
  subscribe('person:updated', () => {}); // handled via preview update
}

export function populatePersonEditor() {
  const container = document.getElementById('person-editor-content');
  if (!container) return;

  const person = getActivePerson();
  if (!person) {
    container.innerHTML = `
      <div class="sg-empty">
        <div class="sg-empty__icon">👤</div>
        <div class="sg-empty__text">Vyberte osobu ze seznamu nebo přidejte novou</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="sg-card">
      <div class="sg-card__title">Kontaktní údaje</div>
      <div class="sg-form-group">
        <label class="sg-label">Jméno a příjmení</label>
        <input type="text" class="sg-input" id="person-name" placeholder="Jan Novák" value="${escAttr(person.name)}">
      </div>
      <div class="sg-form-group">
        <label class="sg-label">Pozice</label>
        <input type="text" class="sg-input" id="person-position" placeholder="Obchodní ředitel" value="${escAttr(person.position)}">
      </div>
      <div class="sg-form-group">
        <label class="sg-label">E-mail</label>
        <input type="email" class="sg-input" id="person-email" placeholder="jan.novak@firma.cz" value="${escAttr(person.email)}">
      </div>
      <div class="sg-form-row">
        <div class="sg-form-group">
          <label class="sg-label">Mobil</label>
          <input type="tel" class="sg-input" id="person-phone-mobile" placeholder="+420 777 123 456" value="${escAttr(person.phoneMobile)}">
        </div>
        <div class="sg-form-group">
          <label class="sg-label">Telefon kancelář</label>
          <input type="tel" class="sg-input" id="person-phone-office" placeholder="+420 222 333 444" value="${escAttr(person.phoneOffice)}">
        </div>
      </div>
      <div class="sg-form-group">
        <label class="sg-label">Foto URL</label>
        <input type="url" class="sg-input" id="person-photo" placeholder="https://example.com/photo.jpg" value="${escAttr(person.photoUrl)}">
      </div>
    </div>

    <div class="sg-card">
      <div class="sg-card__title">Viditelnost polí v podpisu</div>
      <div class="sg-visibility-grid" id="visibility-grid"></div>
    </div>

    <div class="sg-card">
      <div class="sg-card__title">
        Vlastní pole
        <button class="sg-btn sg-btn--ghost sg-btn--sm" id="btn-add-custom-field">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Přidat
        </button>
      </div>
      <div id="custom-fields-list"></div>
    </div>
  `;

  // Wire up text fields
  Object.entries(PERSON_FIELDS).forEach(([inputId, field]) => {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('input', debounce(() => {
      const p = getActivePerson();
      if (!p) return;
      updatePerson(p.id, { [field]: el.value });
    }));
  });

  // Render visibility checkboxes
  renderVisibilityGrid(person);

  // Render custom fields
  renderCustomFields(person);

  // Add custom field button
  document.getElementById('btn-add-custom-field')?.addEventListener('click', () => {
    addCustomField();
  });
}

function renderVisibilityGrid(person) {
  const grid = document.getElementById('visibility-grid');
  if (!grid) return;

  grid.innerHTML = '';
  VISIBILITY_FIELDS.forEach(vf => {
    const checked = person.visibleFields[vf.key] ? 'checked' : '';
    const disabled = vf.disabled ? 'disabled' : '';
    const cls = vf.disabled ? 'sg-checkbox sg-checkbox--disabled' : 'sg-checkbox';

    const label = document.createElement('label');
    label.className = cls;
    label.innerHTML = `
      <input type="checkbox" ${checked} ${disabled} data-vf-key="${vf.key}">
      ${vf.label}
    `;

    if (!vf.disabled) {
      const cb = label.querySelector('input');
      cb.addEventListener('change', () => {
        const p = getActivePerson();
        if (!p) return;
        const newVf = { ...p.visibleFields, [vf.key]: cb.checked };
        updatePerson(p.id, { visibleFields: newVf });
      });
    }

    grid.appendChild(label);
  });
}

function renderCustomFields(person) {
  const container = document.getElementById('custom-fields-list');
  if (!container) return;

  container.innerHTML = '';

  if (!person.customFields || person.customFields.length === 0) {
    container.innerHTML = '<div style="font-size:13px;color:var(--color-text-muted);padding:4px 0;">Žádná vlastní pole</div>';
    return;
  }

  person.customFields.forEach((cf, index) => {
    const row = document.createElement('div');
    row.className = 'sg-custom-field-row';
    row.innerHTML = `
      <input type="text" class="sg-input" placeholder="Název" value="${escAttr(cf.label)}" data-cf-field="label" data-cf-index="${index}">
      <input type="text" class="sg-input" placeholder="Hodnota" value="${escAttr(cf.value)}" data-cf-field="value" data-cf-index="${index}">
      <button class="sg-btn sg-btn--danger sg-btn--sm" data-cf-remove="${index}" title="Odebrat">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    row.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', debounce(() => {
        const p = getActivePerson();
        if (!p) return;
        const fields = [...(p.customFields || [])];
        const idx = parseInt(input.dataset.cfIndex);
        if (!fields[idx]) return;
        fields[idx] = { ...fields[idx], [input.dataset.cfField]: input.value };
        updatePerson(p.id, { customFields: fields });
      }));
    });

    row.querySelector('[data-cf-remove]').addEventListener('click', () => {
      removeCustomField(index);
    });

    container.appendChild(row);
  });
}

function addCustomField() {
  const p = getActivePerson();
  if (!p) return;
  const fields = [...(p.customFields || [])];
  fields.push({ id: generateId('cf'), label: '', value: '' });
  updatePerson(p.id, { customFields: fields });
  populatePersonEditor();
}

function removeCustomField(index) {
  const p = getActivePerson();
  if (!p) return;
  const fields = [...(p.customFields || [])];
  fields.splice(index, 1);
  updatePerson(p.id, { customFields: fields });
  populatePersonEditor();
}

function escAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
