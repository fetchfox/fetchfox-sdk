import { crawl } from './crawl.js';
import { extract } from './extract.js';
import { scrape } from './scrape.js';

export const FetchFox = class {
  constructor({ apiKey, host } = {}) {
    this.apiKey = apiKey;
    this.host = host;

    const fns = [crawl, extract, scrape];

    for (const fn of fns) {
      this[fn.name] = (args) =>
        fn({
          apiKey: this.apiKey,
          host: this.host,
          ...args,
        });
      this[fn.name].detach = (args) =>
        fn.detach({
          apiKey: this.apiKey,
          host: this.host,
          ...args,
        });
    }
  }
};
