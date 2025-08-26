import { io } from 'socket.io-client';
import { ws, appHost } from './configure.js';
import { jobs } from './jobs.js';

class FetchFoxError extends Error {}

const interval = 1_000;

export function getSocket() {}

export const Job = class {
  #callbacks;
  #socket;
  #seen;

  constructor(id, options) {
    this.id = id;
    this.#callbacks = {
      item: [],
      completed: [],
      error: [],
      finished: [],
      progress: [],
    };

    this.#seen = {};

    this.#socket = new io(ws(options));
    this.#socket.on('progress', (data) => {
      this.handleProgress(data);
    });
    this.#socket.emit('sub', this.id);
  }

  get _finished() {
    return this._completed || this._error;
  }

  get appUrl() {
    return appHost() + '/jobs/' + this.id;
  }

  #select(data) {
    const s = {};
    for (const key of [
      'name',
      'state',
      'args',
      'metrics',
      'progress',
      'results',
      'artifacts',
      'timer',
    ]) {
      s[key] = data[key] || this[key];
    }

    if (s.progress?.children?.jobs) {
      // const late = this.progress.children.jobs.filter(it => it.late);
      // console.log('late jobs:', late);
      s.progress.children.jobs = s.progress.children.jobs.filter(
        (it) => !it.late
      );
    }

    return s;
  }

  async get() {
    const data = await jobs.get(this.id);
    const s = this.#select(data);
    for (const key of Object.keys(s)) {
      this[key] = s[key];
    }
    return this;
  }

  handleProgress(data) {
    console.log('handleProgress', data);

    const last = JSON.stringify(this);

    const s = this.#select(data);
    for (const key of Object.keys(s)) {
      this[key] = s[key];
    }

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
        this._completed = true;
        this.trigger('completed', this);
      }
      if (this.state == 'error') {
        this._error = true;
        this.trigger('error', this);
      }

      if (['completed', 'error'].includes(this.state)) {
        if (this.progress?.children?.jobs) {
          this.progress.children.jobs = this.progress.children.jobs.filter(
            (it) => it.state != 'active'
          );
        }
        this.trigger('finished', this);
        this.#socket.disconnect();
      }
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

  async error() {
    return this.waitFor('error');
  }

  async finished() {
    return this.waitFor('finished');
  }
};
