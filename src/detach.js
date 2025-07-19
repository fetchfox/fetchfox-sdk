import { jobs } from './jobs.js';

class FetchFoxError extends Error {}

const interval = 1_000;

export const Job = class {
  #callbacks;

  constructor(id) {
    this.id = id;
    this.#callbacks = {
      completed: [],
      error: [],
      finished: [],
      progress: [],
    };

    this.poll();
  }

  get _finished() {
    return this._completed || this._error;
  }

  #select(data) {
    return {
      name: data.name,
      state: data.state,
      args: data.args,
      metrics: data.metrics,
      progress: data.progress,
      results: data.results,
      artifacts: data.artifacts,
    };
  }

  async get() {
    const data = await jobs.get(this.id);
    const s = this.#select(data);
    for (const key of Object.keys(s)) {
      this[key] = s[key];
    }
    return this;
  }

  async poll() {
    const last = JSON.stringify(this);
    await this.get();
    const didUpdate = JSON.stringify(this) != last;
    if (didUpdate) {
      console.log('Job progressed:', this);
      this.trigger('progress');

      if (this.state == 'completed') {
        this._completed = true;
        this.trigger('completed');
      }
      if (this.state == 'error') {
        this._error = true;
        this.trigger('error');
      }

      if (['completed', 'error'].includes(this.state)) {
        this.trigger('finished');
      }
    }

    if (!this._finished) {
      setTimeout(() => this.poll(), interval);
    }
  }

  checkEvent(event) {
    if (!this.#callbacks[event]) {
      throw new FetchFoxError(`Invalid event: ${event}`);
    }
  }

  trigger(event) {
    console.log('Trigger:', this.id, event);

    this.checkEvent(event);
    for (const cb of this.#callbacks[event]) {
      cb({ ...this });
    }
  }

  on(event, cb) {
    this.checkEvent(event);
    this.#callbacks[event].push(cb);
  }

  off(event, cb) {
    this.checkEvent(event);
    this.#callbacks[event] = this.#callbacks[event].filter((it) => it != cb);
  }

  async waitFor(event) {
    this.checkEvent(event);
    return new Promise((ok) => {
      this.on(event, () => {
        this.off(event, ok);
        ok({ ...this });
      });
    });
  }

  async completed() {
    return this.waitFor('completed');
  }

  async error() {
    return this.waitFor('error');
  }

  async finished() {
    return this.waitFor('finished');
  }
};
