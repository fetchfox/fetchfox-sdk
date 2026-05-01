import { ws, appHost } from './configure.js';
import { jobs } from './jobs.js';

class FetchFoxError extends Error {}

const interval = 1_000;

export function getSocket() {}

export const Job = class {
  #callbacks;
  #wsUpdates;
  #wsChildren;
  #seen;
  #completed;
  #failed;

  constructor(id, options) {
    this.id = id;
    this.method = options?.method;
    this.#callbacks = {
      item: [],
      completed: [],
      failed: [],
      finished: [],
      progress: [],

      // new
      update: [],
      children: [],
    };

    this.#seen = {};
    this.#wsUpdates = new WebSocket(ws(options) + '/ws/jobs/' + id);
    this.#wsUpdates.onmessage = (data) => {
      let parsed;
      try {
        parsed = JSON.parse(data.data);
      } catch {
        return;
      }

      for (const key of Object.keys(parsed)) {
        this[key] = parsed[key];
      }

      this.trigger('update', parsed);

      if (!this.#completed && parsed.state == 'completed') {
        this.#completed = true;
        this.trigger('finished', parsed);
      }
      if (!this.#failed && parsed.state == 'failed') {
        this.#failed = true;
        this.trigger('finished', parsed);
      }
    };

    this.#wsChildren = new WebSocket(ws(options) + '/ws/children/' + id);
    this.#wsChildren.onmessage = (data) => {
      let parsed;
      try {
        parsed = JSON.parse(data.data);
      } catch {
        return;
      }
      this.trigger('children', parsed);
    };
  }

  get _finished() {
    return this.#completed || this.#failed;
  }

  get appUrl() {
    return [
      appHost(),
      this.method == 'agent' ? 'agents' : 'jobs',
      this.id,
    ].join('/');
  }

  #select(data) {
    const s = {};
    for (const key of Object.keys(data)) {
      const val = data[key] ?? this[key];
      if (val === undefined) {
        continue;
      }
      s[key] = val;
    }

    if (s.progress?.children?.jobs) {
      s.progress.children.jobs = s.progress.children.jobs.filter(
        (it) => !it.late
      );
    }

    return s;
  }

  checkEvent(event) {
    if (!this.#callbacks[event]) {
      throw new FetchFoxError(`Invalid event: ${event}`);
    }
  }

  trigger(event, data) {
    this.checkEvent(event);
    for (const cb of this.#callbacks[event]) {
      cb(data);
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

  async failed() {
    return this.waitFor('failed');
  }

  async finished() {
    return Promise.race([this.completed(), this.failed()]);
  }
};
