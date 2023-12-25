/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadExtension } from './extension';
import { loadAssets } from './load/assets';
import { getSuperSave, loadCollections } from './load/collections';
import { readExtensionDetails } from './load/extension';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function start(packageJsonLocation: string, config: Record<string, any> = {}) {
  const extensionDetails = await readExtensionDetails(packageJsonLocation);
  const extensionBaseDirectory = path.dirname(packageJsonLocation);
  const absoluteExtensionBaseDirectory = path.resolve(extensionBaseDirectory);

  const app = express();
  app.use(express.json());

  const extensionRouter = express.Router();

  app.use(`/extensions/${extensionDetails.teletron.name}`, extensionRouter);

  if (extensionDetails.main) {
    const loadedExtensionInformation = await loadExtension(
      extensionDetails.teletron.name,
      absoluteExtensionBaseDirectory,
      extensionDetails.main,
      config
    );
    app.use(`/extensions/${extensionDetails.teletron.name}`, loadedExtensionInformation.router);
  }

  app.get('/', async (_req, res) => {
    const file = await readFile(path.join(__dirname, 'server.html'));
    res.send(
      file
        .toString()
        .replace('{{EXTENSION_NAME}}', extensionDetails.teletron.name)
        .replace('{{EXTENSION_DISPLAY_NAME}}', extensionDetails.teletron.displayName ?? extensionDetails.teletron.name)
    );
  });
  app.get('/favicon.ico', (_req, res) => {
    const absolutePath = path.resolve(path.join(__dirname, './assets/favicon.ico'));
    res.sendFile(absolutePath);
  });

  // This test package assets
  app.use('/assets', express.static(path.join(__dirname, './assets')));

  app.get('/api/extensions', (_req, res) => {
    res.json([extensionDetails.teletron]);
  });

  if (Array.isArray(extensionDetails.teletron.assets)) {
    loadAssets(absoluteExtensionBaseDirectory, extensionDetails.teletron.assets, extensionRouter);
  }
  if (Array.isArray(extensionDetails.teletron.collections)) {
    await loadCollections(extensionDetails.teletron.name, extensionDetails.teletron.collections);
  }
  app.use('/api/collections', await getSuperSave().getRouter('/api/collections'));

  const port = process.env['PORT'] ?? 3000;
  app.listen(port);
  console.log(`Teletron test app running on http://localhost:${port}`);
}
