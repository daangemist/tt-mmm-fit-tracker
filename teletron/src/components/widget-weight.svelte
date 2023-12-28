<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { readWeight } from '../../../src/api';
  import { debugLogger } from '../../../src/logger';
  import type { FitTrackerStorage, Weight } from '../../../src/types';
  import { add } from 'date-fns';

  export let storage: FitTrackerStorage;
  export let maxWeightAge = 7 * 24 * 60;
  export let updateInterval: number = 600_000;

  let weightFetchError: boolean = false;
  let weightIsOutdated: boolean = false;
  let lastFetchedWeight: Weight | null;
  let intervalId: number;

  async function fetchWeightData() {
    try {
      const weight = await readWeight(storage);

      lastFetchedWeight = weight;
      weightFetchError = false;

      if (weight) {
        weightIsOutdated = add(weight.when, { minutes: maxWeightAge }) < new Date();
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
</script>

<div class={`tt-badge ${weightIsOutdated ? 'outdated' : ''}`}>
  ⚖️
  {#if weightFetchError && !lastFetchedWeight}
    ❌
  {:else if lastFetchedWeight}
    {lastFetchedWeight.weight.toLocaleString(undefined, {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    })}
  {:else}
    ⏳
  {/if}
</div>

<style>
  .outdated {
    background-color: red;
  }
</style>
