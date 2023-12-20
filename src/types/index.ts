export type Weight = {
  weight: number;
  when: Date;
};

export type FitTrackerStorage = {
  getWeight: () => Promise<Weight | null>;
  storeWeight: (weight: number, when: Date) => Promise<Weight>;
};
