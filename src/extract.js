import { call } from './api.js';
import { Job } from './detach.js';

export const extract = async (args) => {
  return call('POST', '/api/extract', args);
};

extract.detach = async (args) => {
  const data = await call('POST', '/api/extract', { ...args, detach: true });
  console.log('detach data', data);
  return new Job(data.jobId);
};
