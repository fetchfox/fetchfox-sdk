import { crawl } from '../src';

test('crawl a pattern @sanity', async () => {
  const out = await crawl({
    pattern: 'https://pokemondb.net/pokedex/*',
    maxVisits: 5,
  });
  console.log(out);
}, 30_000);
