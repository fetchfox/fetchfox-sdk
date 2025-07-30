import { call } from './api.js';
import { Job } from './detach.js';

export const scrape = async (args) => {
  return call('POST', '/api/scrape', args);
};

scrape.detach = async (args) => {
  const data = await call('POST', '/api/scrape', { ...args, detach: true });
  console.log('detach data', data);
  return new Job(data.jobId);
};
