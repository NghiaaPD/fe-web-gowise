<script lang="ts">
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";
  import FaLock from "svelte-icons/fa/FaLock.svelte";
  import FaStar from "svelte-icons/fa/FaStar.svelte";

  export let id: number;
  export let title: string;
  export let description: string;
  export let category: "travel" | "social" | "planning" | "milestone";
  export let isUnlocked: boolean;
  export let progress: number;
  export let maxProgress: number;
  export let points: number;
  export let unlockedDate: string | undefined = undefined;
  export let icon: string;

  function getCategoryColor(category: string): string {
    switch (category) {
      case "travel":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "social":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "planning":
        return "bg-green-100 text-green-800 border-green-200";
      case "milestone":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function getCategoryName(category: string): string {
    switch (category) {
      case "travel":
        return "Du lịch";
      case "social":
        return "Xã hội";
      case "planning":
        return "Lập kế hoạch";
      case "milestone":
        return "Cột mốc";
      default:
        return "Khác";
    }
  }
</script>

<div
  class="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 {isUnlocked
    ? ''
    : 'opacity-75'}"
>
  <!-- Achievement Header -->
  <div
    class="p-6 {isUnlocked
      ? 'bg-gradient-to-br from-teal-50 to-emerald-50'
      : 'bg-gray-50'}"
  >
    <div class="flex items-start justify-between mb-4">
      <!-- Icon -->
      <div
        class="w-16 h-16 {isUnlocked
          ? 'bg-gradient-to-br from-teal-400 to-teal-600'
          : 'bg-gray-300'} rounded-2xl flex items-center justify-center shadow-lg"
      >
        {#if isUnlocked}
          {#if icon.startsWith("<svg")}
            <div class="w-10 h-10 text-white">
              {@html icon}
            </div>
          {:else}
            <span class="text-3xl">{icon}</span>
          {/if}
        {:else}
          <div class="w-8 h-8 text-gray-500">
            <FaLock />
          </div>
        {/if}
      </div>

      <!-- Status Badge -->
      {#if isUnlocked}
        <div
          class="px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-semibold flex items-center space-x-1"
        >
          <div class="w-3 h-3">
            <FaCheckCircle />
          </div>
          <span>Đã mở khóa</span>
        </div>
      {:else}
        <div
          class="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs font-semibold flex items-center space-x-1"
        >
          <div class="w-3 h-3">
            <FaLock />
          </div>
          <span>Đã khóa</span>
        </div>
      {/if}
    </div>

    <!-- Title and Description -->
    <h3
      class="text-xl font-bold {isUnlocked
        ? 'text-gray-800'
        : 'text-gray-500'} mb-2"
    >
      {title}
    </h3>
    <p class="text-sm {isUnlocked ? 'text-gray-600' : 'text-gray-400'} mb-4">
      {description}
    </p>

    <!-- Category Badge -->
    <span
      class="inline-block px-3 py-1 rounded-full text-xs font-semibold border {getCategoryColor(
        category
      )}"
    >
      {getCategoryName(category)}
    </span>
  </div>

  <!-- Achievement Body -->
  <div class="p-6">
    <!-- Progress Bar -->
    {#if !isUnlocked}
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-600">Tiến độ</span>
          <span class="text-sm font-bold text-teal-600">
            {progress}/{maxProgress}
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            class="h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
            style="width: {(progress / maxProgress) * 100}%"
          ></div>
        </div>
      </div>
    {/if}

    <!-- Points and Date -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div class="w-6 h-6 text-yellow-500">
          <FaStar />
        </div>
        <span class="text-lg font-bold text-gray-800">{points} điểm</span>
      </div>
      {#if isUnlocked && unlockedDate}
        <span class="text-xs text-gray-500">{unlockedDate}</span>
      {/if}
    </div>
  </div>
</div>
