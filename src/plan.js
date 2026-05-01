import { call } from './api.js';
import { Job } from './detach.js';

export async function plan(args) {
  return call('POST', '/api/plan', args);
}

plan.detach = async (args) => {
  const data = await call('POST', '/api/plan', { ...args, detach: true });
  return new Job(data.jobId, { ...args, method: 'plan' });
};
