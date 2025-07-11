import { jobs, configure } from '../src';

test('list jobs @sanity', async () => {
  configure({ host: 'http://localhost:3030' });
  const out = await jobs.list();
  console.log(out.results.map((it) => [it.id, it.details.state]));
});
