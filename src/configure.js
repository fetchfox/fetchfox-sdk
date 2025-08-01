const config = {
  host: 'https://api.fetchfox.ai',
};

const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

const safeEnv = (key) => (isNode ? process.env[key] : null);

export const configure = ({ apiKey, host }) => {
  if (apiKey) {
    config.apiKey = apiKey;
  }
  if (host) {
    config.host = host;
  }
};

export const apiKey = (options) =>
  options?.apiKey || config.apiKey || safeEnv('FETCHFOX_API_KEY');

export const host = (options) =>
  options?.host || config.host || safeEnv('FETCHFOX_HOST');

export const appHost = (options) =>
  (options?.host || config.host || safeEnv('FETCHFOX_HOST')).replace(
    'api.fetchfox.ai',
    'app.fetchfox.ai'
  );

export const ws = (options) =>
  (options?.host || config.host || safeEnv('FETCHFOX_HOST')).replace(
    'http',
    'ws'
  );
