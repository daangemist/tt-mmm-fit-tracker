<script lang="ts">
  import WeightForm from './weight-form.svelte';
  import type { FitTrackerStorage } from '../types';

  let stored: boolean = false;

  export let storage: FitTrackerStorage;

  function onWeightAdded() {
    stored = true;
  }
</script>

<h1>Fit Tracker form</h1>
<WeightForm {storage} on:weightAdded={onWeightAdded} showSubmit={true} />
{#if stored}
  <p>Weight stored!</p>
{/if}
