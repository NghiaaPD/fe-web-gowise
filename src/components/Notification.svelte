<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { notificationStore } from "$lib/index";

  let notification: {
    show: boolean;
    content: {
      title?: string;
      message: string;
      icon?: string;
    };
    type: "success" | "error" | "info";
  } = { show: false, content: { message: "" }, type: "info" };

  notificationStore.subscribe((value) => {
    notification = value;
  });

  function close() {
    notificationStore.update((n) => ({ ...n, show: false }));
  }

  $: defaultIcon = notification.type === "success" ? "✅" : notification.type === "error" ? "❌" : "ℹ️";
</script>

{#if notification.show}
  <div
    class="fixed top-4 right-4 z-[1050] max-w-sm w-full p-4 rounded-xl shadow-2xl border-l-4 transition-all duration-500 transform hover:scale-105"
    class:bg-gradient-to-r={true}
    class:from-green-400={notification.type === "success"}
    class:to-green-600={notification.type === "success"}
    class:from-red-400={notification.type === "error"}
    class:to-red-600={notification.type === "error"}
    class:from-blue-400={notification.type === "info"}
    class:to-blue-600={notification.type === "info"}
    class:border-green-600={notification.type === "success"}
    class:border-red-600={notification.type === "error"}
    class:border-blue-600={notification.type === "info"}
    in:slide={{ duration: 300 }}
    out:fade={{ duration: 200 }}
  >
    <div class="flex items-start">
      <div class="flex-shrink-0 mr-3">
        <span class="text-2xl">{notification.content.icon || defaultIcon}</span>
      </div>
      <div class="flex-1 min-w-0">
        {#if notification.content.title}
          <h4 class="text-white font-bold text-lg mb-1">{notification.content.title}</h4>
        {/if}
        <p class="text-white text-sm leading-relaxed">{notification.content.message}</p>
      </div>
      <button
        class="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
        onclick={close}
        aria-label="Close notification"
      >
        <span class="text-white text-xl font-bold">×</span>
      </button>
    </div>
  </div>
{/if}
