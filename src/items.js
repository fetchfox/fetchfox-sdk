import { call } from './api.js';

export async function items(jobId, args) {
  return call('GET', `/api/jobs/${jobId}/items`, args);
}
