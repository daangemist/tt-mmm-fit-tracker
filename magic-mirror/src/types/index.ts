export type Configuration = {
  datasthor: {
    namespace: string;
    apiKey?: string;
    prefix: string;
  };
};

declare global {
  interface config {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modules: [{ type: string; config: Record<string, any> }];
  }
}
