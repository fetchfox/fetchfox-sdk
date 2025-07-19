import { call } from './api.js';
import { Job } from './detach.js';

export const crawl = async function () {
  return call('POST', '/api/crawl', args);
};
crawl.detach = async (args) => {
  const data = await call('POST', '/api/crawl', { ...args, detach: true });
  console.log('detach data', data);
  return new Job(data.jobId);
};
