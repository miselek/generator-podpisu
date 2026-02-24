// ============================================
// EMAIL SIGNATURE GENERATOR - Single File App
// ============================================
// Bundled into one file for file:// compatibility (no ES modules needed)

(function() {
'use strict';

// ============================================
// STATE MANAGEMENT
// ============================================

const listeners = {};

const state = {
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

function subscribe(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

function emit(event, data) {
  (listeners[event] || []).forEach(function(cb) { cb(data); });
}

function generateId(prefix) {
  prefix = prefix || 'id';
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function setCompanies(companies) {
  state.companies = companies;
  emit('companies:changed', state.companies);
}

function updateCompany(id, updates) {
  var idx = state.companies.findIndex(function(c) { return c.id === id; });
  if (idx === -1) return;
  state.companies[idx] = Object.assign({}, state.companies[idx], updates, { updatedAt: new Date().toISOString() });
  emit('company:updated', state.companies[idx]);
  emit('companies:changed', state.companies);
}

function setPersons(persons) {
  state.persons = persons;
  emit('persons:changed', state.persons);
}

function addPerson(person) {
  state.persons.push(person);
  emit('persons:changed', state.persons);
}

function updatePerson(id, updates) {
  var idx = state.persons.findIndex(function(p) { return p.id === id; });
  if (idx === -1) return;
  state.persons[idx] = Object.assign({}, state.persons[idx], updates, { updatedAt: new Date().toISOString() });
  emit('person:updated', state.persons[idx]);
  emit('persons:changed', state.persons);
}

function deletePerson(id) {
  state.persons = state.persons.filter(function(p) { return p.id !== id; });
  emit('persons:changed', state.persons);
  if (state.ui.activePersonId === id) {
    setActivePerson(null);
  }
}

function setSignatureConfigs(configs) {
  state.signatureConfigs = configs;
  emit('signatureConfigs:changed', state.signatureConfigs);
}

function updateSignatureConfig(companyId, updates) {
  if (!state.signatureConfigs[companyId]) return;
  state.signatureConfigs[companyId] = Object.assign({}, state.signatureConfigs[companyId], updates);
  emit('signatureConfig:updated', state.signatureConfigs[companyId]);
  emit('signatureConfigs:changed', state.signatureConfigs);
}

function setActiveCompany(id) {
  state.ui.activeCompanyId = id;
  var companyPersons = state.persons.filter(function(p) { return p.companyId === id; });
  if (companyPersons.length > 0 && (!state.ui.activePersonId || !companyPersons.find(function(p) { return p.id === state.ui.activePersonId; }))) {
    state.ui.activePersonId = companyPersons[0].id;
  } else if (companyPersons.length === 0) {
    state.ui.activePersonId = null;
  }
  emit('ui:companyChanged', id);
  emit('ui:personChanged', state.ui.activePersonId);
}

function setActivePerson(id) {
  state.ui.activePersonId = id;
  emit('ui:personChanged', id);
}

function setActiveTab(tab) {
  state.ui.activeTab = tab;
  emit('ui:tabChanged', tab);
}

function setPreviewClient(client) {
  state.ui.previewClient = client;
  emit('ui:previewClientChanged', client);
}

function getActiveCompany() {
  return state.companies.find(function(c) { return c.id === state.ui.activeCompanyId; }) || null;
}

function getActivePerson() {
  return state.persons.find(function(p) { return p.id === state.ui.activePersonId; }) || null;
}

function getActiveSignatureConfig() {
  return state.signatureConfigs[state.ui.activeCompanyId] || null;
}

// ============================================
// STORAGE
// ============================================

var STORAGE_PREFIX = 'siggen_';

function loadData(key) {
  try {
    var raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading ' + key + ':', e);
    return null;
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving ' + key + ':', e);
  }
}

function exportAllData() {
  return {
    companies: loadData('companies'),
    persons: loadData('persons'),
    signatureConfigs: loadData('signatureConfigs'),
    exportedAt: new Date().toISOString(),
    version: 1
  };
}

function importAllData(data) {
  if (!data || !data.companies || !data.persons) {
    throw new Error('Neplatny format dat');
  }
  saveData('companies', data.companies);
  saveData('persons', data.persons);
  if (data.signatureConfigs) saveData('signatureConfigs', data.signatureConfigs);
}

// ============================================
// DEFAULTS
// ============================================

var DEFAULT_COMPANIES = [
  {
    id: 'company_nh',
    name: 'Nové Horizonty',
    logoUrl: '',
    website: 'https://www.novehorizonty.cz',
    email: 'info@novehorizonty.cz',
    phone: '',
    address: '',
    colors: { primary: '#1a56db', secondary: '#6b7280', text: '#1e293b', divider: '#1a56db' },
    fonts: { family: 'Arial, sans-serif', nameFontSize: 16, titleFontSize: 13, contactFontSize: 12 },
    socialLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'company_mc',
    name: 'MobilCare',
    logoUrl: '',
    website: 'https://www.mobilcare.cz',
    email: 'info@mobilcare.cz',
    phone: '',
    address: '',
    colors: { primary: '#059669', secondary: '#6b7280', text: '#1e293b', divider: '#059669' },
    fonts: { family: 'Arial, sans-serif', nameFontSize: 16, titleFontSize: 13, contactFontSize: 12 },
    socialLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'company_sm',
    name: 'SimpleMat',
    logoUrl: '',
    website: 'https://www.simplemat.cz',
    email: 'info@simplemat.cz',
    phone: '',
    address: '',
    colors: { primary: '#7c3aed', secondary: '#6b7280', text: '#1e293b', divider: '#7c3aed' },
    fonts: { family: 'Arial, sans-serif', nameFontSize: 16, titleFontSize: 13, contactFontSize: 12 },
    socialLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

var DEFAULT_SIGNATURE_CONFIGS = {
  company_nh: { companyId: 'company_nh', layout: 'horizontal', dividerStyle: 'solid', dividerWidth: 2, logoWidth: 120, photoWidth: 80, photoShape: 'rounded', photoPosition: 'left', sectionGap: 12, lineSpacing: 4 },
  company_mc: { companyId: 'company_mc', layout: 'horizontal', dividerStyle: 'solid', dividerWidth: 2, logoWidth: 120, photoWidth: 80, photoShape: 'rounded', photoPosition: 'left', sectionGap: 12, lineSpacing: 4 },
  company_sm: { companyId: 'company_sm', layout: 'horizontal', dividerStyle: 'solid', dividerWidth: 2, logoWidth: 120, photoWidth: 80, photoShape: 'rounded', photoPosition: 'left', sectionGap: 12, lineSpacing: 4 }
};

function createDefaultPerson(companyId) {
  return {
    id: '',
    companyId: companyId,
    name: '',
    position: '',
    email: '',
    phoneMobile: '',
    phoneOffice: '',
    photoUrl: '',
    customFields: [],
    visibleFields: {
      name: true, position: true, email: true, phoneMobile: true,
      phoneOffice: false, photo: false, companyLogo: true, companyWeb: true,
      companyAddress: true, companyPhone: false, companyEmail: false,
      socialLinks: true, customFields: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ============================================
// INLINE STYLES ENGINE
// ============================================

function camelToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function makeStyle(styleObj) {
  return Object.keys(styleObj)
    .filter(function(k) { var v = styleObj[k]; return v !== undefined && v !== null && v !== ''; })
    .map(function(k) { return camelToKebab(k) + ':' + styleObj[k]; })
    .join('; ');
}

function getTableStyle(maxWidth) {
  return makeStyle({ maxWidth: maxWidth + 'px', borderCollapse: 'collapse', borderSpacing: '0', margin: '0', padding: '0' });
}

function getNameStyle(config) {
  return makeStyle({ fontSize: config.fonts.nameFontSize + 'px', fontWeight: 'bold', color: config.colors.primary, fontFamily: config.fonts.family, lineHeight: '1.3', margin: '0', padding: '0 0 2px 0' });
}

function getTitleStyle(config) {
  return makeStyle({ fontSize: config.fonts.titleFontSize + 'px', fontWeight: 'normal', color: config.colors.secondary, fontFamily: config.fonts.family, lineHeight: '1.3', margin: '0', padding: '0 0 8px 0' });
}

function getContactStyle(config) {
  return makeStyle({ fontSize: config.fonts.contactFontSize + 'px', color: config.colors.text, fontFamily: config.fonts.family, lineHeight: '1.5', margin: '0', padding: '0 0 2px 0' });
}

function getLinkStyle(config) {
  return makeStyle({ color: config.colors.primary, textDecoration: 'none', fontSize: config.fonts.contactFontSize + 'px', fontFamily: config.fonts.family });
}

function getDividerStyle(config, sigConfig, orientation) {
  if (sigConfig.dividerStyle === 'none') return null;
  var base = { backgroundColor: config.colors.divider, fontSize: '1px', lineHeight: '1px' };
  if (sigConfig.dividerStyle === 'dashed') {
    delete base.backgroundColor;
    if (orientation === 'vertical') {
      base.borderLeft = sigConfig.dividerWidth + 'px dashed ' + config.colors.divider;
      base.width = sigConfig.dividerWidth + 'px';
    } else {
      base.borderTop = sigConfig.dividerWidth + 'px dashed ' + config.colors.divider;
      base.height = sigConfig.dividerWidth + 'px';
    }
  } else {
    if (orientation === 'vertical') { base.width = sigConfig.dividerWidth + 'px'; }
    else { base.height = sigConfig.dividerWidth + 'px'; }
  }
  return makeStyle(base);
}

function getPhotoStyle(sigConfig) {
  var br = sigConfig.photoShape === 'rounded' ? '50%' : '4px';
  return makeStyle({ display: 'block', border: '0', width: sigConfig.photoWidth + 'px', height: sigConfig.photoWidth + 'px', borderRadius: br });
}

function getPhotoWrapperStyle(sigConfig) {
  var br = sigConfig.photoShape === 'rounded' ? '50%' : '4px';
  return makeStyle({ borderRadius: br, overflow: 'hidden', width: sigConfig.photoWidth + 'px', height: sigConfig.photoWidth + 'px', lineHeight: '0', fontSize: '0' });
}

function buildPhotoHtml(photoUrl, altText, sigConfig, colors) {
  var borderWidth = 3;
  var outerSize = sigConfig.photoWidth + (borderWidth * 2);
  var br = sigConfig.photoShape === 'rounded' ? '50%' : '4px';
  var gradientBg = 'background:linear-gradient(135deg, ' + colors.primary + ', ' + colors.divider + ');';
  var fallbackBg = 'background-color:' + colors.primary + ';';

  var outerTableStyle = makeStyle({ borderRadius: br, width: outerSize + 'px', height: outerSize + 'px', margin: '0', padding: '0' });
  var outerTdStyle = 'border-radius:' + br + '; ' + fallbackBg + ' ' + gradientBg
    + ' line-height:0; font-size:0; padding:' + borderWidth + 'px;'
    + ' width:' + outerSize + 'px; height:' + outerSize + 'px;';
  var innerTdStyle = makeStyle({ borderRadius: br, overflow: 'hidden',
    width: sigConfig.photoWidth + 'px', height: sigConfig.photoWidth + 'px',
    lineHeight: '0', fontSize: '0' });
  var imgStyle = makeStyle({ display: 'block', border: '0',
    width: sigConfig.photoWidth + 'px', height: sigConfig.photoWidth + 'px', borderRadius: br });

  return '<table cellpadding="0" cellspacing="0" border="0" style="' + outerTableStyle + '">'
    + '<tr><td style="' + outerTdStyle + '">'
    + '<table cellpadding="0" cellspacing="0" border="0">'
    + '<tr><td style="' + innerTdStyle + '">'
    + '<img src="' + esc(photoUrl) + '" alt="' + esc(altText) + '" '
    + 'style="' + imgStyle + '" width="' + sigConfig.photoWidth + '" height="' + sigConfig.photoWidth + '" />'
    + '</td></tr></table>'
    + '</td></tr></table>';
}

function getSocialIconStyle() {
  return makeStyle({ display: 'inline-block', border: '0', verticalAlign: 'middle' });
}

// ============================================
// HTML ESCAPE
// ============================================

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================
// SIGNATURE TEMPLATES
// ============================================

function makeSeparator(color) {
  return ' <span style="color:' + color + ';padding:0 4px;">|</span> ';
}

function buildHorizontalSignature(company, person, sigConfig) {
  var config = { colors: company.colors, fonts: company.fonts };
  var vf = person.visibleFields;
  var gap = sigConfig.sectionGap;

  // LEFT COLUMN: only photo (no logo)
  var leftContent = '';
  if (vf.photo && person.photoUrl) {
    leftContent += buildPhotoHtml(person.photoUrl, person.name, sigConfig, company.colors);
  }

  // RIGHT COLUMN: name, position, contacts, company info, custom fields, social, then logo at bottom
  var rightRows = '';
  if (vf.name && person.name) {
    rightRows += '<tr><td style="' + getNameStyle(config) + '">' + esc(person.name) + '</td></tr>';
  }
  if (vf.position && person.position) {
    rightRows += '<tr><td style="' + getTitleStyle(config) + '">' + esc(person.position) + '</td></tr>';
  }

  var contactParts = [];
  if (vf.email && person.email) contactParts.push('<a href="mailto:' + esc(person.email) + '" style="' + getLinkStyle(config) + '">' + esc(person.email) + '</a>');
  if (vf.phoneMobile && person.phoneMobile) contactParts.push('<a href="tel:' + esc(person.phoneMobile.replace(/\s/g, '')) + '" style="' + getLinkStyle(config) + '">' + esc(person.phoneMobile) + '</a>');
  if (vf.phoneOffice && person.phoneOffice) contactParts.push('<a href="tel:' + esc(person.phoneOffice.replace(/\s/g, '')) + '" style="' + getLinkStyle(config) + '">' + esc(person.phoneOffice) + '</a>');
  if (contactParts.length > 0) rightRows += '<tr><td style="' + getContactStyle(config) + '">' + contactParts.join(makeSeparator(company.colors.secondary)) + '</td></tr>';

  var companyParts = [];
  if (vf.companyWeb && company.website) companyParts.push('<a href="' + esc(company.website) + '" style="' + getLinkStyle(config) + '" target="_blank">' + esc(company.website.replace(/^https?:\/\//, '')) + '</a>');
  if (vf.companyAddress && company.address) companyParts.push('<span style="' + getContactStyle(config) + '">' + esc(company.address) + '</span>');
  if (vf.companyPhone && company.phone) companyParts.push('<a href="tel:' + esc(company.phone.replace(/\s/g, '')) + '" style="' + getLinkStyle(config) + '">' + esc(company.phone) + '</a>');
  if (vf.companyEmail && company.email) companyParts.push('<a href="mailto:' + esc(company.email) + '" style="' + getLinkStyle(config) + '">' + esc(company.email) + '</a>');
  if (companyParts.length > 0) rightRows += '<tr><td style="' + getContactStyle(config) + '">' + companyParts.join(makeSeparator(company.colors.secondary)) + '</td></tr>';

  if (vf.customFields && person.customFields && person.customFields.length > 0) {
    var cfParts = person.customFields.filter(function(cf) { return cf.label && cf.value; }).map(function(cf) { return '<span style="' + getContactStyle(config) + '">' + esc(cf.label) + ': ' + esc(cf.value) + '</span>'; });
    if (cfParts.length > 0) rightRows += '<tr><td style="' + getContactStyle(config) + '">' + cfParts.join(makeSeparator(company.colors.secondary)) + '</td></tr>';
  }

  if (vf.socialLinks && company.socialLinks && company.socialLinks.length > 0) {
    var icons = company.socialLinks.filter(function(s) { return s.url && s.iconUrl; }).map(function(s) { return '<a href="' + esc(s.url) + '" target="_blank" style="text-decoration:none;display:inline-block;margin-right:6px;"><img src="' + esc(s.iconUrl) + '" alt="' + esc(s.platform) + '" width="20" height="20" style="' + getSocialIconStyle() + '" /></a>'; }).join('');
    if (icons) rightRows += '<tr><td style="padding-top:8px;">' + icons + '</td></tr>';
  }

  // Logo at the bottom of the right column
  if (vf.companyLogo && company.logoUrl) {
    rightRows += '<tr><td style="padding-top:' + gap + 'px;"><img src="' + esc(company.logoUrl) + '" alt="' + esc(company.name) + '" width="' + sigConfig.logoWidth + '" style="display:block; border:0; max-width:' + sigConfig.logoWidth + 'px; margin:0; padding:0;" /></td></tr>';
  }

  var dividerStyle = getDividerStyle(config, sigConfig, 'vertical');
  var dividerCell = '';
  if (dividerStyle) dividerCell = '<td style="' + dividerStyle + '; padding:0;">&nbsp;</td>';

  var hasLeft = leftContent.length > 0;
  var hasRight = rightRows.length > 0;
  var photoOnRight = sigConfig.photoPosition === 'right';

  var html = '<table cellpadding="0" cellspacing="0" border="0" style="' + getTableStyle(600) + '"><tr>';
  if (photoOnRight) {
    if (hasRight) {
      var rPad = hasLeft ? 'padding-right:' + gap + 'px;' : '';
      html += '<td style="vertical-align:top; ' + rPad + '"><table cellpadding="0" cellspacing="0" border="0"><tbody>' + rightRows + '</tbody></table></td>';
    }
    if (dividerCell && hasLeft && hasRight) html += dividerCell;
    if (hasLeft) {
      var lPad = hasRight ? 'padding-left:' + gap + 'px;' : '';
      html += '<td style="vertical-align:top; text-align:left; ' + lPad + '">' + leftContent + '</td>';
    }
  } else {
    if (hasLeft) {
      html += '<td style="vertical-align:top; text-align:left; padding-right:' + gap + 'px;">' + leftContent + '</td>';
      if (dividerCell && hasRight) html += dividerCell;
    }
    if (hasRight) {
      var leftPad = (hasLeft || dividerCell) ? 'padding-left:' + gap + 'px;' : '';
      html += '<td style="vertical-align:top; ' + leftPad + '"><table cellpadding="0" cellspacing="0" border="0"><tbody>' + rightRows + '</tbody></table></td>';
    }
  }
  html += '</tr></table>';
  return html;
}

function buildVerticalSignature(company, person, sigConfig) {
  var config = { colors: company.colors, fonts: company.fonts };
  var vf = person.visibleFields;
  var gap = sigConfig.sectionGap;
  var rows = '';

  // Photo row (built separately for position control)
  var photoRow = '';
  if (vf.photo && person.photoUrl) {
    photoRow = '<tr><td style="padding-bottom:' + gap + 'px;">'
      + buildPhotoHtml(person.photoUrl, person.name, sigConfig, company.colors)
      + '</td></tr>';
  }

  var photoOnBottom = sigConfig.photoPosition === 'right';
  if (!photoOnBottom && photoRow) rows += photoRow;

  var dividerStyle = getDividerStyle(config, sigConfig, 'horizontal');
  if (dividerStyle) rows += '<tr><td style="' + dividerStyle + '; padding:0; margin:0;">&nbsp;</td></tr>';

  if (vf.name && person.name) {
    var pt = dividerStyle ? 'padding-top:' + gap + 'px;' : '';
    rows += '<tr><td style="' + getNameStyle(config) + pt + '">' + esc(person.name) + '</td></tr>';
  }
  if (vf.position && person.position) rows += '<tr><td style="' + getTitleStyle(config) + '">' + esc(person.position) + '</td></tr>';

  var contactParts = [];
  if (vf.email && person.email) contactParts.push('<a href="mailto:' + esc(person.email) + '" style="' + getLinkStyle(config) + '">' + esc(person.email) + '</a>');
  if (vf.phoneMobile && person.phoneMobile) contactParts.push('<a href="tel:' + esc(person.phoneMobile.replace(/\s/g, '')) + '" style="' + getLinkStyle(config) + '">' + esc(person.phoneMobile) + '</a>');
  if (vf.phoneOffice && person.phoneOffice) contactParts.push('<a href="tel:' + esc(person.phoneOffice.replace(/\s/g, '')) + '" style="' + getLinkStyle(config) + '">' + esc(person.phoneOffice) + '</a>');
  if (contactParts.length > 0) rows += '<tr><td style="' + getContactStyle(config) + '">' + contactParts.join(makeSeparator(company.colors.secondary)) + '</td></tr>';

  var companyParts = [];
  if (vf.companyWeb && company.website) companyParts.push('<a href="' + esc(company.website) + '" style="' + getLinkStyle(config) + '" target="_blank">' + esc(company.website.replace(/^https?:\/\//, '')) + '</a>');
  if (vf.companyAddress && company.address) companyParts.push('<span style="' + getContactStyle(config) + '">' + esc(company.address) + '</span>');
  if (vf.companyPhone && company.phone) companyParts.push('<a href="tel:' + esc(company.phone.replace(/\s/g, '')) + '" style="' + getLinkStyle(config) + '">' + esc(company.phone) + '</a>');
  if (vf.companyEmail && company.email) companyParts.push('<a href="mailto:' + esc(company.email) + '" style="' + getLinkStyle(config) + '">' + esc(company.email) + '</a>');
  if (companyParts.length > 0) rows += '<tr><td style="' + getContactStyle(config) + '">' + companyParts.join(makeSeparator(company.colors.secondary)) + '</td></tr>';

  if (vf.customFields && person.customFields && person.customFields.length > 0) {
    var cfParts = person.customFields.filter(function(cf) { return cf.label && cf.value; }).map(function(cf) { return '<span style="' + getContactStyle(config) + '">' + esc(cf.label) + ': ' + esc(cf.value) + '</span>'; });
    if (cfParts.length > 0) rows += '<tr><td style="' + getContactStyle(config) + '">' + cfParts.join(makeSeparator(company.colors.secondary)) + '</td></tr>';
  }

  if (vf.socialLinks && company.socialLinks && company.socialLinks.length > 0) {
    var icons = company.socialLinks.filter(function(s) { return s.url && s.iconUrl; }).map(function(s) { return '<a href="' + esc(s.url) + '" target="_blank" style="text-decoration:none;display:inline-block;margin-right:6px;"><img src="' + esc(s.iconUrl) + '" alt="' + esc(s.platform) + '" width="20" height="20" style="' + getSocialIconStyle() + '" /></a>'; }).join('');
    if (icons) rows += '<tr><td style="padding-top:8px;">' + icons + '</td></tr>';
  }

  // Logo at the bottom (after text/contacts)
  if (vf.companyLogo && company.logoUrl) {
    rows += '<tr><td style="padding-top:' + gap + 'px;"><img src="' + esc(company.logoUrl) + '" alt="' + esc(company.name) + '" width="' + sigConfig.logoWidth + '" style="display:block; border:0; max-width:' + sigConfig.logoWidth + 'px; margin:0; padding:0;" /></td></tr>';
  }

  if (photoOnBottom && photoRow) rows += photoRow;

  return '<table cellpadding="0" cellspacing="0" border="0" style="' + getTableStyle(600) + '"><tbody>' + rows + '</tbody></table>';
}

function buildSignature(company, person, sigConfig) {
  if (!company || !person || !sigConfig) return '';
  if (sigConfig.layout === 'vertical') return buildVerticalSignature(company, person, sigConfig);
  return buildHorizontalSignature(company, person, sigConfig);
}

function formatHtml(html) {
  if (!html) return '';
  var formatted = '';
  var indent = 0;
  var lines = html.replace(/></g, '>\n<').split('\n');
  for (var i = 0; i < lines.length; i++) {
    var trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (trimmed.indexOf('</') === 0) indent = Math.max(0, indent - 1);
    formatted += '  '.repeat(indent) + trimmed + '\n';
    if (trimmed.charAt(0) === '<' && trimmed.indexOf('</') !== 0 && trimmed.slice(-2) !== '/>' && trimmed.indexOf('</') === -1 && trimmed.indexOf('<img') !== 0 && trimmed.indexOf('<br') !== 0 && trimmed !== '&nbsp;') indent++;
  }
  return formatted.trim();
}

// ============================================
// TOAST
// ============================================

function showToast(message, type) {
  type = type || 'success';
  var c = document.getElementById('toast-container');
  if (!c) return;
  var toast = document.createElement('div');
  toast.className = 'sg-toast sg-toast--' + type;
  var icon = type === 'success'
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  toast.innerHTML = icon + '<span>' + message + '</span>';
  c.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('sg-toast--hiding');
    setTimeout(function() { toast.remove(); }, 200);
  }, 3000);
}

// ============================================
// MODAL
// ============================================

var modalInitialized = false;

function initModal() {
  if (modalInitialized) return;
  var overlay = document.getElementById('modal-overlay');
  var closeBtn = document.getElementById('modal-close');
  if (!overlay) return;
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
  modalInitialized = true;
}

function openModal(title, contentHtml) {
  initModal();
  var overlay = document.getElementById('modal-overlay');
  var titleEl = document.getElementById('modal-title');
  var bodyEl = document.getElementById('modal-body');
  if (!overlay) return;
  titleEl.textContent = title;
  bodyEl.innerHTML = contentHtml;
  overlay.classList.add('sg-modal-overlay--visible');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  var overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('sg-modal-overlay--visible');
  document.body.style.overflow = '';
}

// ============================================
// DEBOUNCE
// ============================================

function debounce(fn, delay) {
  delay = delay || 300;
  var timer;
  return function() {
    var args = arguments;
    var ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
  };
}

// ============================================
// SIDEBAR
// ============================================

function initSidebar() {
  var addBtn = document.getElementById('btn-add-person');
  if (addBtn) addBtn.addEventListener('click', handleAddPerson);

  subscribe('companies:changed', renderCompanyList);
  subscribe('persons:changed', renderPersonList);
  subscribe('ui:companyChanged', function() { renderCompanyList(); renderPersonList(); });
  subscribe('ui:personChanged', renderPersonList);

  renderCompanyList();
  renderPersonList();
}

function renderCompanyList() {
  var el = document.getElementById('company-list');
  if (!el) return;
  el.innerHTML = '';
  state.companies.forEach(function(company) {
    var isActive = company.id === state.ui.activeCompanyId;
    var item = document.createElement('div');
    item.className = 'sg-list-item' + (isActive ? ' sg-list-item--active' : '');
    item.innerHTML = '<span class="sg-list-item__dot" style="background-color: ' + company.colors.primary + '"></span><span class="sg-list-item__name">' + escHtml(company.name) + '</span>';
    item.addEventListener('click', function() { setActiveCompany(company.id); });
    el.appendChild(item);
  });
}

function renderPersonList() {
  var el = document.getElementById('person-list');
  if (!el) return;
  el.innerHTML = '';
  var companyId = state.ui.activeCompanyId;
  if (!companyId) return;
  var persons = state.persons.filter(function(p) { return p.companyId === companyId; });
  if (persons.length === 0) {
    el.innerHTML = '<div class="sg-empty" style="padding:16px 0"><div class="sg-empty__text">Zatím žádné osoby</div></div>';
    return;
  }
  persons.forEach(function(person) {
    var isActive = person.id === state.ui.activePersonId;
    var item = document.createElement('div');
    item.className = 'sg-list-item' + (isActive ? ' sg-list-item--active' : '');
    item.innerHTML = '<span class="sg-list-item__name">' + escHtml(person.name || 'Nová osoba') + '</span><button class="sg-list-item__delete" title="Smazat osobu"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>';
    var deleteBtn = item.querySelector('.sg-list-item__delete');
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (confirm('Smazat osobu "' + (person.name || 'Nová osoba') + '"?')) deletePerson(person.id);
    });
    item.addEventListener('click', function(e) {
      if (!e.target.closest('.sg-list-item__delete')) setActivePerson(person.id);
    });
    el.appendChild(item);
  });
}

function handleAddPerson() {
  var companyId = state.ui.activeCompanyId;
  if (!companyId) return;
  var newPerson = createDefaultPerson(companyId);
  newPerson.id = generateId('person');
  addPerson(newPerson);
  setActivePerson(newPerson.id);
}

// ============================================
// COMPANY EDITOR
// ============================================

var COMPANY_TEXT_FIELDS = {
  'company-name': 'name', 'company-logo': 'logoUrl', 'company-website': 'website',
  'company-email': 'email', 'company-phone': 'phone', 'company-address': 'address'
};

var COMPANY_COLOR_FIELDS = {
  'company-color-primary': 'colors.primary', 'company-color-secondary': 'colors.secondary',
  'company-color-text': 'colors.text', 'company-color-divider': 'colors.divider'
};

function initCompanyEditor() {
  Object.keys(COMPANY_TEXT_FIELDS).forEach(function(inputId) {
    var field = COMPANY_TEXT_FIELDS[inputId];
    var el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('input', debounce(function() {
      var company = getActiveCompany();
      if (!company) return;
      var upd = {}; upd[field] = el.value;
      updateCompany(company.id, upd);
    }));
  });

  Object.keys(COMPANY_COLOR_FIELDS).forEach(function(inputId) {
    var path = COMPANY_COLOR_FIELDS[inputId];
    var colorEl = document.getElementById(inputId);
    var hexEl = document.getElementById(inputId + '-hex');
    if (!colorEl || !hexEl) return;
    colorEl.addEventListener('input', function() {
      hexEl.value = colorEl.value;
      updateColorField(path, colorEl.value);
    });
    hexEl.addEventListener('input', debounce(function() {
      if (/^#[0-9a-fA-F]{6}$/.test(hexEl.value)) {
        colorEl.value = hexEl.value;
        updateColorField(path, hexEl.value);
      }
    }, 500));
  });

  var addSocialBtn = document.getElementById('btn-add-social');
  if (addSocialBtn) addSocialBtn.addEventListener('click', addSocialLink);

  subscribe('ui:companyChanged', populateCompanyEditor);
}

function updateColorField(path, value) {
  var company = getActiveCompany();
  if (!company) return;
  var parts = path.split('.');
  var updated = Object.assign({}, company[parts[0]]);
  updated[parts[1]] = value;
  var upd = {}; upd[parts[0]] = updated;
  updateCompany(company.id, upd);
}

function populateCompanyEditor() {
  var company = getActiveCompany();
  if (!company) return;
  Object.keys(COMPANY_TEXT_FIELDS).forEach(function(inputId) {
    var el = document.getElementById(inputId);
    if (el) el.value = company[COMPANY_TEXT_FIELDS[inputId]] || '';
  });
  Object.keys(COMPANY_COLOR_FIELDS).forEach(function(inputId) {
    var parts = COMPANY_COLOR_FIELDS[inputId].split('.');
    var value = (company[parts[0]] && company[parts[0]][parts[1]]) || '#000000';
    var colorEl = document.getElementById(inputId);
    var hexEl = document.getElementById(inputId + '-hex');
    if (colorEl) colorEl.value = value;
    if (hexEl) hexEl.value = value;
  });
  renderSocialLinks();
}

function renderSocialLinks() {
  var company = getActiveCompany();
  var container = document.getElementById('social-links-list');
  if (!container || !company) return;
  container.innerHTML = '';
  if (!company.socialLinks || company.socialLinks.length === 0) {
    container.innerHTML = '<div style="font-size:13px;color:var(--color-text-muted);padding:4px 0;">Zatím žádné sociální sítě</div>';
    return;
  }
  company.socialLinks.forEach(function(link, index) {
    var row = document.createElement('div');
    row.className = 'sg-social-row';
    row.innerHTML = '<input type="text" class="sg-input" placeholder="Název (LinkedIn)" value="' + escAttr(link.platform) + '" data-field="platform" data-index="' + index + '"><input type="url" class="sg-input" placeholder="URL profilu" value="' + escAttr(link.url) + '" data-field="url" data-index="' + index + '"><input type="url" class="sg-input" placeholder="URL ikony" value="' + escAttr(link.iconUrl) + '" data-field="iconUrl" data-index="' + index + '"><button class="sg-btn sg-btn--danger sg-btn--sm" data-remove-index="' + index + '" title="Odebrat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    row.querySelectorAll('input').forEach(function(input) {
      input.addEventListener('input', debounce(function() {
        updateSocialLink(parseInt(input.dataset.index), input.dataset.field, input.value);
      }));
    });
    row.querySelector('[data-remove-index]').addEventListener('click', function() { removeSocialLink(index); });
    container.appendChild(row);
  });
}

function addSocialLink() {
  var company = getActiveCompany();
  if (!company) return;
  var links = (company.socialLinks || []).slice();
  links.push({ id: generateId('social'), platform: '', url: '', iconUrl: '' });
  updateCompany(company.id, { socialLinks: links });
  renderSocialLinks();
}

function updateSocialLink(index, field, value) {
  var company = getActiveCompany();
  if (!company) return;
  var links = (company.socialLinks || []).slice();
  if (!links[index]) return;
  links[index] = Object.assign({}, links[index]);
  links[index][field] = value;
  updateCompany(company.id, { socialLinks: links });
}

function removeSocialLink(index) {
  var company = getActiveCompany();
  if (!company) return;
  var links = (company.socialLinks || []).slice();
  links.splice(index, 1);
  updateCompany(company.id, { socialLinks: links });
  renderSocialLinks();
}

// ============================================
// PERSON EDITOR
// ============================================

var PERSON_FIELDS = {
  'person-name': 'name', 'person-position': 'position', 'person-email': 'email',
  'person-phone-mobile': 'phoneMobile', 'person-phone-office': 'phoneOffice', 'person-photo': 'photoUrl'
};

var VISIBILITY_FIELDS = [
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

function initPersonEditor() {
  subscribe('ui:personChanged', populatePersonEditor);
}

function populatePersonEditor() {
  var container = document.getElementById('person-editor-content');
  if (!container) return;
  var person = getActivePerson();
  if (!person) {
    container.innerHTML = '<div class="sg-empty"><div class="sg-empty__icon">&#128100;</div><div class="sg-empty__text">Vyberte osobu ze seznamu nebo přidejte novou</div></div>';
    return;
  }

  container.innerHTML = '<div class="sg-card"><div class="sg-card__title">Kontaktní údaje</div><div class="sg-form-group"><label class="sg-label">Jméno a příjmení</label><input type="text" class="sg-input" id="person-name" placeholder="Jan Novák" value="' + escAttr(person.name) + '"></div><div class="sg-form-group"><label class="sg-label">Pozice</label><input type="text" class="sg-input" id="person-position" placeholder="Obchodní ředitel" value="' + escAttr(person.position) + '"></div><div class="sg-form-group"><label class="sg-label">E-mail</label><input type="email" class="sg-input" id="person-email" placeholder="jan.novak@firma.cz" value="' + escAttr(person.email) + '"></div><div class="sg-form-row"><div class="sg-form-group"><label class="sg-label">Mobil</label><input type="tel" class="sg-input" id="person-phone-mobile" placeholder="+420 777 123 456" value="' + escAttr(person.phoneMobile) + '"></div><div class="sg-form-group"><label class="sg-label">Telefon kancelář</label><input type="tel" class="sg-input" id="person-phone-office" placeholder="+420 222 333 444" value="' + escAttr(person.phoneOffice) + '"></div></div><div class="sg-form-group"><label class="sg-label">Foto URL</label><input type="url" class="sg-input" id="person-photo" placeholder="https://example.com/photo.jpg" value="' + escAttr(person.photoUrl) + '"></div></div><div class="sg-card"><div class="sg-card__title">Viditelnost polí v podpisu</div><div class="sg-visibility-grid" id="visibility-grid"></div></div><div class="sg-card"><div class="sg-card__title">Vlastní pole<button class="sg-btn sg-btn--ghost sg-btn--sm" id="btn-add-custom-field"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Přidat</button></div><div id="custom-fields-list"></div></div>';

  Object.keys(PERSON_FIELDS).forEach(function(inputId) {
    var field = PERSON_FIELDS[inputId];
    var el = document.getElementById(inputId);
    if (!el) return;
    el.addEventListener('input', debounce(function() {
      var p = getActivePerson();
      if (!p) return;
      var upd = {}; upd[field] = el.value;
      updatePerson(p.id, upd);
    }));
  });

  renderVisibilityGrid(person);
  renderCustomFields(person);

  var addCfBtn = document.getElementById('btn-add-custom-field');
  if (addCfBtn) addCfBtn.addEventListener('click', addCustomField);
}

function renderVisibilityGrid(person) {
  var grid = document.getElementById('visibility-grid');
  if (!grid) return;
  grid.innerHTML = '';
  VISIBILITY_FIELDS.forEach(function(vf) {
    var checked = person.visibleFields[vf.key] ? ' checked' : '';
    var disabled = vf.disabled ? ' disabled' : '';
    var cls = vf.disabled ? 'sg-checkbox sg-checkbox--disabled' : 'sg-checkbox';
    var label = document.createElement('label');
    label.className = cls;
    label.innerHTML = '<input type="checkbox"' + checked + disabled + ' data-vf-key="' + vf.key + '"> ' + vf.label;
    if (!vf.disabled) {
      var cb = label.querySelector('input');
      cb.addEventListener('change', function() {
        var p = getActivePerson();
        if (!p) return;
        var newVf = Object.assign({}, p.visibleFields);
        newVf[vf.key] = cb.checked;
        updatePerson(p.id, { visibleFields: newVf });
      });
    }
    grid.appendChild(label);
  });
}

function renderCustomFields(person) {
  var container = document.getElementById('custom-fields-list');
  if (!container) return;
  container.innerHTML = '';
  if (!person.customFields || person.customFields.length === 0) {
    container.innerHTML = '<div style="font-size:13px;color:var(--color-text-muted);padding:4px 0;">Žádná vlastní pole</div>';
    return;
  }
  person.customFields.forEach(function(cf, index) {
    var row = document.createElement('div');
    row.className = 'sg-custom-field-row';
    row.innerHTML = '<input type="text" class="sg-input" placeholder="Název" value="' + escAttr(cf.label) + '" data-cf-field="label" data-cf-index="' + index + '"><input type="text" class="sg-input" placeholder="Hodnota" value="' + escAttr(cf.value) + '" data-cf-field="value" data-cf-index="' + index + '"><button class="sg-btn sg-btn--danger sg-btn--sm" data-cf-remove="' + index + '" title="Odebrat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    row.querySelectorAll('input').forEach(function(input) {
      input.addEventListener('input', debounce(function() {
        var p = getActivePerson();
        if (!p) return;
        var fields = (p.customFields || []).slice();
        var idx = parseInt(input.dataset.cfIndex);
        if (!fields[idx]) return;
        fields[idx] = Object.assign({}, fields[idx]);
        fields[idx][input.dataset.cfField] = input.value;
        updatePerson(p.id, { customFields: fields });
      }));
    });
    row.querySelector('[data-cf-remove]').addEventListener('click', function() { removeCustomField(index); });
    container.appendChild(row);
  });
}

function addCustomField() {
  var p = getActivePerson();
  if (!p) return;
  var fields = (p.customFields || []).slice();
  fields.push({ id: generateId('cf'), label: '', value: '' });
  updatePerson(p.id, { customFields: fields });
  populatePersonEditor();
}

function removeCustomField(index) {
  var p = getActivePerson();
  if (!p) return;
  var fields = (p.customFields || []).slice();
  fields.splice(index, 1);
  updatePerson(p.id, { customFields: fields });
  populatePersonEditor();
}

// ============================================
// SIGNATURE EDITOR
// ============================================

function initSignatureEditor() {
  initToggleGroup('layout-toggle', 'layout', function(val) {
    var c = getActiveSignatureConfig(); if (c) updateSignatureConfig(c.companyId, { layout: val });
    updatePhotoPositionLabels(val);
  });
  initToggleGroup('divider-toggle', 'divider', function(val) {
    var c = getActiveSignatureConfig(); if (c) updateSignatureConfig(c.companyId, { dividerStyle: val });
  });
  initToggleGroup('photo-shape-toggle', 'shape', function(val) {
    var c = getActiveSignatureConfig(); if (c) updateSignatureConfig(c.companyId, { photoShape: val });
  });
  initToggleGroup('photo-position-toggle', 'position', function(val) {
    var c = getActiveSignatureConfig(); if (c) updateSignatureConfig(c.companyId, { photoPosition: val });
  });

  var fontSelect = document.getElementById('sig-font-family');
  if (fontSelect) fontSelect.addEventListener('change', function() {
    var company = getActiveCompany();
    if (!company) return;
    updateCompany(company.id, { fonts: Object.assign({}, company.fonts, { family: fontSelect.value }) });
  });

  initRangeInput('sig-name-size', 'sig-name-size-val', function(v) { var c = getActiveCompany(); if (c) updateCompany(c.id, { fonts: Object.assign({}, c.fonts, { nameFontSize: v }) }); });
  initRangeInput('sig-title-size', 'sig-title-size-val', function(v) { var c = getActiveCompany(); if (c) updateCompany(c.id, { fonts: Object.assign({}, c.fonts, { titleFontSize: v }) }); });
  initRangeInput('sig-contact-size', 'sig-contact-size-val', function(v) { var c = getActiveCompany(); if (c) updateCompany(c.id, { fonts: Object.assign({}, c.fonts, { contactFontSize: v }) }); });
  initRangeInput('sig-divider-width', 'sig-divider-width-val', function(v) { var c = getActiveSignatureConfig(); if (c) updateSignatureConfig(c.companyId, { dividerWidth: v }); });
  initRangeInput('sig-logo-width', 'sig-logo-width-val', function(v) { var c = getActiveSignatureConfig(); if (c) updateSignatureConfig(c.companyId, { logoWidth: v }); });
  initRangeInput('sig-photo-width', 'sig-photo-width-val', function(v) { var c = getActiveSignatureConfig(); if (c) updateSignatureConfig(c.companyId, { photoWidth: v }); });
  initRangeInput('sig-section-gap', 'sig-section-gap-val', function(v) { var c = getActiveSignatureConfig(); if (c) updateSignatureConfig(c.companyId, { sectionGap: v }); });

  subscribe('ui:companyChanged', populateSignatureEditor);
}

function initToggleGroup(groupId, dataAttr, onChange) {
  var group = document.getElementById(groupId);
  if (!group) return;
  group.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-' + dataAttr + ']');
    if (!btn) return;
    group.querySelectorAll('.sg-toggle-group__btn').forEach(function(b) { b.classList.remove('sg-toggle-group__btn--active'); });
    btn.classList.add('sg-toggle-group__btn--active');
    onChange(btn.dataset[dataAttr]);
  });
}

function initRangeInput(inputId, valueId, onChange) {
  var input = document.getElementById(inputId);
  var valueEl = document.getElementById(valueId);
  if (!input) return;
  input.addEventListener('input', function() {
    var val = parseInt(input.value);
    if (valueEl) valueEl.textContent = val + 'px';
    onChange(val);
  });
}

function populateSignatureEditor() {
  var company = getActiveCompany();
  var config = getActiveSignatureConfig();
  if (!company || !config) return;
  var fontSelect = document.getElementById('sig-font-family');
  if (fontSelect) fontSelect.value = company.fonts.family;
  setRangeValue('sig-name-size', 'sig-name-size-val', company.fonts.nameFontSize);
  setRangeValue('sig-title-size', 'sig-title-size-val', company.fonts.titleFontSize);
  setRangeValue('sig-contact-size', 'sig-contact-size-val', company.fonts.contactFontSize);
  setRangeValue('sig-divider-width', 'sig-divider-width-val', config.dividerWidth);
  setRangeValue('sig-logo-width', 'sig-logo-width-val', config.logoWidth);
  setRangeValue('sig-photo-width', 'sig-photo-width-val', config.photoWidth);
  setRangeValue('sig-section-gap', 'sig-section-gap-val', config.sectionGap);
  setToggleValue('layout-toggle', 'layout', config.layout);
  setToggleValue('divider-toggle', 'divider', config.dividerStyle);
  setToggleValue('photo-shape-toggle', 'shape', config.photoShape);
  setToggleValue('photo-position-toggle', 'position', config.photoPosition || 'left');
  updatePhotoPositionLabels(config.layout);
}

function setRangeValue(inputId, valueId, val) {
  var input = document.getElementById(inputId);
  var valueEl = document.getElementById(valueId);
  if (input) input.value = val;
  if (valueEl) valueEl.textContent = val + 'px';
}

function setToggleValue(groupId, dataAttr, value) {
  var group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.sg-toggle-group__btn').forEach(function(btn) {
    btn.classList.toggle('sg-toggle-group__btn--active', btn.dataset[dataAttr] === value);
  });
}

function updatePhotoPositionLabels(layout) {
  var group = document.getElementById('photo-position-toggle');
  if (!group) return;
  var btns = group.querySelectorAll('.sg-toggle-group__btn');
  if (btns.length < 2) return;
  if (layout === 'vertical') {
    btns[0].textContent = 'Nahoře';
    btns[1].textContent = 'Dole';
  } else {
    btns[0].textContent = 'Vlevo';
    btns[1].textContent = 'Vpravo';
  }
}

// ============================================
// PREVIEW PANEL
// ============================================

var currentHtml = '';

function initPreviewPanel() {
  var clientBtns = document.querySelectorAll('.sg-preview__client-btn');
  clientBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      clientBtns.forEach(function(b) { b.classList.remove('sg-preview__client-btn--active'); });
      btn.classList.add('sg-preview__client-btn--active');
      setPreviewClient(btn.dataset.client);
    });
  });

  subscribe('ui:companyChanged', updatePreview);
  subscribe('ui:personChanged', updatePreview);
  subscribe('ui:previewClientChanged', updatePreview);
  subscribe('company:updated', updatePreview);
  subscribe('person:updated', updatePreview);
  subscribe('signatureConfig:updated', updatePreview);
  subscribe('signatureConfigs:changed', updatePreview);
}

