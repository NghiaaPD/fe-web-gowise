<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IoMdPeople from "svelte-icons/io/IoMdPeople.svelte";
  import IoMdTrendingUp from "svelte-icons/io/IoMdTrendingUp.svelte";
  import IoMdCash from "svelte-icons/io/IoMdCash.svelte";
  import IoMdAdd from "svelte-icons/io/IoMdAdd.svelte";
  import IoMdRemove from "svelte-icons/io/IoMdRemove.svelte";
  import FaPencilAlt from "svelte-icons/fa/FaPencilAlt.svelte";
  import FaImages from "svelte-icons/fa/FaImages.svelte";

  const dispatch = createEventDispatcher();

  export let title: string = "Tokyo Adventure";
  export let contributors: number = 4;
  export let timeAgo: string = "2 hours ago";
  export let currentAmount: number = 1450;
  export let goalAmount: number = 2000;
  export let status: "active" | "completed" | "pending" = "active";
  export let description: string =
    "Join us for an amazing adventure in Tokyo! Contribute to make this dream trip come true.";

  // Calculate progress percentage
  $: progressPercent = Math.min((currentAmount / goalAmount) * 100, 100);

  function getStatusColor(status: string) {
    switch (status) {
      case "active":
        return "text-green-600";
      case "completed":
        return "text-blue-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function handleContribute() {
    dispatch("contribute", {
      title,
      currentAmount,
      goalAmount,
      contributors,
      status,
    });
  }

  function handleAddExpense() {
    dispatch("addExpense", {
      title,
      currentAmount,
      goalAmount,
      contributors,
      status,
    });
  }

  function handleViewDetails() {
    dispatch("viewDetail", {
      title,
      contributors,
      timeAgo,
      currentAmount,
      goalAmount,
      status,
      description,
    });
  }

  function formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }
</script>

<div class="relative group">
  <!-- Main Card Container -->
  <div
    class="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
  >
    <!-- Status Badge -->
    <div class="absolute top-4 right-4 z-10">
      <span
        class="px-3 py-1 rounded-full text-xs font-semibold {getStatusBadge(
          status
        )} border shadow-sm"
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>

    <!-- Header Section -->
    <div class="p-6 pb-4">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div
            class="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
          >
            <div class="w-6 h-6 text-white">
              <FaImages />
            </div>
          </div>
          <div>
            <h3
              class="text-xl font-bold text-gray-800 group-hover:text-teal-600 transition-colors duration-300"
            >
              {title}
            </h3>
            <div class="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <div class="flex items-center space-x-1">
                <div class="w-3 h-3">
                  <IoMdPeople />
                </div>
                <span>{contributors} người đóng góp</span>
              </div>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <p class="text-gray-600 text-sm mb-4 line-clamp-2">
        {description}
      </p>

      <!-- Progress Section -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-600">Tiến độ</span>
          <span class="text-sm font-bold {getStatusColor(status)}">
            {formatCurrency(currentAmount)} / {formatCurrency(goalAmount)}
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            class="h-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500 ease-out relative"
            style="width: {progressPercent}%"
          >
            <div class="absolute inset-0 bg-white/20 rounded-full"></div>
          </div>
        </div>

        <div
          class="flex justify-between items-center mt-2 text-xs text-gray-500"
        >
          <span>{progressPercent.toFixed(1)}% đã quyên góp</span>
          <span
            >{Math.max(0, goalAmount - currentAmount) > 0
              ? formatCurrency(goalAmount - currentAmount) + " còn lại"
              : "Đã đạt mục tiêu!"}</span
          >
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <!-- Goal -->
        <div
          class="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
        >
          <div class="w-5 h-5 text-blue-500 mx-auto mb-1">
            <IoMdTrendingUp />
          </div>
          <p class="text-xs text-blue-600 font-medium">Mục tiêu</p>
          <p class="text-sm font-bold text-blue-800">
            {formatCurrency(goalAmount)}
          </p>
        </div>

        <!-- Current -->
        <div
          class="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100"
        >
          <div class="w-5 h-5 text-green-500 mx-auto mb-1">
            <IoMdCash />
          </div>
          <p class="text-xs text-green-600 font-medium">Đã quyên góp</p>
          <p class="text-sm font-bold text-green-800">
            {formatCurrency(currentAmount)}
          </p>
        </div>

        <!-- Contributors -->
        <div
          class="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100"
        >
          <div class="w-5 h-5 text-purple-500 mx-auto mb-1">
            <IoMdPeople />
          </div>
          <p class="text-xs text-purple-600 font-medium">Người</p>
          <p class="text-sm font-bold text-purple-800">
            {contributors}
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="px-6 pb-6 relative z-30">
      <div class="grid grid-cols-2 gap-3">
        <!-- Contribute Button -->
        <button
          on:click={handleContribute}
          class="relative z-10 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg group/contribute"
          style="pointer-events: auto;"
        >
          <div
            class="w-4 h-4 group-hover/contribute:scale-110 transition-transform duration-200"
          >
            <IoMdAdd />
          </div>
          <span class="font-medium text-sm">Đóng góp</span>
        </button>

        <!-- Add Expense Button -->
        <button
          on:click={handleAddExpense}
          class="relative z-10 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300 hover:shadow-md group/expense"
          style="pointer-events: auto;"
        >
          <div
            class="w-4 h-4 group-hover/expense:scale-110 transition-transform duration-200"
          >
            <FaPencilAlt />
          </div>
          <span class="font-medium text-sm">Thêm chi phí</span>
        </button>
      </div>

      <!-- View Details Button -->
      <button
        on:click={handleViewDetails}
        class="relative z-10 w-full mt-3 px-4 py-2 bg-white hover:bg-gray-50 text-teal-600 border border-teal-200 rounded-lg transition-all duration-300 hover:shadow-md hover:border-teal-300"
        style="pointer-events: auto;"
      >
        <span class="font-medium text-sm">Xem chi tiết</span>
      </button>
    </div>

    <!-- Hover Glow Effect - DISABLED -->
    <!-- <div
            class="absolute inset-0 bg-gradient-to-r from-teal-400/10 via-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
        ></div> -->
  </div>
</div>

<style>
  /* Line clamp utility */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Ensure buttons are always clickable */
  button {
    position: relative;
    z-index: 10;
    pointer-events: auto;
  }
</style>
