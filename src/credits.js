import { call } from './api.js';

export const credits = {
  balance: {
    get: async () => call('GET', '/api/credits/balance'),
  },
};
