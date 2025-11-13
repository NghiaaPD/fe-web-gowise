<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { showNotification } from "$lib/index";

  interface Friend {
    id: string;
    firstName: string;
    lastName: string;
    isPremium: boolean;
    city: string;
    createdAt: string;
    bio?: string;
  }

  let { friend }: { friend: Friend } = $props();
  const dispatch = createEventDispatcher();

  let showProfileModal = $state(false);
  let profileData = $state<Friend | null>(null);
  let isLoadingProfile = $state(false);
  let isRemovingFriend = $state(false);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  async function handleViewProfile() {
    isLoadingProfile = true;
    showProfileModal = true;

    try {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("accessToken=")
      );

      if (!tokenCookie) {
        showNotification(
          {
            title: "Lỗi",
            message: "Không tìm thấy token xác thực",
          },
          "error"
        );
        showProfileModal = false;
        return;
      }

      const token = tokenCookie.split("=")[1];

      const res = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/users/${friend.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const response = await res.json();
        profileData = {
          id: response.data.id || friend.id,
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          bio: response.data.bio || "",
          isPremium: response.data.isPremium || false,
          city: response.data.city || "",
          createdAt: response.data.createdAt || "",
        };
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showNotification(
        {
          title: "Lỗi",
          message: "Không thể tải thông tin hồ sơ",
        },
        "error"
      );
      showProfileModal = false;
    } finally {
      isLoadingProfile = false;
    }
  }

  async function handleRemoveFriend() {
    if (
      !confirm(
        `Bạn có chắc muốn xóa ${friend.firstName} ${friend.lastName} khỏi danh sách bạn bè?`
      )
    ) {
      return;
    }

    isRemovingFriend = true;

    try {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("accessToken=")
      );

      if (!tokenCookie) {
        showNotification(
          {
            title: "Lỗi",
            message: "Không tìm thấy token xác thực",
          },
          "error"
        );
        return;
      }

      const token = tokenCookie.split("=")[1];

      // Decode JWT to get user_id
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      const userId = payload.sub || payload.user_id || payload.id;

      console.log(
        "🗑️ Removing friend - userId:",
        userId,
        "friendId:",
        friend.id
      );

      if (!userId || !friend.id) {
        showNotification(
          {
            title: "Lỗi",
            message: `Thiếu thông tin: userId=${userId}, friendId=${friend.id}`,
          },
          "error"
        );
        return;
      }

      const requestBody = {
        user_id: userId,
        friend_id: friend.id,
      };

      console.log("🗑️ Request body:", JSON.stringify(requestBody));

      const res = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/users/friends`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("🗑️ Response status:", res.status);
      const result = await res.json();
      console.log("🗑️ Response data:", result);

      if (res.ok) {
        showNotification(
          {
            title: "Thành công",
            message: "Đã xóa bạn bè thành công",
          },
          "success"
        );
        // Notify parent to refresh the friend list
        dispatch("friendRemoved", { friendId: friend.id });
      } else {
        throw new Error("Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      showNotification(
        {
          title: "Lỗi",
          message: "Không thể xóa bạn bè. Vui lòng thử lại",
        },
        "error"
      );
    } finally {
      isRemovingFriend = false;
    }
  }

  function closeProfileModal() {
    showProfileModal = false;
    profileData = null;
  }
</script>

<div
  class="friend-card bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:border-teal-300"
>
  <div class="flex items-start gap-4">
    <!-- Avatar -->
    <div
      class="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-md"
    >
      {friend.firstName?.charAt(0).toUpperCase() ||
        friend.lastName?.charAt(0).toUpperCase() ||
        "?"}
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <h3 class="font-bold text-lg text-gray-800 truncate">
          {friend.firstName || ""}
          {friend.lastName || ""}
        </h3>
        {#if friend.isPremium}
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-md text-xs font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
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

      {#if friend.city}
        <div class="flex items-center gap-1.5 text-gray-600 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{friend.city}</span>
        </div>
      {/if}
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-2">
      <button
        class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
        onclick={handleViewProfile}
        disabled={isLoadingProfile}
      >
        Xem trang
      </button>
      <button
        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
        onclick={handleRemoveFriend}
        disabled={isRemovingFriend}
      >
        {isRemovingFriend ? "Đang xóa..." : "Xóa bạn"}
      </button>
    </div>
  </div>
</div>

<!-- Profile Modal -->
{#if showProfileModal}
  <!-- Backdrop -->
  <button
    type="button"
    class="fixed inset-0 z-[1040] bg-black/20 backdrop-blur-sm cursor-default"
    onclick={closeProfileModal}
    aria-label="Đóng hồ sơ"
  ></button>

  <!-- Modal Content -->
  <div
    class="fixed inset-0 flex items-center justify-center z-[1050] p-4 pointer-events-none"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      {#if isLoadingProfile}
        <div class="p-8 flex items-center justify-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"
          ></div>
        </div>
      {:else if profileData}
        <!-- Profile Header -->
        <div class="flex items-center p-8 bg-gray-50 border-b border-gray-200">
          <div
            class="w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-400 rounded-full flex items-center justify-center mr-5 flex-shrink-0"
          >
            <span class="text-white text-2xl font-semibold">
              {(profileData.firstName?.charAt(0) || "") +
                (profileData.lastName?.charAt(0) || "")}
            </span>
          </div>
          <div>
            <h3
              id="profile-title"
              class="text-2xl font-semibold text-gray-900 mb-1"
            >
              {profileData.firstName}
              {profileData.lastName}
            </h3>
            <p class="text-teal-600 font-medium text-sm">
              {profileData.isPremium ? "Premium Member" : "Free Member"}
            </p>
          </div>
        </div>

        <!-- Profile Content -->
        <div class="p-8">
          <div class="grid grid-cols-2 gap-8 mb-6">
            <div class="flex flex-col">
              <div class="mb-2 font-medium text-gray-700 text-sm">
                First Name
              </div>
              <div
                class="p-3 border border-gray-300 rounded-md text-sm bg-gray-50"
              >
                {profileData.firstName}
              </div>
            </div>
            <div class="flex flex-col">
              <div class="mb-2 font-medium text-gray-700 text-sm">
                Last Name
              </div>
              <div
                class="p-3 border border-gray-300 rounded-md text-sm bg-gray-50"
              >
                {profileData.lastName}
              </div>
            </div>
          </div>

          {#if profileData.city}
            <div class="flex flex-col mb-6">
              <div class="mb-2 font-medium text-gray-700 text-sm">City</div>
              <div
                class="p-3 border border-gray-300 rounded-md text-sm bg-gray-50"
              >
                {profileData.city}
              </div>
            </div>
          {/if}

          {#if profileData.bio}
            <div class="flex flex-col mb-6">
              <div class="mb-2 font-medium text-gray-700 text-sm">Bio</div>
              <div
                class="p-3 border border-gray-300 rounded-md text-sm bg-gray-50 min-h-[100px]"
              >
                {profileData.bio}
              </div>
            </div>
          {/if}

          <div class="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              class="bg-teal-600 text-white border-0 px-6 py-3 rounded-md cursor-pointer font-medium transition-colors duration-200 hover:bg-teal-700"
              onclick={closeProfileModal}
            >
              Đóng
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .friend-card {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
