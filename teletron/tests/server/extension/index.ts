import path from 'node:path';
import type { ExtensionManagerFunction, ExtensionManagerFunctionWithConfig } from '../types/backend';
import { initializeExtensionWithConfig } from './initialize-extension-with-config';
import { startExtension } from './start-extension';

function isExtensionManagerFunction(extensionImport: unknown): extensionImport is ExtensionManagerFunction {
  return typeof extensionImport === 'function';
}
function isExtensionManagerFunctionWithConfig(
  extensionImport: unknown
): extensionImport is ExtensionManagerFunctionWithConfig {
  return (
    typeof extensionImport === 'object' &&
    extensionImport !== null &&
    'config' in extensionImport &&
    'extension' in extensionImport
  );
}

export async function loadExtension(
  extensionName: string,
  baseDirectory: string,
  main: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providedConfig: Record<string, any>
) {
  const { default: extensionImport } = await import(path.join(baseDirectory, main));

  if (isExtensionManagerFunctionWithConfig(extensionImport)) {
    return initializeExtensionWithConfig(
      extensionName,
      baseDirectory,
      extensionImport.config,
      extensionImport.extension,
      providedConfig
    );
  }
  if (isExtensionManagerFunction(extensionImport)) {
    return startExtension(extensionName, baseDirectory, extensionImport);
  }

  throw new TypeError('Invalid extension export encountered when attempting to load extension.');
}
