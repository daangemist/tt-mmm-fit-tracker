import { getDatasthor } from './datasthor';
import { loadFormPage } from './form-page';
import type { Configuration } from './types';
import Status from '../../src/components/status.svelte';
import type { FitTrackerNotifier } from '../../src/types';

export const initialize = (
  element: HTMLElement,
  configuration: Configuration,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendSocketNotification: (notification: string, payload: any) => void
) => {
  const storage = getDatasthor(configuration);
  const notifier: FitTrackerNotifier = {
    // eslint-disable-next-line @typescript-eslint/require-await
    notify: async (title: string, message: string) => {
      if (!configuration.pushBullet) {
        return;
      }
      sendSocketNotification('NOTIFY', { title, message, pushBullet: configuration.pushBullet });
    },
  };

  new Status({
    target: element,
    props: {
      storage,
      notifier,
      maxWeightAge: configuration.weight?.maxAge ?? 24 * 60,
      ...configuration,
    },
  });
};

// @ts-expect-error TS does not recognize this global
window.mmmFitTracker = {
  initialize,
};

if (window.location.pathname === '/fit-tracker') {
  loadFormPage();
}
