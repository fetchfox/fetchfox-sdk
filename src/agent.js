import { call } from './api.js';
import { Job } from './detach.js';

export async function agent(args) {
  return call('POST', '/api/agent', args);
}

agent.detach = async (args) => {
  const data = await call('POST', '/api/agent', { ...args, detach: true });
  return new Job(data.jobId, { ...args, method: 'agent' });
};
