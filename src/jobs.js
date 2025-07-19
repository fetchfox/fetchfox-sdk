import { call } from './api.js';

export const jobs = {
  get: async (id) => {
    return call('GET', `/api/jobs/${id}`);
  },
  list: async (args) => {
    const limit = args?.limit ?? 100;
    const offset = args?.offset ?? 0;
    return call('GET', '/api/jobs', { limit, offset });
  },
};
