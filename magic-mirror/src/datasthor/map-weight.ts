import type { StoredWeight } from './types';
import type { Weight } from '../../../src/types';

export function mapWeight(weight: StoredWeight): Weight {
  return {
    weight: weight.weight,
    when: new Date(weight.when),
  };
}
