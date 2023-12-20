<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { FitTrackerStorage, Weight } from '../types';
  import { readWeight } from '../api';
  import { formatRelative } from 'date-fns';
  import WeightForm from './weight-form.svelte';

  export let storage: FitTrackerStorage;
  export let updateInterval = 600_000;
  export let unit: string = 'kg';

  let intervalId: number;

  let lastFetchedWeight: Weight | null;
  let weightFetchError: boolean;
  let showForm = false;

  onMount(() => {
    intervalId = window.setInterval(() => {
      readWeight(storage)
        .then((weight) => {
          lastFetchedWeight = weight;
          weightFetchError = false;
        })
        .catch(() => (weightFetchError = true));
    }, updateInterval);
    readWeight(storage)
      .then((weight) => {
        lastFetchedWeight = weight;
        weightFetchError = false;
      })
      .catch(() => (weightFetchError = true));
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
    <p>No weight fetched yet.</p>
  {:else if lastFetchedWeight === null}
    <p>There is no weight available.</p>
    <p class="small">Click to enter your weight.</p>
  {:else}
    <p>
      Weight: {lastFetchedWeight.weight.toLocaleString(undefined, { maximumFractionDigits: 1 })}
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

<style>
  .small {
    font-size: 75%;
  }
  .smallest {
    font-size: 50%;
  }
</style>
