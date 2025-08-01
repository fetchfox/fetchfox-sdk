import { call } from './api.js';
import { Job } from './detach.js';

export const scrape = async (args) => {
  return call('POST', '/api/scrape', args);
};

scrape.detach = async (args) => {
  const data = await call('POST', '/api/scrape', { ...args, detach: true });
  return new Job(data.jobId);
};
