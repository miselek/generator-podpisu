// Horizontal layout: Logo/Photo left | Divider | Text right

import { getTableStyle, getNameStyle, getTitleStyle, getContactStyle, getLinkStyle, getDividerStyle, getPhotoStyle, getSocialIconStyle } from './inline-styles.js';

export function buildHorizontalSignature(company, person, sigConfig) {
  const config = { colors: company.colors, fonts: company.fonts };
  const vf = person.visibleFields;
  const gap = sigConfig.sectionGap;

  // Build left column (logo + photo)
  let leftContent = '';

  if (vf.companyLogo && company.logoUrl) {
    leftContent += `<img src="${esc(company.logoUrl)}" alt="${esc(company.name)}" width="${sigConfig.logoWidth}" style="display:block; border:0; max-width:${sigConfig.logoWidth}px;" />`;
  }

  if (vf.photo && person.photoUrl) {
    const photoMargin = leftContent ? `margin-top:${gap}px;` : '';
    leftContent += `<img src="${esc(person.photoUrl)}" alt="${esc(person.name)}" style="${getPhotoStyle(sigConfig)}${photoMargin}" width="${sigConfig.photoWidth}" height="${sigConfig.photoWidth}" />`;
  }

  // Build right column (text content)
  let rightRows = '';

  // Name
  if (vf.name && person.name) {
    rightRows += `<tr><td style="${getNameStyle(config)}">${esc(person.name)}</td></tr>`;
  }

  // Position
  if (vf.position && person.position) {
    rightRows += `<tr><td style="${getTitleStyle(config)}">${esc(person.position)}</td></tr>`;
  }

  // Contact lines
  const contactParts = [];

  if (vf.email && person.email) {
    contactParts.push(`<a href="mailto:${esc(person.email)}" style="${getLinkStyle(config)}">${esc(person.email)}</a>`);
  }

  if (vf.phoneMobile && person.phoneMobile) {
    contactParts.push(`<a href="tel:${esc(person.phoneMobile.replace(/\s/g, ''))}" style="${getLinkStyle(config)}">${esc(person.phoneMobile)}</a>`);
  }

  if (vf.phoneOffice && person.phoneOffice) {
    contactParts.push(`<a href="tel:${esc(person.phoneOffice.replace(/\s/g, ''))}" style="${getLinkStyle(config)}">${esc(person.phoneOffice)}</a>`);
  }

  if (contactParts.length > 0) {
    rightRows += `<tr><td style="${getContactStyle(config)}">${contactParts.join(' <span style="color:' + company.colors.secondary + ';padding:0 4px;">|</span> ')}</td></tr>`;
  }

  // Company info line
  const companyParts = [];

  if (vf.companyWeb && company.website) {
    companyParts.push(`<a href="${esc(company.website)}" style="${getLinkStyle(config)}" target="_blank">${esc(company.website.replace(/^https?:\/\//, ''))}</a>`);
  }

  if (vf.companyAddress && company.address) {
    companyParts.push(`<span style="${getContactStyle(config)}">${esc(company.address)}</span>`);
  }

  if (vf.companyPhone && company.phone) {
    companyParts.push(`<a href="tel:${esc(company.phone.replace(/\s/g, ''))}" style="${getLinkStyle(config)}">${esc(company.phone)}</a>`);
  }

  if (vf.companyEmail && company.email) {
    companyParts.push(`<a href="mailto:${esc(company.email)}" style="${getLinkStyle(config)}">${esc(company.email)}</a>`);
  }

  if (companyParts.length > 0) {
    rightRows += `<tr><td style="${getContactStyle(config)}">${companyParts.join(' <span style="color:' + company.colors.secondary + ';padding:0 4px;">|</span> ')}</td></tr>`;
  }

  // Custom fields
  if (vf.customFields && person.customFields && person.customFields.length > 0) {
    const cfParts = person.customFields
      .filter(cf => cf.label && cf.value)
      .map(cf => `<span style="${getContactStyle(config)}">${esc(cf.label)}: ${esc(cf.value)}</span>`);
    if (cfParts.length > 0) {
      rightRows += `<tr><td style="${getContactStyle(config)}">${cfParts.join(' <span style="color:' + company.colors.secondary + ';padding:0 4px;">|</span> ')}</td></tr>`;
    }
  }

  // Social media icons
  if (vf.socialLinks && company.socialLinks && company.socialLinks.length > 0) {
    const icons = company.socialLinks
      .filter(s => s.url && s.iconUrl)
      .map(s => `<a href="${esc(s.url)}" target="_blank" style="text-decoration:none;display:inline-block;margin-right:6px;"><img src="${esc(s.iconUrl)}" alt="${esc(s.platform)}" width="20" height="20" style="${getSocialIconStyle()}" /></a>`)
      .join('');
    if (icons) {
      rightRows += `<tr><td style="padding-top:8px;">${icons}</td></tr>`;
    }
  }

  // Build divider
  const dividerStyle = getDividerStyle(config, sigConfig, 'vertical');
  let dividerCell = '';
  if (dividerStyle) {
    dividerCell = `<td style="${dividerStyle}; padding:0;">&nbsp;</td>`;
  }

  // Determine if we have left content
  const hasLeft = leftContent.length > 0;
  const hasRight = rightRows.length > 0;

  // Assemble the full table
  let html = `<table cellpadding="0" cellspacing="0" border="0" style="${getTableStyle(600)}">`;
  html += '<tr>';

  if (hasLeft) {
    html += `<td style="vertical-align:top; padding-right:${gap}px;">`;
    html += leftContent;
    html += '</td>';

    if (dividerCell && hasRight) {
      html += dividerCell;
    }
  }

  if (hasRight) {
    const leftPad = (hasLeft || dividerCell) ? `padding-left:${gap}px;` : '';
    html += `<td style="vertical-align:top; ${leftPad}">`;
    html += `<table cellpadding="0" cellspacing="0" border="0"><tbody>`;
    html += rightRows;
    html += '</tbody></table>';
    html += '</td>';
  }

  html += '</tr></table>';

  return html;
}

// HTML entity escaping
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
