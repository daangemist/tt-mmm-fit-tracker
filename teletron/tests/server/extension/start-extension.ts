// eslint-disable-next-line import/no-extraneous-dependencies
import type { ComponentInformation, WidgetInformation } from '@teletron/types';
// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
import type { Collection } from 'supersave';
import path from 'node:path';
import { loadAssets } from '../load/assets';
import { addCollection, addEntity } from '../load/collections';
import type { ExtensionManager, ExtensionManagerFunction } from '../types/backend';

export async function startExtension(
  extensionName: string,
  extensionBaseDirectory: string,
  extension: ExtensionManagerFunction,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: Record<string, any>
) {
  const router = express.Router();
  const widgets: WidgetInformation[] = [];
  const components: ComponentInformation[] = [];

  await extension({
    assets: (basePath: string, files: string[]) => {
      loadAssets(path.join(extensionBaseDirectory, basePath), files, router);
    },
    collections: {
      create: async <T = unknown>(collection: Collection, serverOnly?: boolean) => {
        if (serverOnly) {
          return addEntity<T>(extensionName, collection);
        }
        return addCollection<T>(extensionName, collection);
      },
    },
    components: {
      add(component) {
        components.push(component);
      },
    },
    widgets: {
      add: (widget) => {
        widgets.push(widget);
      },
    },
    extensionPath: extensionBaseDirectory,
    http: router,
    messages: {
      subscribe: () => {
        throw new Error('subscribe(): Not implemented.');
      },
      subscribeToNamespace: () => {
        throw new Error('subscribeToNamespace(): Not implemented.');
      },
      dispatch: () => {
        throw new Error('dispatch(): Not implemented.');
      },
    },
    config,
  } satisfies ExtensionManager);

  return {
    router,
    widgets,
    components,
  };
}
