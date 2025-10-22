<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let title: string = "Tokyo Adventure";
  export let location: string = "Japan";
  export let duration: string = "7 days";
  export let budget: string = "$2000";
  export let created: string = "1/15/2024";
  export let status: "active" | "draft" | "completed" = "active";

  let isLoading = false;

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-600";
      case "completed":
        return "bg-blue-50 text-blue-600";
      case "draft":
        return "bg-yellow-50 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-500";
    }
  }

  function handleEdit() {
    dispatch("edit", {
      title,
      location,
      duration,
      budget,
      created,
      status,
    });
  }

  function handleViewDetails() {
    isLoading = true;
    setTimeout(() => {
      dispatch("viewDetail", {
        title,
        location,
        duration,
        budget,
        created,
        status,
      });
      isLoading = false;
    }, 300);
  }

  function handleDelete() {
    dispatch("delete");
  }
</script>

<div
  class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-w-[260px] flex flex-col gap-3"
>
  <div class="flex items-start justify-between">
    <div>
      <div class="font-semibold text-gray-800 text-base leading-tight">
        {title}
      </div>
      <div class="text-xs text-gray-500">{location}</div>
    </div>
    <span
      class="px-2 py-0.5 rounded-full text-xs font-medium {getStatusBadgeClass(
        status
      )}"
    >
      {status}
    </span>
  </div>
  <div class="flex flex-col gap-1 text-sm text-gray-700 mt-2">
    <div class="flex justify-between">
      <span class="text-gray-500">Thời gian:</span>
      <span class="font-medium">{duration}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-gray-500">Ngân sách:</span>
      <span class="font-medium">{budget}</span>
    </div>
    <div class="flex justify-between">
      <span class="text-gray-500">Ngày tạo:</span>
      <span class="font-medium">{created}</span>
    </div>
  </div>
  <div class="flex gap-2 mt-4">
    <button
      class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition text-sm font-medium"
      on:click={handleEdit}
    >
      Chỉnh sửa
    </button>
    <button
      class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition text-sm font-medium"
      on:click={handleViewDetails}
      disabled={isLoading}
    >
      {#if isLoading}
        <span class="w-4 h-4 animate-spin">
          <svg class="w-full h-full" fill="none" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              class="opacity-25"
            ></circle>
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              class="opacity-75"
            ></path>
          </svg>
        </span>
        Đang tải...
      {:else}
        Xem chi tiết
      {/if}
    </button>
    <button
      class="flex items-center justify-center p-0.5 w-9 h-9 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition text-base font-medium"
      title="Xóa"
      aria-label="Xóa kế hoạch"
      on:click={handleDelete}
      type="button"
    >
      <svg
        class="w-5 h-5 mx-auto"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
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
    </button>
  </div>
</div>
