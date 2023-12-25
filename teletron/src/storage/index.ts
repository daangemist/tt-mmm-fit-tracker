import type { CollectionOperator, ComponentWebStart } from '@teletron/types';
import type { FitTrackerStorage, Weight } from '../../../src/types';

export const collectionStorage = (collection: ComponentWebStart['collections']): FitTrackerStorage => ({
  getWeight: async function (): Promise<Weight | null> {
    const weights = await (collection['weight'] as CollectionOperator<Weight>).get('sort=-when');
    if (!weights[0]) {
      return null;
    }
    return {
      weight: weights[0].weight,
      when: new Date(weights[0].when),
    };
  },
  storeWeight: async function (weight: number, when: Date): Promise<Weight> {
    await collection['weight']?.create({ weight: weight, when: when.toISOString() });
    return { weight, when };
  },
});