function updatePreview() {
  var company = getActiveCompany();
  var person = getActivePerson();
  var config = getActiveSignatureConfig();
  var contentEl = document.getElementById('preview-content');
  var renderEl = document.getElementById('preview-render');
  var titleEl = document.getElementById('preview-title');
  var labelEl = document.getElementById('preview-label');
  if (!contentEl || !renderEl) return;

  if (!company || !person) {
    contentEl.innerHTML = '<div class="sg-empty"><div class="sg-empty__text">Vyberte firmu a osobu pro zobrazení náhledu</div></div>';
    currentHtml = '';
    if (labelEl) labelEl.textContent = '';
    return;
  }

  currentHtml = buildSignature(company, person, config);
  if (!currentHtml) {
    contentEl.innerHTML = '<div class="sg-empty"><div class="sg-empty__text">Vyplňte údaje osoby pro vygenerování podpisu</div></div>';
    if (labelEl) labelEl.textContent = '';
    return;
  }

  var client = state.ui.previewClient;
  renderEl.className = 'sg-preview__render';

  switch (client) {
    case 'gmail':
      renderEl.classList.add('sg-preview__render--gmail');
      contentEl.innerHTML = '<div style="font-family:Arial,sans-serif;font-size:13px;color:#222;padding-bottom:12px;"><div style="color:#5f6368;font-size:12px;padding-bottom:8px;">--</div>' + currentHtml + '</div>';
      if (titleEl) titleEl.textContent = 'Gmail';
      if (labelEl) labelEl.textContent = 'Simulace zobrazení v Gmail (webová verze)';
      break;
    case 'apple':
      renderEl.classList.add('sg-preview__render--apple');
      contentEl.innerHTML = '<div style="font-family:-apple-system,Helvetica Neue,sans-serif;font-size:14px;color:#000;">' + currentHtml + '</div>';
      if (titleEl) titleEl.textContent = 'Apple Mail';
      if (labelEl) labelEl.textContent = 'Simulace zobrazení v Apple Mail (macOS)';
      break;
    case 'ios':
      renderEl.classList.add('sg-preview__render--ios');
      contentEl.innerHTML = '<div style="font-family:-apple-system,sans-serif;font-size:15px;color:#000;max-width:320px;"><div style="color:#8e8e93;font-size:12px;padding-bottom:8px;">Odesláno z iPhonu</div>' + currentHtml + '</div>';
      if (titleEl) titleEl.textContent = 'iOS Mail';
      if (labelEl) labelEl.textContent = 'Simulace zobrazení v Mail (iPhone/iPad)';
      break;
    default:
      contentEl.innerHTML = currentHtml;
      if (titleEl) titleEl.textContent = 'Náhled podpisu';
      if (labelEl) labelEl.textContent = '';
  }
}

