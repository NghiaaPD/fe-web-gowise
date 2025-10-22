<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { notificationStore } from "$lib/index";
  import IoMdCheckmarkCircleOutline from "svelte-icons/io/IoMdCheckmarkCircleOutline.svelte";
  import IoMdCloseCircleOutline from "svelte-icons/io/IoMdCloseCircleOutline.svelte";
  import IoIosWarning from "svelte-icons/io/IoIosWarning.svelte";

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
</script>

{#if notification.show}
  <div
    class="fixed top-6 right-6 z-[1050] max-w-sm w-full p-5 rounded-2xl border-l-4 bg-white/80 shadow-2xl backdrop-blur-md transition-all duration-500 flex flex-col gap-2"
    class:border-green-500={notification.type === "success"}
    class:border-red-500={notification.type === "error"}
    class:border-blue-500={notification.type === "info"}
    in:slide={{ duration: 300 }}
    out:fade={{ duration: 200 }}
  >
    <div class="flex items-center gap-4">
      <div class="flex items-center justify-center">
        {#if notification.type === "success"}
          <span
            class="flex items-center justify-center rounded-full w-10 h-10 text-green-500"
          >
            <IoMdCheckmarkCircleOutline class="w-6 h-6" />
          </span>
        {:else if notification.type === "error"}
          <span
            class="flex items-center justify-center rounded-full w-10 h-10 text-red-100"
          >
            <IoMdCloseCircleOutline class="w-6 h-6" />
          </span>
        {:else}
          <span
            class="flex items-center justify-center rounded-full w-10 h-10 text-blue-100"
          >
            <IoIosWarning class="w-6 h-6" />
          </span>
        {/if}
      </div>
      <div class="flex-1 min-w-0 flex flex-col gap-0.5">
        {#if notification.content.title}
          <h4
            class="text-slate-900 font-bold text-base mb-0.5 leading-tight tracking-tight"
          >
            {notification.content.title}
          </h4>
        {/if}
        <p class="text-slate-700 text-sm leading-relaxed">
          {notification.content.message}
        </p>
      </div>
      <button
        class="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-slate-100 transition-colors duration-200 flex items-center justify-center"
        onclick={close}
        aria-label="Đóng thông báo"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="11" cy="11" r="10" fill="#f1f5f9" />
          <path
            d="M7 7L15 15M15 7L7 15"
            stroke="#64748b"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
{/if}
