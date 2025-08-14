import console from 'console';
global.console = console;
import { FetchFox } from '../src';

test('use fetchfox object @fetchfox @sanity', async () => {
  const fox = new FetchFox({
    apiKey: process.env.FETCHFOX_API_KEY,
  });
  const out = await fox.crawl({
    pattern: 'https://pokemondb.net/pokedex/*',
    maxVisits: 5,
  });
  expect(out.results.hits.length).toBeGreaterThan(10);
}, 30_000);

test('use fetchfox object for detach @fetchfox @sanity', async () => {
  const fox = new FetchFox({
    apiKey: process.env.FETCHFOX_API_KEY,
  });
  const job = await fox.crawl.detach({
    pattern: 'https://pokemondb.net/pokedex/*',
    maxVisits: 5,
  });

  let count = 0;
  job.on('progress', (data) => {
    count++;
  });

  await job.finished();

  expect(count).toBeGreaterThan(0);
}, 30_000);

test('invalid key fails @fetchfox @sanity', async () => {
  const fox = new FetchFox({
    apiKey: 'invalid',
  });

  let err;
  try {
    await fox.crawl({
      pattern: 'https://pokemondb.net/pokedex/*',
      maxVisits: 5,
    });
  } catch (e) {
    err = e;
  }

  expect(err).toBeTruthy();
}, 30_000);
