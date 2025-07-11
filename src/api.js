import { apiKey, host } from './configure.js';

const endpoint = (path) => `${host()}${path}`;

const clean = (dict) => {
  const result = {};

  for (const key in dict) {
    if (dict.hasOwnProperty(key)) {
      const snakeKey = key
        .replace(/([A-Z])/g, '_$1') // insert _ before uppercase letters
        .toLowerCase() // convert all to lowercase
        .replace(/^_/, ''); // remove leading _ if any

      result[snakeKey] = dict[key];
    }
  }

  if (result.apiKey) {
    delete result.apiKey;
  }

  return result;
};

export const call = async (method, path, params) => {
  const key = apiKey(params);
  params = clean(params);

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
  return resp.json();
};
