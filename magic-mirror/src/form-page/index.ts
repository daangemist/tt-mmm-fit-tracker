import FormPage from '../../../src/components/form-page.svelte';
import { getDatasthor } from '../datasthor';

export function loadFormPage() {
  // @ts-expect-error config is a MM global
  const moduleConfig = config.modules.find((module) => module.module === 'tt-mmm-fit-tracker');
  const app = document.querySelector('#app');
  if (!app) {
    console.log('Unable to find Magic Mirror Fit Tracker app container.');
    return;
  }

  if (!moduleConfig) {
    app.innerHTML = 'Unable to find Magic Mirror storage configuration.';
    return;
  }

  const storage = getDatasthor(moduleConfig.config);

  new FormPage({
    target: app,
    props: {
      storage,
    },
  });
}
