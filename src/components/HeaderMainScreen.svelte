<script lang="ts">
  import FaSearch from "svelte-icons/fa/FaSearch.svelte";
  import FaRegBell from "svelte-icons/fa/FaRegBell.svelte";
  import FaRegUser from "svelte-icons/fa/FaRegUser.svelte";

  // Props from parent component
  let { userData } = $props();

  // Handle search functionality
  let searchQuery = $state("");
  let isSearchFocused = $state(false);
  let hasBeenActivated = $state(false);

  function handleSearch() {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Add your search logic here
    }
  }

  function handleSearchFocus() {
    isSearchFocused = true;
    if (!hasBeenActivated) {
      hasBeenActivated = true;
    }
  }

  function handleSearchBlur() {
    isSearchFocused = false;
  }

  function handleNotifications() {
    console.log("Opening notifications");
    // Add your notifications logic here
  }

  function handleUserProfile() {
    console.log("Opening user profile");
    // Add your user profile logic here
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }
</script>

<!-- Header Component -->
<header class="w-full bg-white shadow-md border-b border-gray-200 px-6 py-4">
  <div class="flex items-center justify-between">
    <!-- Search Section -->
    <div class="flex items-center flex-1 max-w-lg">
      <div class="relative w-full">
        <div
          class="relative {hasBeenActivated && isSearchFocused
            ? 'animate-activate-once'
            : ''}"
        >
          <input
            type="text"
            bind:value={searchQuery}
            onkeypress={handleKeyPress}
            onfocus={handleSearchFocus}
            onblur={handleSearchBlur}
            placeholder="Tìm kiếm..."
            class="w-full pl-10 pr-16 py-2.5 border border-gray-300 rounded-lg
                               focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100
                               transition-all duration-200 bg-white
                               {isSearchFocused
              ? 'shadow-md border-teal-500'
              : 'hover:border-gray-400'}
                               placeholder:text-gray-400 text-gray-700"
          />
          <div
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200
                               {isSearchFocused
              ? 'text-teal-600'
              : 'text-gray-400'}"
          >
            <FaSearch />
          </div>
          <button
            onclick={handleSearch}
            class="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1.5 text-sm
                               bg-teal-600 text-white rounded-md
                               hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300
                               transition-all duration-200 cursor-pointer"
          >
            Search
          </button>

          <!-- Hiệu ứng activate một lần duy nhất -->
          {#if hasBeenActivated && isSearchFocused}
            <div
              class="absolute inset-0 rounded-lg border-2 border-teal-400 opacity-0 animate-activate-border"
            ></div>
            <div
              class="absolute inset-0 rounded-lg bg-teal-100 opacity-0 animate-activate-glow"
            ></div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Right Side Icons -->
    <div class="flex items-center space-x-4 ml-6">
      <!-- Notifications Icon -->
      <button
        onclick={handleNotifications}
        class="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all duration-200 cursor-pointer"
        title="Notifications"
      >
        <div class="w-6 h-6">
          <FaRegBell />
        </div>
        <!-- Notification badge (optional) -->
        <div
          class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
        ></div>
      </button>

      <!-- User Profile -->
      <div class="flex items-center space-x-3">
        <div class="text-right hidden sm:block">
          <div class="text-sm font-medium text-gray-900">
            {userData?.firstName && userData?.lastName
              ? `${userData.firstName} ${userData.lastName}`
              : userData?.name || userData?.username || "User"}
          </div>
          <div class="text-xs text-gray-500">
            {userData?.isPremium ? "Thành viên Premium" : "Thành viên Miễn phí"}
          </div>
        </div>
        <button
          onclick={handleUserProfile}
          class="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all duration-200 cursor-pointer"
          title="User Profile"
        >
          <div class="w-6 h-6">
            <FaRegUser />
          </div>
        </button>
      </div>
    </div>
  </div>
</header>
