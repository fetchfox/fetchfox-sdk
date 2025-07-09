const host = 'https://api.fetchfox.ai';

const endpoint = (path) => `${host}${path}`;

const toSnakeCase = (dict) => {
  const result = {};

  for (const key in dict) {
    if (dict.hasOwnProperty(key)) {
      const snakeKey = key
        .replace(/([A-Z])/g, '_$1') // insert _ before uppercase letters
        .toLowerCase()              // convert all to lowercase
        .replace(/^_/, '');         // remove leading _ if any

      result[snakeKey] = dict[key];
    }
  }

  return result;
}

export const call = async (method, path, params, apiKey) => {
  apiKey ||= process.env.FETCHFOX_API_KEY;
  params = toSnakeCase(params);

  const args = {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
}
