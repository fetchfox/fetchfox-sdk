import { call } from './api.js';

export const urls = {
  list: async (params) => call('GET', '/api/urls', params),
};
