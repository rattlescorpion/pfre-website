/**
 * js/api.js
 * Property Finder Real Estate - Mumbai
 * Unified Client API Service Layer
 */

(function (window) {
  'use strict';

  const API_CONFIG = {
    endpoints: {
      properties: '/data/properties.json',
      projects: '/data/projects.json',
      contacts: '/api/contacts',
      addProperty: '/api/add-property',
      postProject: '/api/post-project',
      leads: '/api/leads'
    },
    storageKeys: {
      properties: 'cms_properties',
      projects: 'cms_projects',
      contacts: 'pfre_phonebook_contacts',
      enquiries: 'pfre_enquiries',
      crmLeads: 'pfre_crm_leads',
      session: 'pfre_session',
      authToken: 'pfre_auth_token'
    }
  };

  function getAuthHeader() {
    const token = sessionStorage.getItem(API_CONFIG.storageKeys.authToken) || '';
    const session = JSON.parse(localStorage.getItem(API_CONFIG.storageKeys.session) || '{}');
    const bearer = token || session.token || '';
    return bearer ? { Authorization: `Bearer ${bearer}` } : {};
  }

  const pfreApi = {
    /**
     * Properties
     */
    async getProperties() {
      try {
        const response = await fetch(API_CONFIG.endpoints.properties, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(API_CONFIG.storageKeys.properties, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Network fetch failed for properties, loading local cache:', err.message);
      }
      return JSON.parse(localStorage.getItem(API_CONFIG.storageKeys.properties) || '[]');
    },

    async getPropertyById(id) {
      const list = await this.getProperties();
      return list.find(item => item.id === id) || null;
    },

    async addProperty(propertyData, adminPassword = '') {
      const payload = {
        adminPassword: adminPassword || sessionStorage.getItem(API_CONFIG.storageKeys.authToken) || 'pfre2026',
        property: propertyData
      };

      try {
        const response = await fetch(API_CONFIG.endpoints.addProperty, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));
        if (response.ok && result.success) {
          return { success: true, data: result.property };
        }
        throw new Error(result.error || 'Server rejected property creation');
      } catch (err) {
        console.warn('API addProperty offline, storing in browser cache:', err.message);
        const cached = JSON.parse(localStorage.getItem(API_CONFIG.storageKeys.properties) || '[]');
        cached.unshift(propertyData);
        localStorage.setItem(API_CONFIG.storageKeys.properties, JSON.stringify(cached));
        return { success: true, data: propertyData, offline: true, error: err.message };
      }
    },

    /**
     * Projects
     */
    async getProjects() {
      try {
        const response = await fetch(API_CONFIG.endpoints.projects, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(API_CONFIG.storageKeys.projects, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('Network fetch failed for projects, loading local cache:', err.message);
      }
      return JSON.parse(localStorage.getItem(API_CONFIG.storageKeys.projects) || '[]');
    },

    async getProjectBySlug(slug) {
      const list = await this.getProjects();
      return list.find(item => item.slug === slug || item.id === slug) || null;
    },

    async addProject(projectData, adminPassword = '') {
      const payload = {
        adminPassword: adminPassword || sessionStorage.getItem(API_CONFIG.storageKeys.authToken) || 'pfre2026',
        project: projectData
      };

      try {
        const response = await fetch(API_CONFIG.endpoints.postProject, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));
        if (response.ok && result.success) {
          return { success: true, data: result.project };
        }
        throw new Error(result.error || 'Server rejected project creation');
      } catch (err) {
        console.warn('API addProject offline, storing in browser cache:', err.message);
        const cached = JSON.parse(localStorage.getItem(API_CONFIG.storageKeys.projects) || '[]');
        cached.unshift(projectData);
        localStorage.setItem(API_CONFIG.storageKeys.projects, JSON.stringify(cached));
        return { success: true, data: projectData, offline: true, error: err.message };
      }
    },

    /**
     * Contacts Directory
     */
    async getContacts() {
      try {
        const response = await fetch(API_CONFIG.endpoints.contacts, {
          headers: getAuthHeader(),
          cache: 'no-cache'
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.contacts)) {
            localStorage.setItem(API_CONFIG.storageKeys.contacts, JSON.stringify(result.contacts));
            return result.contacts;
          }
        }
      } catch (err) {
        console.warn('Contacts endpoint offline, serving local cache:', err.message);
      }
      return JSON.parse(localStorage.getItem(API_CONFIG.storageKeys.contacts) || '[]');
    },

    async saveContact(contactData) {
      const isUpdate = Boolean(contactData.id && contactData.updatedAt);
      const method = isUpdate ? 'PUT' : 'POST';

      try {
        const response = await fetch(API_CONFIG.endpoints.contacts, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({
            adminPassword: sessionStorage.getItem(API_CONFIG.storageKeys.authToken) || 'pfre2026',
            contact: contactData
          })
        });

        const result = await response.json().catch(() => ({}));
        if (response.ok && result.success) {
          return { success: true, data: result.contact };
        }
        throw new Error(result.error || 'Server failed to save contact');
      } catch (err) {
        console.warn('Contacts API offline, updating local cache:', err.message);
        const list = JSON.parse(localStorage.getItem(API_CONFIG.storageKeys.contacts) || '[]');
        const idx = list.findIndex(c => c.id === contactData.id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...contactData };
        } else {
          list.unshift(contactData);
        }
        localStorage.setItem(API_CONFIG.storageKeys.contacts, JSON.stringify(list));
        return { success: true, data: contactData, offline: true };
      }
    },

    async deleteContact(id) {
      try {
        const response = await fetch(API_CONFIG.endpoints.contacts, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({
            adminPassword: sessionStorage.getItem(API_CONFIG.storageKeys.authToken) || 'pfre2026',
            id
          })
        });

        const result = await response.json().catch(() => ({}));
        if (response.ok && result.success) {
          return { success: true };
        }
        throw new Error(result.error || 'Delete rejected by server');
      } catch (err) {
        console.warn('Delete contact API offline, updating local cache:', err.message);
        let list = JSON.parse(localStorage.getItem(API_CONFIG.storageKeys.contacts) || '[]');
        list = list.filter(c => c.id !== id);
        localStorage.setItem(API_CONFIG.storageKeys.contacts, JSON.stringify(list));
        return { success: true, offline: true };
      }
    },

    /**
     * Leads & Public Enquiries
     */
    async submitInquiry(inquiryData) {
      const payload = {
        id: 'lead-' + Date.now().toString(36),
        name: inquiryData.name || '',
        phone: inquiryData.phone || '',
        email: inquiryData.email || '',
        source: inquiryData.source || 'website_form',
        intent: inquiryData.intent || 'buy',
        locality: inquiryData.locality || 'Malad West',
        budget: inquiryData.budget || '',
        message: inquiryData.message || '',
        ts: Date.now(),
        createdAt: new Date().toISOString()
      };

      const localEnquiries = JSON.parse(localStorage.getItem(API_CONFIG.storageKeys.enquiries) || '[]');
      localEnquiries.unshift(payload);
      localStorage.setItem(API_CONFIG.storageKeys.enquiries, JSON.stringify(localEnquiries));

      const crmLeads = JSON.parse(localStorage.getItem(API_CONFIG.storageKeys.crmLeads) || '[]');
      const alreadyLogged = crmLeads.some(l => l.phone === payload.phone && payload.phone !== '');
      if (!alreadyLogged) {
        crmLeads.unshift({
          ...payload,
          stage: 'new',
          priority: 'hot',
          activities: [
            {
              type: 'lead_received',
              note: `Web form submitted from ${payload.source}`,
              ts: payload.createdAt
            }
          ]
        });
        localStorage.setItem(API_CONFIG.storageKeys.crmLeads, JSON.stringify(crmLeads));
      }

      try {
        const response = await fetch(API_CONFIG.endpoints.leads, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          return { success: true, data: payload, synced: true };
        }
      } catch (err) {
        console.log('Lead queued locally for CRM auto-sync:', err.message);
      }

      return { success: true, data: payload, synced: false };
    }
  };

  window.pfreApi = pfreApi;
})(window);