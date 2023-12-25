import type { Router } from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';

export function loadAssets(absoluteBaseDir: string, assets: string[], router: Router) {
  for (const asset of assets) {
    router.get(`/assets/${asset}`, (_req: Request, res: Response) => {
      res.sendFile(path.join(absoluteBaseDir, asset));
    });
  }
}
