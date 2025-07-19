import { apiKey, host } from './configure.js';

const camelCase = (obj) => {
  const snakeToCamel = (str) =>
    str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [snakeToCamel(key), value])
  );
};

const endpoint = (path) => `${host()}${path}`;

const FetchFoxAPIError = class extends Error {
  constructor(errors) {
    super(JSON.stringify(errors));
    this.errors = errors;
  }
};

export const call = async (method, path, params) => {
  const key = apiKey(params);

  const args = {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  };

  let url = endpoint(path);
  if (method == 'GET') {
    url += '?' + new URLSearchParams(params).toString();
  } else {
    args.body = JSON.stringify(params);
  }

  const resp = await fetch(url, args);
  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`FetchFox returned invalid JSON: ${text}`);
  }

  if (data.errors) {
    throw new FetchFoxAPIError(data.errors);
  }

  if (resp.status >= 400) {
    throw new FetchFoxAPIError({
      status: `Received status=${resp.status}`,
      ...data,
    });
  }

  return camelCase(data);
};
