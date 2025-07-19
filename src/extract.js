import { call } from './api.js';

export const extract = async (args) => {
  return call('POST', '/api/extract', args);
};