// ============================================
// OUTPUT PANEL
// ============================================

var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

function initOutputPanel() {
  var btnCopySig = document.getElementById('btn-copy-signature');
  var btnCopyHtml = document.getElementById('btn-copy-html');
  var btnSource = document.getElementById('btn-view-source');
  var btnGuide = document.getElementById('btn-install-guide');
  var btnAppleMail = document.getElementById('btn-export-apple-mail');
  if (btnCopySig) btnCopySig.addEventListener('click', copyRenderedSignature);
  if (btnCopyHtml) btnCopyHtml.addEventListener('click', copyHtmlSource);
  if (btnSource) btnSource.addEventListener('click', viewSource);
  if (btnGuide) btnGuide.addEventListener('click', showInstallGuide);
  if (btnAppleMail) btnAppleMail.addEventListener('click', exportAppleMailSignature);
}

function copyRenderedSignature() {
  if (!currentHtml) { showToast('Nejprve vygenerujte podpis', 'error'); return; }
  // Safari neumí správně kopírovat HTML přes ClipboardItem - rovnou použít DOM selection
  if (isSafari) { copyFallback(); return; }
  try {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentHtml;
    var plainText = tempDiv.textContent || tempDiv.innerText || '';
    var htmlBlob = new Blob([currentHtml], { type: 'text/html' });
    var textBlob = new Blob([plainText], { type: 'text/plain' });
    var clipboardItem = new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob });
    navigator.clipboard.write([clipboardItem]).then(function() {
      showToast('Podpis zkopírován do schránky');
    }).catch(function() { copyFallback(); });
  } catch (e) { copyFallback(); }
}

