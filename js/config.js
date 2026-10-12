/**
 * js/config.js
 * Property Finder Real Estate - Mumbai
 * Global Application Configuration & Environment Settings
 */

(function (window) {
  'use strict';

  const PFRE_CONFIG = {
    BRAND: {
      name: 'Property Finder Real Estate',
      shortName: 'PFRE',
      tagline: 'Your Trusted Real Estate Partner in Mumbai',
      proprietor: 'Saurav Ganesh Chowdhury',
      established: '2018',
      reraNumber: 'A51800000412',
      licenseType: 'MahaRERA Registered Real Estate Agent',
      phone: '+919326990050',
      displayPhone: '+91 93269 90050',
      whatsapp: '+919326990050',
      email: 'propertyfinderre@gmail.com',
      officeAddress: {
        line1: 'Shop No. 2, Ground Floor, Baf-Hira Nagar',
        line2: 'Jankalyan Nagar Road, Malad West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400095',
        country: 'India',
        coordinates: {
          latitude: 19.1886,
          longitude: 72.8485
        }
      }
    },

    API: {
      BASE_URL: window.location.origin,
      TIMEOUT_MS: 10000,
      ENDPOINTS: {
        PROPERTIES: '/data/properties.json',
        PROJECTS: '/data/projects.json',
        CONTACTS: '/api/contacts',
        ADD_PROPERTY: '/api/add-property',
        POST_PROJECT: '/api/post-project',
        LEADS: '/api/leads'
      }
    },

    FEATURES: {
      LIVE_AUTH: false,
      USE_POSTGRES: true,
      OFFLINE_MODE: true,
      ENABLE_SERVICE_WORKER: true,
      ANALYTICS: true,
      LEAD_DEDUPLICATION: true
    },

    LOCALITIES: [
      'Malad West',
      'Malad East',
      'Goregaon West',
      'Goregaon East',
      'Andheri West',
      'Andheri East',
      'Kandivali West',
      'Kandivali East',
      'Borivali West',
      'Borivali East',
      'Bandra West',
      'Bandra East'
    ],

    PROPERTY_TYPES: [
      '1 BHK',
      '2 BHK',
      '3 BHK',
      '4+ BHK',
      'Penthouse',
      'Commercial Office',
      'Retail Shop',
      'Industrial Gala'
    ],

    STORAGE_KEYS: {
      THEME: 'pfre_theme',
      SESSION: 'pfre_session',
      AUTH_TOKEN: 'pfre_auth_token',
      PROPERTIES: 'cms_properties',
      PROJECTS: 'cms_projects',
      CONTACTS: 'pfre_phonebook_contacts',
      CRM_LEADS: 'pfre_crm_leads',
      ENQUIRIES: 'pfre_enquiries',
      ACTIVITIES: 'pfre_crm_activities'
    },

    CURRENCY: {
      SYMBOL: '₹',
      CODE: 'INR',
      LOCALE: 'en-IN'
    }
  };

  window.PFRE_CONFIG = PFRE_CONFIG;
})(window);