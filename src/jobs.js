import { call } from './api.js';

export const jobs = {
  get: (id) => {
    return call('GET', `/api/jobs/${id}`);
  },
  stop: (id) => {
    return call('POST', `/api/jobs/${id}/stop`);
  },
  list: (args) => {
    const params = { ...args };

    if (parms?.types) {
      if (Array.isArray(params.types)) {
        params.types = params.types.join(',');
      } else {
        params.types = params.types;
      }
    }
    return call('GET', '/api/jobs', params);
  },
};