function copyFallback() {
  try {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = currentHtml;
    tempDiv.setAttribute('contenteditable', 'true');
    tempDiv.style.position = 'fixed';
    tempDiv.style.opacity = '0';
    tempDiv.style.left = '0';
    tempDiv.style.top = '0';
    tempDiv.style.pointerEvents = 'none';
    document.body.appendChild(tempDiv);
    var range = document.createRange();
    range.selectNodeContents(tempDiv);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    var success = document.execCommand('copy');
    selection.removeAllRanges();
    document.body.removeChild(tempDiv);
    if (success) {
      showToast('Podpis zkopírován do schránky');
    } else {
      showToast('Kopírování se nezdařilo - zkuste Kopírovat HTML', 'error');
    }
  } catch (e2) {
    showToast('Kopírování se nezdařilo', 'error');
  }
}

function copyHtmlSource() {
  if (!currentHtml) { showToast('Nejprve vygenerujte podpis', 'error'); return; }
  try {
    navigator.clipboard.writeText(currentHtml).then(function() { showToast('HTML kód zkopírován'); }).catch(function() { copyTextFallback(currentHtml); });
  } catch (e) { copyTextFallback(currentHtml); }
}

function copyTextFallback(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  showToast('HTML kód zkopírován');
}

function encodeQuotedPrintable(str) {
  var encoded = '';
  for (var i = 0; i < str.length; i++) {
    var ch = str.charAt(i);
    var code = str.charCodeAt(i);
    if (ch === '\n') { encoded += '=\n'; }
    else if (ch === '\r') { continue; }
    else if (code > 126 || code < 32 && code !== 9) {
      var bytes = unescape(encodeURIComponent(ch));
      for (var j = 0; j < bytes.length; j++) {
        encoded += '=' + ('0' + bytes.charCodeAt(j).toString(16).toUpperCase()).slice(-2);
      }
    } else if (ch === '=') { encoded += '=3D'; }
    else { encoded += ch; }
  }
  // Soft line breaks at 76 chars
  var lines = [];
  var line = '';
  for (var k = 0; k < encoded.length; k++) {
    line += encoded.charAt(k);
    if (line.length >= 74 && encoded.charAt(k) !== '\n') {
      lines.push(line + '=');
      line = '';
    }
    if (encoded.charAt(k) === '\n') {
      lines.push(line);
      line = '';
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

function exportAppleMailSignature() {
  if (!currentHtml) { showToast('Nejprve vygenerujte podpis', 'error'); return; }
  var person = getActivePerson();
  var company = getActiveCompany();
  var sigName = (person ? person.name : 'podpis') + (company ? ' - ' + company.name : '');
  var msgId = '<' + generateId('sig') + '@siggen.local>';

  var fullHtml = '<body style="word-wrap:break-word;-webkit-nbsp-mode:space;line-break:after-white-space;">' + currentHtml + '</body>';
  var encodedHtml = encodeQuotedPrintable(fullHtml);

  var fileContent = 'Content-Transfer-Encoding: quoted-printable\n'
    + 'Content-Type: text/html;\n'
    + '\tcharset=utf-8\n'
    + 'Mime-Version: 1.0 (Mac OS X Mail)\n'
    + 'Message-Id: ' + msgId + '\n'
    + '\n'
    + encodedHtml;

  var blob = new Blob([fileContent], { type: 'application/octet-stream' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = sigName.replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, '').replace(/\s+/g, '_') + '.mailsignature';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Soubor podpisu stažen');
  showAppleMailGuide();
}

function showAppleMailGuide() {
  openModal('Instalace podpisu do Apple Mail', ''
    + '<div class="sg-guide-notice sg-guide-notice--info"><strong>Toto je nejspolehlivější metoda</strong> pro HTML podpisy v Apple Mail. Obchází omezení Safari při kopírování.</div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">1</span><div class="sg-guide-step__text"><strong>Zavřete Apple Mail</strong> (úplně - Cmd+Q, ne jen okno).</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">2</span><div class="sg-guide-step__text">Ve <strong>Finderu</strong> stiskněte <strong>Cmd+Shift+G</strong> a vložte cestu:<br><code class="sg-code-inline">~/Library/Mail/V10/MailData/Signatures/</code><br><em>Pokud složka neexistuje, zkuste V9, V8 nebo V4. Pro iCloud účty:</em><br><code class="sg-code-inline">~/Library/Mobile Documents/com~apple~mail/Data/V4/Signatures/</code></div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">3</span><div class="sg-guide-step__text"><strong>Před kopírováním</strong> souboru nejprve v Apple Mail vytvořte nový prázdný podpis:<br>Mail &rarr; Nastavení &rarr; Podpisy &rarr; klikněte <strong>\"+\"</strong>. Pak Mail opět <strong>zavřete</strong>.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">4</span><div class="sg-guide-step__text">Ve složce Signatures najděte <strong>nejnovější .mailsignature soubor</strong>. Otevřete ho v TextEditu a <strong>nahraďte obsah od řádku &lt;body&gt;</strong> obsahem ze staženého souboru (ponechte hlavičku s Message-Id).</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">5</span><div class="sg-guide-step__text"><strong>Zamkněte soubor:</strong> pravý klik na soubor &rarr; Informace &rarr; zaškrtněte <strong>\"Zamčeno\"</strong>. Toto zabrání Apple Mailu přepsat váš podpis.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">6</span><div class="sg-guide-step__text"><strong>Otevřete Apple Mail</strong> a ověřte podpis vytvořením nového emailu.</div></div>'
    + '<div class="sg-guide-notice sg-guide-notice--warning"><strong>Tip:</strong> Po aktualizaci macOS zkontrolujte, zda podpis stále funguje. Apple občas resetuje soubory podpisů.</div>'
  );
}

function showSafariBanner() {
  if (!isSafari) return;
  var existing = document.getElementById('safari-banner');
  if (existing) return;
  var banner = document.createElement('div');
  banner.id = 'safari-banner';
  banner.className = 'sg-safari-banner';
  banner.innerHTML = '<div class="sg-safari-banner__content">'
    + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    + '<span>Pro kopírování podpisů doporučujeme použít <strong>Google Chrome</strong>. Safari má omezení při kopírování HTML. Alternativně použijte tlačítko <strong>\"Export pro Apple Mail\"</strong>.</span>'
    + '</div>'
    + '<button class="sg-safari-banner__close" id="safari-banner-close">&times;</button>';
  var app = document.querySelector('.sg-app');
  if (app) app.insertBefore(banner, app.firstChild);
  document.getElementById('safari-banner-close').addEventListener('click', function() { banner.remove(); });
}

function viewSource() {
  var html = formatHtml(currentHtml);
  if (!html) { showToast('Nejprve vygenerujte podpis', 'error'); return; }
  var escaped = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  openModal('Zdrojový kód podpisu', '<div style="display:flex; justify-content:flex-end; margin-bottom:12px;"><button class="sg-btn sg-btn--primary sg-btn--sm" id="btn-copy-source-modal">Kopírovat kód</button></div><pre class="sg-code-block"><code>' + escaped + '</code></pre>');
  var btn = document.getElementById('btn-copy-source-modal');
  if (btn) btn.addEventListener('click', copyHtmlSource);
}

function showInstallGuide() {
  var gmailGuide = ''
    + '<div class="sg-guide-content sg-guide-content--active" id="guide-gmail">'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">1</span><div class="sg-guide-step__text">Klikněte na tlačítko <strong>\"Kopírovat podpis\"</strong> v generátoru.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">2</span><div class="sg-guide-step__text">Otevřete <strong>Gmail</strong> a klikněte na ikonu ozubeného kola &rarr; <strong>Zobrazit všechna nastavení</strong>.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">3</span><div class="sg-guide-step__text">Přejděte do sekce <strong>\"Podpis\"</strong> a klikněte na <strong>\"Vytvořit nový\"</strong>.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">4</span><div class="sg-guide-step__text">Klikněte do textového pole podpisu a vložte pomocí <strong>Ctrl+V</strong> (nebo <strong>Cmd+V</strong> na Macu).</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">5</span><div class="sg-guide-step__text">Klikněte na <strong>\"Uložit změny\"</strong> v dolní části stránky.</div></div>'
    + '<div class="sg-guide-notice sg-guide-notice--info">Gmail funguje nejlépe s kopírováním podpisů. Pokud se podpis zobrazí jako text, zkontrolujte, že formát zprávy není nastaven na \"Prostý text\".</div>'
    + '</div>';

  var appleGuide = ''
    + '<div class="sg-guide-content" id="guide-apple">'
    + '<div class="sg-guide-notice sg-guide-notice--warning"><strong>Doporučujeme:</strong> Použijte tlačítko <strong>\"Export pro Apple Mail\"</strong> v generátoru - je to nejspolehlivější metoda. Pokud chcete přesto použít copy-paste, <strong>otevřete generátor v Google Chrome</strong> (Safari kopíruje HTML nesprávně).</div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">1</span><div class="sg-guide-step__text">Otevřete generátor v <strong>Google Chrome</strong> a klikněte <strong>\"Kopírovat podpis\"</strong>.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">2</span><div class="sg-guide-step__text">V Apple Mail otevřete <strong>Mail &rarr; Nastavení &rarr; Podpisy</strong>.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">3</span><div class="sg-guide-step__text">Klikněte na <strong>\"+\"</strong> pro vytvoření nového podpisu.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">4</span><div class="sg-guide-step__text"><strong>Důležité:</strong> Zrušte zaškrtnutí <strong>\"Vždy používat výchozí písmo zprávy\"</strong>.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">5</span><div class="sg-guide-step__text">Klikněte do pole podpisu a vložte pomocí <strong>Cmd+V</strong>.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">6</span><div class="sg-guide-step__text">Zavřete nastavení - podpis se uloží automaticky.</div></div>'
    + '<div class="sg-guide-notice sg-guide-notice--info"><strong>Alternativa (nejspolehlivější):</strong> Použijte tlačítko \"Export pro Apple Mail\" - stáhne .mailsignature soubor, který vložíte přímo do systémové složky Apple Mailu.</div>'
    + '</div>';

  var iosGuide = ''
    + '<div class="sg-guide-content" id="guide-ios">'
    + '<div class="sg-guide-notice sg-guide-notice--warning"><strong>Upozornění:</strong> iOS Mail má velmi omezenou podporu HTML podpisů. Výsledek nemusí odpovídat náhledu.</div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">1</span><div class="sg-guide-step__text">Na <strong>Macu</strong> v generátoru klikněte <strong>\"Kopírovat podpis\"</strong> (nejlépe v Chrome).</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">2</span><div class="sg-guide-step__text">Otevřete aplikaci <strong>Poznámky</strong> a vložte podpis (<strong>Cmd+V</strong>). Tato poznámka se synchronizuje s iPhonem.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">3</span><div class="sg-guide-step__text">Na <strong>iPhonu/iPadu</strong> otevřete Poznámky, vyberte celý podpis a zkopírujte ho.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">4</span><div class="sg-guide-step__text">Přejděte do <strong>Nastavení &rarr; Aplikace &rarr; Mail &rarr; Podpis</strong>.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">5</span><div class="sg-guide-step__text">Vyberte účet, podržte prst v poli podpisu a zvolte <strong>\"Vložit\"</strong>.</div></div>'
    + '<div class="sg-guide-step"><span class="sg-guide-step__number">6</span><div class="sg-guide-step__text"><em>Pokud se formátování ztratí, zkuste ihned po vložení <strong>zatřást telefonem</strong> - zobrazí se \"Odvolat změnu atributů\" - klepněte na <strong>Odvolat</strong>.</em></div></div>'
    + '</div>';

  openModal('Návod k instalaci podpisu', ''
    + '<div class="sg-guide-tabs">'
    + '<button class="sg-guide-tab sg-guide-tab--active" data-guide="gmail">Gmail</button>'
    + '<button class="sg-guide-tab" data-guide="apple">Apple Mail</button>'
    + '<button class="sg-guide-tab" data-guide="ios">iOS Mail</button>'
    + '</div>'
    + gmailGuide + appleGuide + iosGuide
  );

  var guideTabs = document.querySelectorAll('.sg-guide-tab');
  guideTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      guideTabs.forEach(function(t) { t.classList.remove('sg-guide-tab--active'); });
      tab.classList.add('sg-guide-tab--active');
      document.querySelectorAll('.sg-guide-content').forEach(function(c) { c.classList.remove('sg-guide-content--active'); });
      var target = document.getElementById('guide-' + tab.dataset.guide);
      if (target) target.classList.add('sg-guide-content--active');
    });
  });
}

