import type { ExtensionConfig } from '@teletron/types';
import { startExtension } from './start-extension';
import type { ExtensionManagerFunction } from '../types/backend';

export async function initializeExtensionWithConfig(
  extensionName: string,
  extensionBaseDirectory: string,
  config: ExtensionConfig,
  extension: ExtensionManagerFunction,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  providedConfig: Record<string, any>
) {
  const configuredValues = getValuesForConfiguration(extensionName, config, providedConfig);

  const remainingRequiredValues = config.fields.filter(
    (configEntry) =>
      configEntry.type !== 'section' && configEntry.required && configuredValues[configEntry.attribute] === undefined
  );
  if (remainingRequiredValues.length > 0) {
    throw new Error('Not all required configuration values were provided.'); // TODO create a more friendly error.
  }

  return startExtension(extensionName, extensionBaseDirectory, extension, configuredValues);
}

export function getValuesForConfiguration(
  extensionName: string,
  config: ExtensionConfig,
  providedConfig: Record<string, unknown>
): Record<string, unknown> {
  // Check all values and see if there is an ENV prefilled value
  // eslint-disable-next-line unicorn/no-array-reduce
  const initializedValues = config.fields.reduce((reducedValue, field) => {
    if (field.type === 'section') {
      return reducedValue;
    }

    if (field.fillableFromEnv === undefined) {
      return reducedValue;
    }

    const environmentKey = `${getEnvironmentPrefix(extensionName)}${field.fillableFromEnv}`;
    if (process.env[environmentKey] === undefined) {
      return reducedValue;
    }

    return {
      ...reducedValue,
      [field.attribute]: process.env[environmentKey],
    };
  }, {});

  return {
    ...providedConfig,
    ...initializedValues, // The env values trump the provided configuration values.
  };
}

export function getEnvironmentPrefix(extensionName: string) {
  return `${extensionName.toUpperCase()}_`;
}
