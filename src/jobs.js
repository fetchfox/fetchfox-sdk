import { call } from './api.js';

export const jobs = {
  get: async (id) => {
    return call('GET', `/api/jobs/${id}`);
  },
  list: async (limit = 100, offset = 0) => {
    return call('GET', '/api/jobs', { limit, offset });
  },
};
