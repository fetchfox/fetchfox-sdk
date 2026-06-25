const config = {};

const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

const safeEnv = (key) => (isNode ? process.env[key] : null);

export const configure = ({ apiKey, host, appHost }) => {
  if (apiKey) {
    config.apiKey = apiKey;
  }
  if (host) {
    config.host = host;
  }
  if (appHost) {
    config.appHost = appHost;
  }
};

export const apiKey = (options) =>
  options?.apiKey || config.apiKey || safeEnv('FETCHFOX_API_KEY');

export const host = (options) =>
  options?.host ||
  config.host ||
  safeEnv('FETCHFOX_HOST') ||
  'https://api.fetchfox.ai';

export const appHost = (options) =>
  config.appHost ||
  host(options)
    .replace('api.fetchfox.ai', 'app.fetchfox.ai')
    .replace('https://app.fetchfox.ai', 'https://fetchfox.ai');

export const ws = (options) => host(options).replace('http', 'ws');
