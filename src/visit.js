import { call } from './api.js';
import { Job } from './detach.js';

export async function visit(args) {
  return call('POST', '/api/visit', args);
}

visit.detach = async (args) => {
  const data = await call('POST', '/api/visit', { ...args, detach: true });
  return new Job(data.jobId, args);
};
