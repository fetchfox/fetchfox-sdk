import { call } from './api.js';

export const crawl = async (pattern, options) => {
  return call('POST', '/api/crawl', { pattern, ...options });
};
