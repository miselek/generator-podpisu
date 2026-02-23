// Preview panel with email client simulation

import { state, subscribe, setPreviewClient, getActiveCompany, getActivePerson, getActiveSignatureConfig } from '../state.js';
import { buildSignature, formatHtml } from '../engine/signature-builder.js';

let currentHtml = '';

export function initPreviewPanel() {
  // Client selector buttons
  const clientBtns = document.querySelectorAll('.sg-preview__client-btn');
  clientBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      clientBtns.forEach(b => b.classList.remove('sg-preview__client-btn--active'));
      btn.classList.add('sg-preview__client-btn--active');
      setPreviewClient(btn.dataset.client);
    });
  });

  // Subscribe to all relevant changes
  subscribe('ui:companyChanged', updatePreview);
  subscribe('ui:personChanged', updatePreview);
  subscribe('ui:previewClientChanged', updatePreview);
  subscribe('company:updated', updatePreview);
  subscribe('person:updated', updatePreview);
  subscribe('signatureConfig:updated', updatePreview);
  subscribe('signatureConfigs:changed', updatePreview);
}

export function updatePreview() {
  const company = getActiveCompany();
  const person = getActivePerson();
  const config = getActiveSignatureConfig();

  const contentEl = document.getElementById('preview-content');
  const renderEl = document.getElementById('preview-render');
  const titleEl = document.getElementById('preview-title');
  const labelEl = document.getElementById('preview-label');

  if (!contentEl || !renderEl) return;

  if (!company || !person) {
    contentEl.innerHTML = '<div class="sg-empty"><div class="sg-empty__text">Vyberte firmu a osobu pro zobrazení náhledu</div></div>';
    currentHtml = '';
    if (labelEl) labelEl.textContent = '';
    return;
  }

  // Generate signature HTML
  currentHtml = buildSignature(company, person, config);

  if (!currentHtml) {
    contentEl.innerHTML = '<div class="sg-empty"><div class="sg-empty__text">Vyplňte údaje osoby pro vygenerování podpisu</div></div>';
    if (labelEl) labelEl.textContent = '';
    return;
  }

  // Apply client-specific rendering
  const client = state.ui.previewClient;

  // Remove all client classes
  renderEl.className = 'sg-preview__render';

  switch (client) {
    case 'gmail':
      renderEl.classList.add('sg-preview__render--gmail');
      contentEl.innerHTML = renderGmailPreview(currentHtml);
      if (titleEl) titleEl.textContent = 'Gmail';
      if (labelEl) labelEl.textContent = 'Simulace zobrazení v Gmail (webová verze)';
      break;

    case 'apple':
      renderEl.classList.add('sg-preview__render--apple');
      contentEl.innerHTML = renderAppleMailPreview(currentHtml);
      if (titleEl) titleEl.textContent = 'Apple Mail';
      if (labelEl) labelEl.textContent = 'Simulace zobrazení v Apple Mail (macOS)';
      break;

    case 'ios':
      renderEl.classList.add('sg-preview__render--ios');
      contentEl.innerHTML = renderIOSMailPreview(currentHtml);
      if (titleEl) titleEl.textContent = 'iOS Mail';
      if (labelEl) labelEl.textContent = 'Simulace zobrazení v Mail (iPhone/iPad)';
      break;

    default: // 'live'
      contentEl.innerHTML = currentHtml;
      if (titleEl) titleEl.textContent = 'Náhled podpisu';
      if (labelEl) labelEl.textContent = '';
      break;
  }
}

function renderGmailPreview(html) {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 13px; color: #222; padding-bottom: 12px; margin-bottom: 12px;">
      <div style="color: #5f6368; font-size: 12px; padding-bottom: 8px;">--</div>
      ${html}
    </div>
  `;
}

function renderAppleMailPreview(html) {
  return `
    <div style="font-family: -apple-system, 'Helvetica Neue', sans-serif; font-size: 14px; color: #000;">
      ${html}
    </div>
  `;
}

function renderIOSMailPreview(html) {
  return `
    <div style="font-family: -apple-system, sans-serif; font-size: 15px; color: #000; max-width: 320px;">
      <div style="color: #8e8e93; font-size: 12px; padding-bottom: 8px;">Odesláno z iPhonu</div>
      ${html}
    </div>
  `;
}

export function getCurrentHtml() {
  return currentHtml;
}

export function getFormattedHtml() {
  return formatHtml(currentHtml);
}
