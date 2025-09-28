<script lang="ts">
  import "../app.css";
  import Notification from "../components/Notification.svelte";
  import NoMobile from "../pages/NoMobile.svelte";
  import { onMount } from "svelte";

  let { children } = $props();
  let isMobile = $state(false);

  function checkMobile() {
    isMobile = window.innerWidth < 1000; // Mobile breakpoint
  }

  onMount(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  });
</script>

{#if isMobile}
  <NoMobile />
{:else}
  {@render children()}
{/if}

<Notification />