// ============================================
// TABS
// ============================================

function initTabs() {
  var tabs = document.querySelectorAll('.sg-editor__tab');
  var panels = document.querySelectorAll('.sg-editor__panel');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var tabName = tab.dataset.tab;
      tabs.forEach(function(t) { t.classList.remove('sg-editor__tab--active'); });
      tab.classList.add('sg-editor__tab--active');
      panels.forEach(function(p) { p.classList.remove('sg-editor__panel--active'); });
      var panel = document.getElementById('panel-' + tabName);
      if (panel) panel.classList.add('sg-editor__panel--active');
      setActiveTab(tabName);
    });
  });
}

// ============================================
// EXPORT / IMPORT
// ============================================

function initExportImport() {
  var btnExport = document.getElementById('btn-export');
  if (btnExport) btnExport.addEventListener('click', function() {
    var data = exportAllData();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    var d = new Date();
    a.download = 'podpisy-export-' + d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exportována');
  });

  var importFile = document.getElementById('import-file');
  var btnImport = document.getElementById('btn-import');
  if (btnImport) btnImport.addEventListener('click', function() { if (importFile) importFile.click(); });
  if (importFile) importFile.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var data = JSON.parse(ev.target.result);
        importAllData(data);
        initState();
        if (state.companies.length > 0) setActiveCompany(state.companies[0].id);
        populateCompanyEditor();
        populateSignatureEditor();
        populatePersonEditor();
        updatePreview();
        showToast('Data importována');
      } catch (err) { showToast('Chyba při importu: ' + err.message, 'error'); }
    };
    reader.readAsText(file);
    importFile.value = '';
  });
}

