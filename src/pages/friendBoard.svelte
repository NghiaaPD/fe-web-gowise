<script lang="ts">
  import { onMount } from "svelte";
  import FriendsCard from "../components/friendsCard.svelte";

  const BACKEND_BASE = (() => {
    const domain =
      import.meta.env.VITE_BE_DOMAIN?.replace(/\/$/, "") ?? "http://localhost";
    const port = import.meta.env.VITE_BE_PORT
      ? `:${import.meta.env.VITE_BE_PORT}`
      : "";
    return `${domain}${port}`;
  })();

  interface FriendRelation {
    userId: string;
    friendId: string;
    status: boolean;
    isSender: boolean;
  }

  interface Friend {
    id: string;
    firstName: string;
    lastName: string;
    isPremium: boolean;
    city: string;
    createdAt: string;
  }

  let friends = $state<Friend[]>([]);
  let isLoading = $state(true);
  let errorMessage = $state("");

  function handleFriendRemoved(event: CustomEvent<{ friendId: string }>) {
    const { friendId } = event.detail;
    // Remove friend from the list
    friends = friends.filter((friend) => friend.id !== friendId);
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

  async function fetchUserDetails(friendId: string): Promise<Friend | null> {
    try {
      const token = getAccessTokenFromCookie();
      const response = await fetch(`${BACKEND_BASE}/users/${friendId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch user ${friendId}`);
        return null;
      }

      const result = await response.json();
      console.log(`👤 User details for ${friendId}:`, result.data);

      // Make sure the id field is set correctly
      if (result.success && result.data) {
        return {
          ...result.data,
          id: result.data.id || friendId, // Fallback to friendId if id is missing
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching user details for ${friendId}:`, error);
      return null;
    }
  }

  async function fetchFriends() {
    const userId = getUserIdFromToken();
    if (!userId) {
      errorMessage = "Không thể xác định thông tin người dùng";
      isLoading = false;
      return;
    }

    isLoading = true;
    errorMessage = "";

    try {
      const token = getAccessTokenFromCookie();
      const response = await fetch(`${BACKEND_BASE}/users/friends/accepted`, {
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
      console.log("👥 Friends relations:", result);

      if (result.success) {
        const friendRelations: FriendRelation[] = result.data || [];

        // Fetch details for each friend
        const friendDetailsPromises = friendRelations.map((relation) =>
          fetchUserDetails(relation.friendId)
        );

        const friendDetails = await Promise.all(friendDetailsPromises);

        // Filter out failed fetches and assign
        friends = friendDetails.filter(
          (friend): friend is Friend => friend !== null
        );

        console.log("👥 Friends details:", friends);
      } else {
        errorMessage = result.message || "Không thể tải danh sách bạn bè";
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      errorMessage = "Không thể kết nối đến server";
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    fetchFriends();
  });
</script>

<div class="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6">
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Bạn bè</h1>
          <p class="text-gray-600">
            {#if friends.length > 0}
              Bạn có {friends.length} người bạn
            {:else if !isLoading}
              Chưa có bạn bè nào
            {/if}
          </p>
        </div>

        <button
          onclick={fetchFriends}
          class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium flex items-center gap-2"
          type="button"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class={isLoading ? "animate-spin" : ""}
          >
            <path
              d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
            />
          </svg>
          Làm mới
        </button>
      </div>
    </div>

    <!-- Content -->
    {#if isLoading}
      <div class="flex items-center justify-center py-20">
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"
          ></div>
          <p class="text-gray-600">Đang tải danh sách bạn bè...</p>
        </div>
      </div>
    {:else if errorMessage}
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-red-400 mx-auto mb-3"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class="text-red-600 font-semibold mb-2">Có lỗi xảy ra</p>
        <p class="text-red-500 text-sm">{errorMessage}</p>
      </div>
    {:else if friends.length === 0}
      <div class="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-gray-300 mx-auto mb-4"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Chưa có bạn bè</h3>
        <p class="text-gray-500">
          Hãy bắt đầu kết nối bằng cách gửi lời mời kết bạn!
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {#each friends as friend (friend.id)}
          <FriendsCard {friend} on:friendRemoved={handleFriendRemoved} />
        {/each}
      </div>
    {/if}
  </div>
</div>
