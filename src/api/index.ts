import type { FitTrackerStorage, Weight } from '../types';

export async function readWeight(storage: FitTrackerStorage): Promise<Weight | null> {
  return await storage.getWeight();
}
