<script lang="ts">
  let temporaryAllow: boolean = false;

  export let manageUrl: string = '/fit-tracker';

  function onClick() {
    temporaryAllow = true;
    setTimeout(() => {
      temporaryAllow = false;
    }, 5000);
  }
</script>

<div class={`full-screen ${temporaryAllow ? 'hidden' : ''}`}>
  <h1>Your screen is currently disabled.</h1>
  <h2>Please enter your missing weight at <a href={manageUrl}>{manageUrl}</a></h2>
  <button on:click={onClick}>Temporarily Allow</button>
</div>

<style>
  .full-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000000;
    text-align: center;
  }
  .hidden {
    display: none;
  }
</style>
