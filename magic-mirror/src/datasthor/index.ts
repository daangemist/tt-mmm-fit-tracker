import { HttpError } from './http-error';
import { mapWeight } from './map-weight';
import { read } from './read';
import type { StoredWeight } from './types';
import { write } from './write';
import type { FitTrackerStorage, Weight } from '../../../src/types';
import type { Configuration } from '../types';

function stripSlashFromBegin(value: string): string {
  return value.startsWith('/') ? value.slice(1) : value;
}

export const getDatasthor = (configuration: Configuration) =>
  ({
    getWeight: async () => {
      try {
        const { namespace, prefix, apiKey } = configuration.datasthor;
        const data = await read<StoredWeight[]>(namespace, stripSlashFromBegin(prefix), apiKey, 'weight.json');

        if (!data[0]) {
          return null;
        }
        return mapWeight(data[0]);
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    storeWeight: async (weight: number, when: Date) => {
      let data: StoredWeight[] = [];
      const { namespace, prefix, apiKey } = configuration.datasthor;
      try {
        data = await read<StoredWeight[]>(namespace, stripSlashFromBegin(prefix), apiKey, 'weight.json');
      } catch (error) {
        if (!(error instanceof HttpError) || error.status !== 404) {
          throw error;
        }
      }

      await write<StoredWeight[]>(namespace, stripSlashFromBegin(prefix), apiKey, 'weight.json', [
        { weight, when: when.toISOString() },
        ...data,
      ]);
      return { weight, when } satisfies Weight;
    },
  }) satisfies FitTrackerStorage;
