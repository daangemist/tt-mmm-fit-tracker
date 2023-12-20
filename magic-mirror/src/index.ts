import type { Configuration } from './types';
import Status from '../../src/components/status.svelte';
import { getDatasthor } from './datasthor';

export const initialize = (element: HTMLElement, configuration: Configuration) => {
  const storage = getDatasthor(configuration);

  const main = new Status({
    target: element,
    props: {
      storage,
      ...configuration,
    },
  });
};

// @ts-expect-error TS does not recognize this global
window.mmmFitTracker = {
  initialize,
};
