// Helper functions for generating inline CSS strings

export function makeStyle(styleObj) {
  return Object.entries(styleObj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([prop, value]) => `${camelToKebab(prop)}:${value}`)
    .join('; ');
}

function camelToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function getTableStyle(maxWidth) {
  return makeStyle({
    maxWidth: maxWidth + 'px',
    borderCollapse: 'collapse',
    borderSpacing: '0',
    margin: '0',
    padding: '0'
  });
}

export function getNameStyle(config) {
  return makeStyle({
    fontSize: config.fonts.nameFontSize + 'px',
    fontWeight: 'bold',
    color: config.colors.primary,
    fontFamily: config.fonts.family,
    lineHeight: '1.3',
    margin: '0',
    padding: '0 0 2px 0'
  });
}

export function getTitleStyle(config) {
  return makeStyle({
    fontSize: config.fonts.titleFontSize + 'px',
    fontWeight: 'normal',
    color: config.colors.secondary,
    fontFamily: config.fonts.family,
    lineHeight: '1.3',
    margin: '0',
    padding: '0 0 8px 0'
  });
}

export function getContactStyle(config) {
  return makeStyle({
    fontSize: config.fonts.contactFontSize + 'px',
    color: config.colors.text,
    fontFamily: config.fonts.family,
    lineHeight: '1.5',
    margin: '0',
    padding: '0 0 2px 0'
  });
}

export function getLinkStyle(config) {
  return makeStyle({
    color: config.colors.primary,
    textDecoration: 'none',
    fontSize: config.fonts.contactFontSize + 'px',
    fontFamily: config.fonts.family
  });
}

export function getDividerStyle(config, sigConfig, orientation) {
  if (sigConfig.dividerStyle === 'none') return null;

  const base = {
    backgroundColor: config.colors.divider,
    fontSize: '1px',
    lineHeight: '1px'
  };

  if (sigConfig.dividerStyle === 'dashed') {
    delete base.backgroundColor;
    if (orientation === 'vertical') {
      base.borderLeft = `${sigConfig.dividerWidth}px dashed ${config.colors.divider}`;
      base.width = sigConfig.dividerWidth + 'px';
    } else {
      base.borderTop = `${sigConfig.dividerWidth}px dashed ${config.colors.divider}`;
      base.height = sigConfig.dividerWidth + 'px';
    }
  } else {
    if (orientation === 'vertical') {
      base.width = sigConfig.dividerWidth + 'px';
    } else {
      base.height = sigConfig.dividerWidth + 'px';
    }
  }

  return makeStyle(base);
}

export function getPhotoStyle(sigConfig) {
  const borderRadius = sigConfig.photoShape === 'rounded' ? '50%' : '4px';
  return makeStyle({
    display: 'block',
    border: '0',
    borderRadius,
    width: sigConfig.photoWidth + 'px',
    height: sigConfig.photoWidth + 'px',
    objectFit: 'cover'
  });
}

export function getSocialIconStyle() {
  return makeStyle({
    display: 'inline-block',
    border: '0',
    verticalAlign: 'middle'
  });
}
