<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { FitTrackerStorage, Weight } from '../types';

  export let storage: FitTrackerStorage;
  let inputWeight: string;

  const dispatch = createEventDispatcher<{ weightAdded: { weight: Weight } }>();

  async function doAddWeight() {
    const readWeight = parseFloat(inputWeight);
    if (isNaN(readWeight)) {
      alert('Please enter a valid weight.');
      return;
    }

    const weight = await storage.storeWeight(readWeight, new Date());
    inputWeight = '';
    dispatch('weightAdded', { weight });
  }
</script>

<form on:submit|preventDefault={doAddWeight}>
  <!-- svelte-ignore a11y-autofocus -->
  <input autofocus type="text" bind:value={inputWeight} placeholder="Enter your weight." />
</form>
