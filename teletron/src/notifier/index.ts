import type { WebStart } from '@teletron/types';
import type { FitTrackerNotifier } from '../../../src/types';

export const notifier = (post: WebStart['http']['post']): FitTrackerNotifier => ({
  notify: async function (title, message): Promise<void> {
    await post('/api/notify', { title, message });
  },
});
