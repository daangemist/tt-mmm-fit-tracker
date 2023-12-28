<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { FitTrackerNotifier, FitTrackerStorage, Weight } from '../types';
  import { readWeight } from '../api';
  import { formatRelative, add } from 'date-fns';
  import WeightForm from './weight-form.svelte';
  import ScreenDisabler from './screen-disabler.svelte';
  import { debugLogger } from '../logger';

  export let storage: FitTrackerStorage;
  export let notifier: FitTrackerNotifier | undefined;
  export let updateInterval = 600_000;
  export let unit: string = 'kg';
  export let maxWeightAge: number = 7 * 24 * 60;
  export let disableScreen: boolean = true;
  export let manageUrl = '/fit-tracker';

  let intervalId: number;

  let lastFetchedWeight: Weight | null;
  let weightFetchError: boolean;
  let showForm = false;
  let alertOnMaxWeightAge = false;
  let alertedOnMaxWeightAge = false;

  async function checkAlertOnWeightAge(weight: Weight) {
    if (alertOnMaxWeightAge) {
      return; // We are already alerting.
    }

    if (add(weight.when, { minutes: maxWeightAge }) > new Date()) {
      return; // Weight is not old enough.
    }
    alertOnMaxWeightAge = true;

    if (!alertedOnMaxWeightAge && notifier) {
      alertedOnMaxWeightAge = true;
      await notifier.notify('Fit Tracker: Your weight is outdated.', 'Please weigh yourself and enter a new weight.');
    }
  }

  async function fetchWeightData() {
    try {
      const weight = await readWeight(storage);

      lastFetchedWeight = weight;
      weightFetchError = false;
      if (weight !== null) {
        checkAlertOnWeightAge(weight);
      }
    } catch (error) {
      weightFetchError = true;
      debugLogger('Weight fetch error.', error);
    }
  }

  onMount(() => {
    intervalId = window.setInterval(() => {
      void fetchWeightData();
    }, updateInterval);
    void fetchWeightData();
  });

  onDestroy(() => {
    clearInterval(intervalId);
  });

  function onWeightAdded(event: CustomEvent<{ weight: Weight }>) {
    lastFetchedWeight = event.detail.weight;
    showForm = false;
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={() => (showForm = !showForm)}>
  {#if lastFetchedWeight === undefined}
    <p>Fetching weight...</p>
  {:else if lastFetchedWeight === null}
    <p>There is no weight available.</p>
    <p class="small">Click to enter your weight.</p>
  {:else}
    <p class={alertOnMaxWeightAge ? 'alert' : ''}>
      Weight: {lastFetchedWeight.weight.toLocaleString(undefined, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 1,
      })}
      {unit}
      <br />
      <span class="smallest" title={lastFetchedWeight.when.toLocaleString()}>
        {formatRelative(lastFetchedWeight.when, new Date())}
      </span>
    </p>
  {/if}
  {#if weightFetchError}
    <p class="small">There was an error fetching the weight.</p>
  {/if}
</div>
{#if showForm}
  <WeightForm {storage} on:weightAdded={onWeightAdded} />
{/if}
{#if disableScreen && alertOnMaxWeightAge}
  <ScreenDisabler {manageUrl} />
{/if}

<style>
  .alert {
    color: #ff0000;
  }
  .small {
    font-size: 75%;
  }
  .smallest {
    font-size: 50%;
  }
</style>
