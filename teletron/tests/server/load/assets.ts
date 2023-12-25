import type { Router } from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { assets as extensionAssets } from '../extension/data';

export function loadAssets(absoluteBaseDirectory: string, assets: string[], router: Router) {
  extensionAssets.push(...assets);
  for (const asset of assets) {
    router.get(`/assets/${asset}`, (_req: Request, res: Response) => {
      res.sendFile(path.join(absoluteBaseDirectory, asset));
    });
  }
}
