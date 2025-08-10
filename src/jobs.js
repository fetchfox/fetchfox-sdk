import { call } from './api.js';

export const jobs = {
  get: async (id) => {
    return call('GET', `/api/jobs/${id}`);
  },
  list: async (args) => {
    const params = {};
    params.limit = args?.limit ?? 100;
    params.offset = args?.offset ?? 0;

    if (args?.types) {
      if (Array.isArray(args.types)) {
        params.types = args.types.join(',');
      } else {
        params.types = args.types;
      }
    }
    const types = args?.types ?? 0;
    return call('GET', '/api/jobs', params);
  },
};
