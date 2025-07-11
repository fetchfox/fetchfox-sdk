import { call } from './api.js';

export const user = {
  get: async () => call('GET', '/api/user'),
};
