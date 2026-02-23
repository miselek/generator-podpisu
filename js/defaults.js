// Default data for 3 companies

export const DEFAULT_COMPANIES = [
  {
    id: 'company_nh',
    name: 'Nové Horizonty',
    logoUrl: '',
    website: 'https://www.novehorizonty.cz',
    email: 'info@novehorizonty.cz',
    phone: '',
    address: '',
    colors: {
      primary: '#1a56db',
      secondary: '#6b7280',
      text: '#1e293b',
      divider: '#1a56db'
    },
    fonts: {
      family: 'Arial, sans-serif',
      nameFontSize: 16,
      titleFontSize: 13,
      contactFontSize: 12
    },
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
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      text: '#1e293b',
      divider: '#059669'
    },
    fonts: {
      family: 'Arial, sans-serif',
      nameFontSize: 16,
      titleFontSize: 13,
      contactFontSize: 12
    },
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
    colors: {
      primary: '#7c3aed',
      secondary: '#6b7280',
      text: '#1e293b',
      divider: '#7c3aed'
    },
    fonts: {
      family: 'Arial, sans-serif',
      nameFontSize: 16,
      titleFontSize: 13,
      contactFontSize: 12
    },
    socialLinks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_SIGNATURE_CONFIGS = {
  company_nh: {
    companyId: 'company_nh',
    layout: 'horizontal',
    dividerStyle: 'solid',
    dividerWidth: 2,
    logoWidth: 120,
    photoWidth: 80,
    photoShape: 'rounded',
    sectionGap: 12,
    lineSpacing: 4
  },
  company_mc: {
    companyId: 'company_mc',
    layout: 'horizontal',
    dividerStyle: 'solid',
    dividerWidth: 2,
    logoWidth: 120,
    photoWidth: 80,
    photoShape: 'rounded',
    sectionGap: 12,
    lineSpacing: 4
  },
  company_sm: {
    companyId: 'company_sm',
    layout: 'horizontal',
    dividerStyle: 'solid',
    dividerWidth: 2,
    logoWidth: 120,
    photoWidth: 80,
    photoShape: 'rounded',
    sectionGap: 12,
    lineSpacing: 4
  }
};

export function createDefaultPerson(companyId) {
  return {
    id: '',  // must be set by caller
    companyId,
    name: '',
    position: '',
    email: '',
    phoneMobile: '',
    phoneOffice: '',
    photoUrl: '',
    customFields: [],
    visibleFields: {
      name: true,
      position: true,
      email: true,
      phoneMobile: true,
      phoneOffice: false,
      photo: false,
      companyLogo: true,
      companyWeb: true,
      companyAddress: true,
      companyPhone: false,
      companyEmail: false,
      socialLinks: true,
      customFields: false
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
