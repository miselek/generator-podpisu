// Main signature builder - orchestrates template rendering

import { buildHorizontalSignature } from './template-horizontal.js';
import { buildVerticalSignature } from './template-vertical.js';

export function buildSignature(company, person, sigConfig) {
  if (!company || !person || !sigConfig) {
    return '';
  }

  if (sigConfig.layout === 'vertical') {
    return buildVerticalSignature(company, person, sigConfig);
  }

  return buildHorizontalSignature(company, person, sigConfig);
}

// Format HTML with basic indentation for source view
export function formatHtml(html) {
  let formatted = '';
  let indent = 0;
  const lines = html
    .replace(/></g, '>\n<')
    .split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Decrease indent for closing tags
    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1);
    }

    formatted += '  '.repeat(indent) + trimmed + '\n';

    // Increase indent for opening tags (not self-closing or void)
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') &&
        !trimmed.includes('</') && !trimmed.startsWith('<img') && !trimmed.startsWith('<br') &&
        !trimmed.startsWith('<hr') && !trimmed.startsWith('<input') && trimmed !== '&nbsp;') {
      indent++;
    }
  }

  return formatted.trim();
}