function pad(n) { return n < 10 ? '0' + n : '' + n; }

// ============================================
// AUTO-SAVE
// ============================================

function autoSave() {
  subscribe('companies:changed', function() { saveData('companies', state.companies); });
  subscribe('persons:changed', function() { saveData('persons', state.persons); });
  subscribe('signatureConfigs:changed', function() { saveData('signatureConfigs', state.signatureConfigs); });
  subscribe('ui:companyChanged', function() { saveData('ui', state.ui); });
  subscribe('ui:personChanged', function() { saveData('ui', state.ui); });
}

// ============================================
// INIT
// ============================================

function initState() {
  var savedCompanies = loadData('companies');
  if (savedCompanies && savedCompanies.length > 0) {
    setCompanies(savedCompanies);
  } else {
    setCompanies(JSON.parse(JSON.stringify(DEFAULT_COMPANIES)));
  }

  var savedPersons = loadData('persons');
  setPersons(savedPersons || []);

  var savedConfigs = loadData('signatureConfigs');
  if (savedConfigs && Object.keys(savedConfigs).length > 0) {
    setSignatureConfigs(savedConfigs);
  } else {
    setSignatureConfigs(JSON.parse(JSON.stringify(DEFAULT_SIGNATURE_CONFIGS)));
  }
}

function init() {
  initState();
  initSidebar();
  initCompanyEditor();
  initPersonEditor();
  initSignatureEditor();
  initPreviewPanel();
  initOutputPanel();
  initTabs();
  initExportImport();
  autoSave();

  if (state.companies.length > 0) {
    var savedUi = loadData('ui');
    var activeCompanyId = (savedUi && savedUi.activeCompanyId) || state.companies[0].id;
    setActiveCompany(activeCompanyId);
    if (savedUi && savedUi.activePersonId) setActivePerson(savedUi.activePersonId);
  }

  populateCompanyEditor();
  populateSignatureEditor();
  populatePersonEditor();
  updatePreview();
  showSafariBanner();
}

document.addEventListener('DOMContentLoaded', init);

})();
