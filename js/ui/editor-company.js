// Company editor panel

import { subscribe, updateCompany, getActiveCompany, generateId } from '../state.js';

// Debounce helper
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Field mappings: { inputId: companyFieldPath }
const TEXT_FIELDS = {
  'company-name': 'name',
  'company-logo': 'logoUrl',
  'company-website': 'website',
  'company-email': 'email',
  'company-phone': 'phone',
  'company-address': 'address'
};

const COLOR_FIELDS = {
  'company-color-primary': 'colors.primary',
  'company-color-secondary': 'colors.secondary',
  'company-color-text': 'colors.text',
  'company-color-divider': 'colors.divider'
};

export function initCompanyEditor() {
  // Text fields with debounce
  Object.entries(TEXT_FIELDS).forEach(([inputId, field]) => {
    const el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('input', debounce(() => {
      const company = getActiveCompany();
      if (!company) return;
      updateCompany(company.id, { [field]: el.value });
    }));
  });

  // Color pickers (immediate update)
  Object.entries(COLOR_FIELDS).forEach(([inputId, path]) => {
    const colorEl = document.getElementById(inputId);
    const hexEl = document.getElementById(inputId + '-hex');
    if (!colorEl || !hexEl) return;

    colorEl.addEventListener('input', () => {
      hexEl.value = colorEl.value;
      updateColor(path, colorEl.value);
    });

    hexEl.addEventListener('input', debounce(() => {
      if (/^#[0-9a-fA-F]{6}$/.test(hexEl.value)) {
        colorEl.value = hexEl.value;
        updateColor(path, hexEl.value);
      }
    }, 500));
  });

  // Social links
  document.getElementById('btn-add-social')?.addEventListener('click', addSocialLink);

  // Subscribe to state changes
  subscribe('ui:companyChanged', populateCompanyEditor);
  subscribe('company:updated', () => {}); // No re-populate on own updates
}

function updateColor(path, value) {
  const company = getActiveCompany();
  if (!company) return;
  const [obj, key] = path.split('.');
  const updated = { ...company[obj], [key]: value };
  updateCompany(company.id, { [obj]: updated });
}

export function populateCompanyEditor() {
  const company = getActiveCompany();
  if (!company) return;

  // Text fields
  Object.entries(TEXT_FIELDS).forEach(([inputId, field]) => {
    const el = document.getElementById(inputId);
    if (el) el.value = company[field] || '';
  });

  // Color fields
  Object.entries(COLOR_FIELDS).forEach(([inputId, path]) => {
    const [obj, key] = path.split('.');
    const value = company[obj]?.[key] || '#000000';
    const colorEl = document.getElementById(inputId);
    const hexEl = document.getElementById(inputId + '-hex');
    if (colorEl) colorEl.value = value;
    if (hexEl) hexEl.value = value;
  });

  // Social links
  renderSocialLinks();
}

function renderSocialLinks() {
  const company = getActiveCompany();
  const container = document.getElementById('social-links-list');
  if (!container || !company) return;

  container.innerHTML = '';

  if (!company.socialLinks || company.socialLinks.length === 0) {
    container.innerHTML = '<div style="font-size:13px;color:var(--color-text-muted);padding:4px 0;">Zatím žádné sociální sítě</div>';
    return;
  }

  company.socialLinks.forEach((link, index) => {
    const row = document.createElement('div');
    row.className = 'sg-social-row';
    row.innerHTML = `
      <input type="text" class="sg-input" placeholder="Název (LinkedIn)" value="${escAttr(link.platform)}" data-field="platform" data-index="${index}">
      <input type="url" class="sg-input" placeholder="URL profilu" value="${escAttr(link.url)}" data-field="url" data-index="${index}">
      <input type="url" class="sg-input" placeholder="URL ikony" value="${escAttr(link.iconUrl)}" data-field="iconUrl" data-index="${index}">
      <button class="sg-btn sg-btn--danger sg-btn--sm" data-remove-index="${index}" title="Odebrat">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    // Input handlers
    row.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', debounce(() => {
        const field = input.dataset.field;
        const idx = parseInt(input.dataset.index);
        updateSocialLink(idx, field, input.value);
      }));
    });

    // Remove handler
    row.querySelector('[data-remove-index]').addEventListener('click', () => {
      removeSocialLink(index);
    });

    container.appendChild(row);
  });
}

function addSocialLink() {
  const company = getActiveCompany();
  if (!company) return;
  const links = [...(company.socialLinks || [])];
  links.push({
    id: generateId('social'),
    platform: '',
    url: '',
    iconUrl: ''
  });
  updateCompany(company.id, { socialLinks: links });
  renderSocialLinks();
}

function updateSocialLink(index, field, value) {
  const company = getActiveCompany();
  if (!company) return;
  const links = [...(company.socialLinks || [])];
  if (!links[index]) return;
  links[index] = { ...links[index], [field]: value };
  updateCompany(company.id, { socialLinks: links });
}

function removeSocialLink(index) {
  const company = getActiveCompany();
  if (!company) return;
  const links = [...(company.socialLinks || [])];
  links.splice(index, 1);
  updateCompany(company.id, { socialLinks: links });
  renderSocialLinks();
}

function escAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
