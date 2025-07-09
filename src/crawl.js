import { call } from './api';

export const crawl = async (pattern, options) => {
  return call('POST', '/api/crawl', { pattern, ...options});
}
