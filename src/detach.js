import { io } from 'socket.io-client';
import { ws, appHost } from './configure.js';
import { jobs } from './jobs.js';

class FetchFoxError extends Error {}

const interval = 1_000;

export function getSocket() {}

export const Job = class {
  #callbacks;
  #socket;
  #socket2;
  #socket3;
  #seen;
  #completed;
  #failed;

  constructor(id, options) {
    this.id = id;
    this.name = options?.name;
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
    this.#socket2 = new WebSocket(ws(options) + '/ws/jobs/' + id);
    this.#socket2.onmessage = (data) => {
      let parsed;
      try {
        parsed = JSON.parse(data.data);
      } catch {
        return;
      }
      this.trigger('update', parsed);
    };

    this.#socket3 = new WebSocket(ws(options) + '/ws/children/' + id);
    this.#socket3.onmessage = (data) => {
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
    return [appHost(), this.name == 'agent' ? 'agents' : 'jobs', this.id].join(
      '/'
    );
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

  updateFromData(data) {
    const s = this.#select(data);
    for (const key of Object.keys(s)) {
      this[key] = s[key];
    }
    if (['completed', 'failed'].includes(this.state)) {
      if (this.progress?.children?.jobs) {
        this.progress.children.jobs = this.progress.children.jobs.filter(
          (it) => it.state != 'active'
        );
      }
    }
  }

  async get() {
    const data = await jobs.get(this.id);
    this.updateFromData(data);
    return this;
  }

  handleProgress(data) {
    const last = JSON.stringify(this);

    this.updateFromData(data);

    const didUpdate = JSON.stringify(this) != last;
    if (didUpdate) {
      this.trigger('progress', this);

      for (const item of this.results?.items || []) {
        const ser = JSON.stringify(item);
        if (this.#seen[ser]) {
          continue;
        }
        this.#seen[ser] = true;
        this.trigger('item', item);
      }

      if (this.state == 'completed') {
        this.#completed = true;
      }
      if (this.state == 'failed') {
        this.#failed = true;
      }
    }

    if (['completed', 'failed'].includes(this.state)) {
      console.log('Got state:', this.state);

      if (this.progress?.children?.jobs) {
        this.progress.children.jobs = this.progress.children.jobs.filter(
          (it) => it.state != 'active'
        );
      }

      console.log('Set timeout before triggering completion');
      setTimeout(() => {
        this.get()
          .then(() => {
            this.trigger('progress', this);
            this.trigger(this.state, this);
            this.trigger('finished', this);
          })
          .catch((e) => console.error(e));
      }, 500);
    }
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
    return this.waitFor('finished');
  }
};
