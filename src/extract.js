import { call } from './api.js';

export const extract = async (urls, template, options) => {
  return call('POST', '/api/extract', { urls, template, ...options });
};
