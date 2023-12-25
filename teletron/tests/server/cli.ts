import 'dotenv/config';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { readFile } from 'node:fs/promises';
import { start } from './index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function readConfig(location: string): Promise<Record<string, any>> {
  const contents = await readFile(location);
  return JSON.parse(contents.toString());
}

void (async function () {
  await yargs(hideBin(process.argv))
    .command(
      'extension <packageLocation>',
      'start a development environment for a teletron extension',
      (yargs) => {
        return yargs
          .positional('packageLocation', {
            describe: 'The location to read the extension package.json from.',
            type: 'string',
            default: './package.json',
          })
          .option('config', {
            alias: 'c',
            type: 'string',
            description: 'The location of the config file to use; if this extension uses configuration',
          });
      },
      async (argv) => {
        const configFile = argv.config ?? undefined;
        const config = configFile ? await readConfig(configFile) : {};
        void start(argv.packageLocation, config);
      }
    )
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
    })
    .parse();
})();
