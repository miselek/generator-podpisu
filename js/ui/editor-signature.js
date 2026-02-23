// Signature style/layout editor

import { subscribe, updateSignatureConfig, updateCompany, getActiveCompany, getActiveSignatureConfig } from '../state.js';

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function initSignatureEditor() {
  // Layout toggle
  initToggleGroup('layout-toggle', 'layout', (value) => {
    const config = getActiveSignatureConfig();
    if (config) updateSignatureConfig(config.companyId, { layout: value });
  });

  // Divider toggle
  initToggleGroup('divider-toggle', 'divider', (value) => {
    const config = getActiveSignatureConfig();
    if (config) updateSignatureConfig(config.companyId, { dividerStyle: value });
  });

  // Photo shape toggle
  initToggleGroup('photo-shape-toggle', 'shape', (value) => {
    const config = getActiveSignatureConfig();
    if (config) updateSignatureConfig(config.companyId, { photoShape: value });
  });

  // Font family
  const fontSelect = document.getElementById('sig-font-family');
  if (fontSelect) {
    fontSelect.addEventListener('change', () => {
      const company = getActiveCompany();
      if (!company) return;
      updateCompany(company.id, { fonts: { ...company.fonts, family: fontSelect.value } });
    });
  }

  // Range sliders
  initRange('sig-name-size', 'sig-name-size-val', (val) => {
    const company = getActiveCompany();
    if (company) updateCompany(company.id, { fonts: { ...company.fonts, nameFontSize: val } });
  });

  initRange('sig-title-size', 'sig-title-size-val', (val) => {
    const company = getActiveCompany();
    if (company) updateCompany(company.id, { fonts: { ...company.fonts, titleFontSize: val } });
  });

  initRange('sig-contact-size', 'sig-contact-size-val', (val) => {
    const company = getActiveCompany();
    if (company) updateCompany(company.id, { fonts: { ...company.fonts, contactFontSize: val } });
  });

  initRange('sig-divider-width', 'sig-divider-width-val', (val) => {
    const config = getActiveSignatureConfig();
    if (config) updateSignatureConfig(config.companyId, { dividerWidth: val });
  });

  initRange('sig-logo-width', 'sig-logo-width-val', (val) => {
    const config = getActiveSignatureConfig();
    if (config) updateSignatureConfig(config.companyId, { logoWidth: val });
  });

  initRange('sig-photo-width', 'sig-photo-width-val', (val) => {
    const config = getActiveSignatureConfig();
    if (config) updateSignatureConfig(config.companyId, { photoWidth: val });
  });

  initRange('sig-section-gap', 'sig-section-gap-val', (val) => {
    const config = getActiveSignatureConfig();
    if (config) updateSignatureConfig(config.companyId, { sectionGap: val });
  });

  // Subscribe
  subscribe('ui:companyChanged', populateSignatureEditor);
}

function initToggleGroup(groupId, dataAttr, onChange) {
  const group = document.getElementById(groupId);
  if (!group) return;

  group.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-' + dataAttr + ']');
    if (!btn) return;

    group.querySelectorAll('.sg-toggle-group__btn').forEach(b => b.classList.remove('sg-toggle-group__btn--active'));
    btn.classList.add('sg-toggle-group__btn--active');
    onChange(btn.dataset[dataAttr]);
  });
}

function initRange(inputId, valueId, onChange) {
  const input = document.getElementById(inputId);
  const valueEl = document.getElementById(valueId);
  if (!input) return;

  input.addEventListener('input', () => {
    const val = parseInt(input.value);
    if (valueEl) valueEl.textContent = val + 'px';
    onChange(val);
  });
}

export function populateSignatureEditor() {
  const company = getActiveCompany();
  const config = getActiveSignatureConfig();
  if (!company || !config) return;

  // Font family
  const fontSelect = document.getElementById('sig-font-family');
  if (fontSelect) fontSelect.value = company.fonts.family;

  // Range values
  setRange('sig-name-size', 'sig-name-size-val', company.fonts.nameFontSize);
  setRange('sig-title-size', 'sig-title-size-val', company.fonts.titleFontSize);
  setRange('sig-contact-size', 'sig-contact-size-val', company.fonts.contactFontSize);
  setRange('sig-divider-width', 'sig-divider-width-val', config.dividerWidth);
  setRange('sig-logo-width', 'sig-logo-width-val', config.logoWidth);
  setRange('sig-photo-width', 'sig-photo-width-val', config.photoWidth);
  setRange('sig-section-gap', 'sig-section-gap-val', config.sectionGap);

  // Toggle groups
  setToggle('layout-toggle', 'layout', config.layout);
  setToggle('divider-toggle', 'divider', config.dividerStyle);
  setToggle('photo-shape-toggle', 'shape', config.photoShape);
}

function setRange(inputId, valueId, val) {
  const input = document.getElementById(inputId);
  const valueEl = document.getElementById(valueId);
  if (input) input.value = val;
  if (valueEl) valueEl.textContent = val + 'px';
}

function setToggle(groupId, dataAttr, value) {
  const group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.sg-toggle-group__btn').forEach(btn => {
    btn.classList.toggle('sg-toggle-group__btn--active', btn.dataset[dataAttr] === value);
  });
}
