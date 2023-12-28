import type { WebStart } from '@teletron/types';
import { notifier } from './notifier';
import { collectionStorage } from './storage';
import Status from '../../src/components/status.svelte';
import WidgetWeight from './components/widget-weight.svelte';

const EXTENSION_NAME = 'fit-tracker';

// @ts-expect-error The global teletronRegisterExtension is not known.
const em: WebStart = window.teletronRegisterExtension(EXTENSION_NAME);

type StatusProperties = {
  maxWeightAge?: number;
  unit?: string;
  notifyOnOutdatedWeight: boolean;
  updateInterval?: number;
  disableScreen?: boolean;
};

type WidgetWeightProperties = {
  maxWeightAge?: number;
  updateInterval?: number;
};

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
      notifier: properties.notifyOnOutdatedWeight ? notifier(properties.webStart.http.post) : undefined,
    },
  });

  return {
    unmount: () => status.$destroy(),
  };
});

em.registerWidget<WidgetWeightProperties>('weight', (parent, properties) => {
  const status = new WidgetWeight({
    target: parent,
    props: {
      maxWeightAge: properties.maxWeightAge,
      updateInterval: properties.updateInterval,
      storage: collectionStorage(properties.webStart.collections),
    },
  });

  return {
    unmount: () => status.$destroy(),
  };
});
