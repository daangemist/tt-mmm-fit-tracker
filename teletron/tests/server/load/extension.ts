import type { ExtensionProperties } from '@teletron/types';
import { readFile } from 'node:fs/promises';

export async function readExtensionDetails(
  packageJsonLocation: string
): Promise<{ main: string | undefined; teletron: ExtensionProperties }> {
  const rawPackage = await readFile(packageJsonLocation, 'utf8');
  const packageJson = JSON.parse(rawPackage);

  if (!packageJson.teletron) {
    throw new Error(`Missing teletron definition in ${packageJsonLocation}`);
  }

  return {
    main: packageJson.main,
    teletron: packageJson.teletron,
  };
}
