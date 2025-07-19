import { call } from './api.js';

export const scrape = async (args) => {
  return call('POST', '/api/scrape', args);
};
