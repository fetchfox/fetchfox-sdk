import { call } from './api.js';

export const proxy = {
  status: async () => {
    return call('GET', `/api/proxy/status`);
  },
};
