import { io } from 'socket.io-client';
import { ws } from './configure.js';
import { jobs } from './jobs.js';

class FetchFoxError extends Error {}

const interval = 1_000;

export function getSocket() {}

export const Job = class {
  #callbacks;
  #socket;

  constructor(id) {
    this.id = id;
    this.#callbacks = {
      completed: [],
      error: [],
      finished: [],
      progress: [],
    };

    this.#socket = new io(ws());
    this.#socket.on('progress', (data) => {
      this.handleProgress(data);
      console.log('==> socket got progress', data);
    });
    console.log('socket emit sub', this.id);
    this.#socket.emit('sub', this.id);

    // this.poll();
  }

  get _finished() {
    return this._completed || this._error;
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
    const last = JSON.stringify(this);

    const s = this.#select(data);
    for (const key of Object.keys(s)) {
      this[key] = s[key];
    }

    const didUpdate = JSON.stringify(this) != last;
    if (didUpdate) {
      console.log('=> Job progressed:', this);
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
