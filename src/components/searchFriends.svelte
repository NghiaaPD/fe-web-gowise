<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade, scale } from "svelte/transition";

  const dispatch = createEventDispatcher();

  const BACKEND_BASE = (() => {
    const domain =
      import.meta.env.VITE_BE_DOMAIN?.replace(/\/$/, "") ?? "http://localhost";
    const port = import.meta.env.VITE_BE_PORT
      ? `:${import.meta.env.VITE_BE_PORT}`
      : "";
    return `${domain}${port}`;
  })();

  interface SearchUser {
    id: string;
    firstName: string;
    lastName: string;
    isPremium: boolean;
    city: string;
    createdAt: string;
  }

  let searchQuery = $state("");
  let searchResults = $state<SearchUser[]>([]);
  let isLoading = $state(false);
  let errorMessage = $state("");

  function closeDialog() {
    dispatch("close");
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      closeDialog();
    }
  }

  function getAccessTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const tokenCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("accessToken="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      errorMessage = "";
      return;
    }

    isLoading = true;
    errorMessage = "";
    try {
      const token = getAccessTokenFromCookie();
      if (!token) {
        errorMessage = "Vui lòng đăng nhập để tìm kiếm";
        searchResults = [];
        return;
      }

      const response = await fetch(
        `${BACKEND_BASE}/users/search?name=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        searchResults = result.data || [];
      } else {
        errorMessage = result.message || "Có lỗi xảy ra khi tìm kiếm";
        searchResults = [];
      }
    } catch (error) {
      console.error("Error searching friends:", error);
      errorMessage = "Không thể kết nối đến server";
      searchResults = [];
    } finally {
      isLoading = false;
    }
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

  async function handleAddFriend(friendId: string) {
    try {
      const token = getAccessTokenFromCookie();
      if (!token) {
        errorMessage = "Vui lòng đăng nhập để kết bạn";
        return;
      }

      const userId = getUserIdFromToken();
      if (!userId) {
        errorMessage = "Không thể xác định thông tin người dùng";
        return;
      }

      console.log("🔍 Adding friend:", { userId, friendId });

      const response = await fetch(`${BACKEND_BASE}/users/friends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          friendId: friendId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Remove the user from search results after successful friend request
        searchResults = searchResults.filter((user) => user.id !== friendId);

        // Show success message (you can use notification if available)
        console.log("Friend request sent successfully");
      } else {
        // Handle specific error cases
        if (
          result.error_code === "ALREADY_FRIENDS" ||
          (result.message &&
            result.message.toLowerCase().includes("already friends"))
        ) {
          errorMessage = "Hai bạn đã là bạn bè rồi";
        } else if (
          result.error_code === "REQUEST_PENDING" ||
          (result.message &&
            result.message.toLowerCase().includes("already sent"))
        ) {
          errorMessage = "Lời mời kết bạn đã được gửi trước đó";
        } else {
          errorMessage = result.message || "Không thể gửi lời mời kết bạn";
        }
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      errorMessage = "Không thể kết nối đến server";
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="modal-overlay"
  transition:fade={{ duration: 200 }}
  onclick={handleBackdropClick}
  onkeydown={handleBackdropKeydown}
>
  <!-- Dialog -->
  <div
    class="dialog-content"
    transition:scale={{ duration: 200, start: 0.95 }}
    role="dialog"
    aria-labelledby="search-friends-title"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- Header -->
    <div class="dialog-header">
      <div class="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-teal-500"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
        <h2 id="search-friends-title" class="text-2xl font-bold text-gray-800">
          Tìm bạn bè
        </h2>
      </div>
      <button
        onclick={closeDialog}
        class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200"
        aria-label="Đóng"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
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

    <!-- Search Input -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <svg
          class="search-icon"
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
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          bind:value={searchQuery}
          oninput={handleSearch}
          placeholder="Tìm kiếm theo tên..."
          class="search-input"
        />
        {#if searchQuery}
          <button
            onclick={() => {
              searchQuery = "";
              searchResults = [];
            }}
            class="clear-button"
            aria-label="Xóa"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </button>
        {/if}
      </div>
    </div>

    <!-- Results -->
    <div class="results-section">
      {#if isLoading}
        <div class="empty-state">
          <div class="loading-spinner"></div>
          <p class="text-gray-500 mt-3">Đang tìm kiếm...</p>
        </div>
      {:else if errorMessage}
        <div class="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-red-300"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p class="empty-state-text text-red-600">{errorMessage}</p>
        </div>
      {:else if searchResults.length > 0}
        <div class="results-list">
          {#each searchResults as user}
            <div class="user-card">
              <div class="user-info">
                <div class="user-avatar">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
                <div class="user-details">
                  <div class="user-name">
                    {user.firstName}
                    {user.lastName}
                    {#if user.isPremium}
                      <span class="premium-badge">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          />
                        </svg>
                        Premium
                      </span>
                    {/if}
                  </div>
                  <div class="user-email">
                    {#if user.city}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline mr-1"
                      >
                        <path
                          d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                        />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {user.city}
                    {:else}
                      Chưa cập nhật thành phố
                    {/if}
                  </div>
                </div>
              </div>
              <button
                onclick={() => handleAddFriend(user.id)}
                class="add-friend-button"
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1.5"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Kết bạn
              </button>
            </div>
          {/each}
        </div>
      {:else if searchQuery.trim()}
        <div class="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-gray-300"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <p class="empty-state-text">Không tìm thấy kết quả</p>
          <p class="empty-state-subtext">Thử tìm kiếm với từ khóa khác</p>
        </div>
      {:else}
        <div class="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-gray-300"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p class="empty-state-text">Tìm kiếm bạn bè</p>
          <p class="empty-state-subtext">Nhập tên hoặc email để bắt đầu</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
  }

  .dialog-content {
    background: white;
    border-radius: 1.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 28rem;
    margin: 0 1rem;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(to bottom, #ffffff, #f9fafb);
  }

  .search-section {
    padding: 1.25rem;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 0.875rem;
    color: #9ca3af;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 2.75rem 0.75rem 2.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 0.938rem;
    outline: none;
    transition: all 0.2s;
    background: white;
  }

  .search-input:focus {
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }

  .search-input::placeholder {
    color: #9ca3af;
  }

  .clear-button {
    position: absolute;
    right: 0.5rem;
    padding: 0.25rem;
    color: #9ca3af;
    background: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clear-button:hover {
    color: #6b7280;
    background: #f3f4f6;
  }

  .results-section {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .user-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 1rem;
    transition: all 0.2s;
  }

  .user-card:hover {
    background: white;
    border-color: #14b8a6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    flex: 1;
    min-width: 0;
  }

  .user-avatar {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1.125rem;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
  }

  .user-details {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-weight: 600;
    color: #1f2937;
    font-size: 0.938rem;
    margin-bottom: 0.125rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
  }

  .premium-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: white;
    border-radius: 0.375rem;
    font-size: 0.688rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .user-email {
    font-size: 0.813rem;
    color: #6b7280;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .add-friend-button {
    padding: 0.625rem 1.25rem;
    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    color: white;
    border: none;
    border-radius: 0.625rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(20, 184, 166, 0.2);
  }

  .add-friend-button:hover {
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
    box-shadow: 0 4px 8px rgba(20, 184, 166, 0.3);
    transform: translateY(-1px);
  }

  .add-friend-button:active {
    transform: translateY(0);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    text-align: center;
  }

  .empty-state-text {
    margin-top: 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: #4b5563;
  }

  .empty-state-subtext {
    margin-top: 0.375rem;
    font-size: 0.875rem;
    color: #9ca3af;
  }

  .loading-spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid #e5e7eb;
    border-top-color: #14b8a6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Custom scrollbar */
  .results-section::-webkit-scrollbar {
    width: 6px;
  }

  .results-section::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 3px;
  }

  .results-section::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  .results-section::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
</style>
