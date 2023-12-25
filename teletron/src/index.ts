import type { WebStart } from '@teletron/types';
import { notifier } from './notifier';
import { collectionStorage } from './storage';
import Status from '../../src/components/status.svelte';

const EXTENSION_NAME = 'fit-tracker';

// @ts-expect-error The global teletronRegisterExtension is not known.
const em: WebStart = window.teletronRegisterExtension(EXTENSION_NAME);

interface StatusProperties {
  maxWeightAge?: number;
  unit?: string;
  updateInterval?: number;
  disableScreen?: boolean;
}

em.registerComponent<StatusProperties>('status', (parent, properties) => {
  const status = new Status({
    target: parent,
    props: {
      maxWeightAge: properties.maxWeightAge,
      unit: properties.unit,
      updateInterval: properties.updateInterval,
      disableScreen: properties.disableScreen,
      storage: collectionStorage(properties.webStart.collections),
      manageUrl: '/cms',
      notifier: notifier(properties.webStart.http.post),
    },
  });

  return {
    unmount: () => status.$destroy(),
  };
});
