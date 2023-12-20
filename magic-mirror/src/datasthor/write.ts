import { WRITE_PREFIX } from './constants';
import { HttpError } from './http-error';

export async function write<T, D>(
  namespace: string,
  prefix: string,
  apiKey: string | undefined,
  path: string,
  data: D
) {
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${WRITE_PREFIX}/${namespace}/${prefix}/${path}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }
}
