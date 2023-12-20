import { READ_PREFIX } from './constants';
import { HttpError } from './http-error';

export async function read<T>(namespace: string, prefix: string, apiKey: string | undefined, path: string) {
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${READ_PREFIX}/${namespace}/${prefix}/${path}`, {
    headers,
  });
  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }
  return (await response.json()) as T;
}
