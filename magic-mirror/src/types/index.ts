export type Configuration = {
  datasthor: {
    namespace: string;
    apiKey?: string;
    prefix: string;
  };
  unit?: 'string';
  updateInterval?: number;
  weight?: {
    maxAge?: number; // in minutes
  };
  disableScreen?: boolean;
  pushBullet?: {
    apiKey: string;
    deviceParams: string;
  };
};

declare global {
  interface config {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modules: [{ type: string; config: Record<string, any> }];
  }
}
