<script lang="ts">
  import FaSearch from "svelte-icons/fa/FaSearch.svelte";
  import FaRegBell from "svelte-icons/fa/FaRegBell.svelte";
  import FaRegUser from "svelte-icons/fa/FaRegUser.svelte";

  // Props from parent component
  let { userData } = $props();

  const BACKEND_BASE = (() => {
    const domain =
      import.meta.env.VITE_BE_DOMAIN?.replace(/\/$/, "") ?? "http://localhost";
    const port = import.meta.env.VITE_BE_PORT
      ? `:${import.meta.env.VITE_BE_PORT}`
      : "";
    return `${domain}${port}`;
  })();

  // Handle search functionality
  let searchQuery = $state("");
  let isSearchFocused = $state(false);
  let hasBeenActivated = $state(false);
  let showNotificationDropdown = $state(false);
  let pendingFriendRequests = $state<any[]>([]);
  let isLoadingRequests = $state(false);

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

  function getAccessTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const tokenCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("accessToken="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }

  function getUserIdFromToken(): string | null {
    const token = getAccessTokenFromCookie();
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      const tokenData = JSON.parse(decoded);
      return tokenData?.user_id || tokenData?.id || tokenData?.sub || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  async function fetchPendingFriendRequests() {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("Cannot get user ID from token");
      return;
    }

    isLoadingRequests = true;
    try {
      const token = getAccessTokenFromCookie();
      const response = await fetch(`${BACKEND_BASE}/users/friends/pending`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📬 Pending friend requests:", result);

      if (result.success) {
        pendingFriendRequests = result.data || [];
      }
    } catch (error) {
      console.error("Error fetching pending friend requests:", error);
    } finally {
      isLoadingRequests = false;
    }
  }

  async function handleAcceptFriend(friendId: string) {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("Cannot get user ID from token");
      return;
    }

    try {
      const token = getAccessTokenFromCookie();
      const response = await fetch(`${BACKEND_BASE}/users/friends/accept`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          friend_id: friendId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Friend request accepted:", result);

      if (result.success) {
        // Remove from pending list
        pendingFriendRequests = pendingFriendRequests.filter(
          (req) => req.friendId !== friendId
        );
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  }

  async function handleRejectFriend(friendId: string) {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("Cannot get user ID from token");
      return;
    }

    try {
      const token = getAccessTokenFromCookie();
      const response = await fetch(`${BACKEND_BASE}/users/friends`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          friend_id: friendId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("❌ Friend request rejected:", result);

      if (result.success) {
        // Remove from pending list
        pendingFriendRequests = pendingFriendRequests.filter(
          (req) => req.friendId !== friendId
        );
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  }

  async function handleNotifications() {
    showNotificationDropdown = !showNotificationDropdown;

    if (showNotificationDropdown && pendingFriendRequests.length === 0) {
      await fetchPendingFriendRequests();
    }
  }

  function handleUserProfile() {
    console.log("Opening user profile");
    // Add your user profile logic here
  }

  function handleUpgrade() {
    // Navigate to premium options page
    // using location.href to remain framework-agnostic in this component
    location.href = "/premium";
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
      <!-- Upgrade button (shown for non-premium users) -->
      {#if !userData?.isPremium}
        <button
          onclick={handleUpgrade}
          class="hidden sm:inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-md hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200 cursor-pointer mr-2"
          title="Nâng cấp lên Premium"
        >
          Nâng cấp Premium
        </button>
      {/if}

      <!-- Notifications Icon -->
      <div class="relative">
        <button
          onclick={handleNotifications}
          class="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all duration-200 cursor-pointer"
          title="Lời mời kết bạn"
        >
          <div class="w-6 h-6">
            <FaRegBell />
          </div>
          <!-- Notification badge -->
          {#if pendingFriendRequests.length > 0}
            <div
              class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
            >
              <span class="text-white text-xs font-bold">
                {pendingFriendRequests.length}
              </span>
            </div>
          {/if}
        </button>

        <!-- Notification Dropdown -->
        {#if showNotificationDropdown}
          <div
            class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            <div
              class="px-4 py-3 border-b border-gray-200 flex items-center justify-between"
            >
              <h3 class="font-semibold text-gray-800">Lời mời kết bạn</h3>
              <button
                onclick={() => (showNotificationDropdown = false)}
                class="text-gray-400 hover:text-gray-600"
                aria-label="Đóng thông báo"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div class="max-h-96 overflow-y-auto">
              {#if isLoadingRequests}
                <div class="flex items-center justify-center py-8">
                  <div
                    class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"
                  ></div>
                </div>
              {:else if pendingFriendRequests.length > 0}
                <div class="divide-y divide-gray-100">
                  {#each pendingFriendRequests as request}
                    <div class="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold flex-shrink-0"
                        >
                          ?
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="font-medium text-gray-800 text-sm">
                            Lời mời kết bạn
                          </p>
                          <p class="text-xs text-gray-500">
                            ID: {request.friendId.substring(0, 8)}...
                          </p>
                        </div>
                        <div class="flex gap-2">
                          <button
                            onclick={(e) => {
                              e.stopPropagation();
                              handleAcceptFriend(request.friendId);
                            }}
                            class="px-3 py-1.5 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-xs font-medium"
                            aria-label="Chấp nhận lời mời kết bạn"
                            type="button"
                          >
                            Chấp nhận
                          </button>
                          <button
                            onclick={(e) => {
                              e.stopPropagation();
                              handleRejectFriend(request.friendId);
                            }}
                            class="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-xs font-medium"
                            aria-label="Từ chối lời mời kết bạn"
                            type="button"
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="px-4 py-8 text-center text-gray-500 text-sm">
                  Không có lời mời kết bạn nào
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>

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
