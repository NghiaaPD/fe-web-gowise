<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let open = false;
  export let planTitle: string = "this plan";
  const dispatch = createEventDispatcher();

  function handleCancel() {
    dispatch("cancel");
  }
  function handleConfirm() {
    dispatch("confirm");
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
  >
    <div
      class="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col items-center"
    >
      <div class="text-red-600 mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M10 11v6" /><path d="M14 11v6" /><path
            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
          /><path d="M3 6h18" /><path
            d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
          /></svg
        >
      </div>
      <h2 class="text-lg font-semibold text-gray-800 mb-2 text-center">
        Xóa kế hoạch?
      </h2>
      <p class="text-gray-600 text-sm mb-4 text-center">
        Bạn có chắc chắn muốn xóa <span class="font-semibold">{planTitle}</span
        >? Hành động này không thể hoàn tác.
      </p>
      <div class="flex gap-3 w-full mt-2">
        <button
          class="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
          on:click={handleCancel}>Hủy</button
        >
        <button
          class="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-medium"
          on:click={handleConfirm}>Xóa</button
        >
      </div>
    </div>
  </div>
{/if}
