import type { BusMessageCallback, ComponentInformation, ExtensionConfig, WidgetInformation } from '@teletron/types';
import type { Router } from 'express';
import type { Collection, Repository } from 'supersave';

type AssetFunction = {
  (basePath: string, files: string[]): void;
};

type CollectionsOperator = {
  create: <T = unknown>(collection: Collection, serverOnly?: boolean) => Promise<Repository<T>>;
};

type MessagesOperator = {
  subscribe(callback: BusMessageCallback): [(key: string, payload: unknown) => void, () => void];
  subscribeToNamespace(
    namespace: string,
    callback: BusMessageCallback
  ): [(key: string, payload: unknown) => void, () => void];
  dispatch(key: string, payload: unknown): void;
};

type ComponentsOperator = {
  add: (component: ComponentInformation) => void;
};

type WidgetsOperator = {
  add: (widget: WidgetInformation) => void;
};

export type ExtensionManager = {
  assets: AssetFunction;
  collections: CollectionsOperator;
  messages: MessagesOperator;
  http: Router;
  components: ComponentsOperator;
  widgets: WidgetsOperator;
  extensionPath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: Record<string, any> | undefined;
};

export type ExtensionManagerFunction = {
  (em: ExtensionManager): void | Promise<void>;
};

export type ExtensionManagerFunctionWithConfig = {
  config: ExtensionConfig;
  extension: ExtensionManagerFunction;
};
