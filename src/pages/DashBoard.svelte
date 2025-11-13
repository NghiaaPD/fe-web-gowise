<script lang="ts">
  import { onMount } from "svelte";
  import { showNotification } from "$lib/index";
  import GalleryDashboardCard from "../components/gallerydashboardCard.svelte";
  import PostDashboardCard from "../components/postdashboardCard.svelte";

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

  interface Gallery {
    galleryId: string;
    thumbnailUrl: string;
    photoCount: number;
    totalLikes: number;
  }

  interface Post {
    postId: string;
    title: string;
    content: string;
    category: string;
    totalLikes: number;
    totalViews: number;
    publishedAt?: string;
  }

  interface FriendWithGalleries {
    friend: Friend;
    galleries: Gallery[];
  }

  interface FriendWithPosts {
    friend: Friend;
    posts: Post[];
  }

  type Plan = {
    _id?: { $oid: string };
    user_id?: string;
    plan_content?: {
      plan_id?: string;
      hasExistingPlan?: boolean;
      travelType?: string | null;
      destination?: string;
      startDate?: string;
      endDate?: string;
      participants?: string;
      budget?: string;
      flightData?: any;
      hotelData?: any;
      itineraryData?: any;
      selectedInterests?: string[];
      userLocation?: any;
      [key: string]: any;
    };
    created_at: string;
    updated_at?: string;
    status?: "active" | "draft" | "completed";
    [key: string]: any;
  };

  let plans = $state<Plan[]>([]);
  let friendsWithGalleries = $state<FriendWithGalleries[]>([]);
  let friendsWithPosts = $state<FriendWithPosts[]>([]);
  let isLoading = $state(true);
  let isFriendsLoading = $state(true);
  let error = $state<string | null>(null);
  let userId = $state<string | null>(null);

  function getAccessTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const tokenCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("accessToken="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }

  // Helper to get userId from JWT token in cookies
  function getUserIdFromToken(): string | null {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    if (!tokenCookie) return null;

    const token = tokenCookie.split("=")[1];
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      const tokenData = JSON.parse(decoded);
      return tokenData?.user_id || tokenData?.id || tokenData?.sub || null;
    } catch (error) {
      return null;
    }
  }

  // Fetch plans from API (copied from ManagePlan.svelte)
  async function fetchPlans() {
    try {
      isLoading = true;
      error = null;

      userId = getUserIdFromToken();
      if (!userId) {
        error = "Không thể lấy ID người dùng từ token.";
        showNotification({ title: "Tải thất bại", message: error }, "error");
        isLoading = false;
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/plans/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        plans = data.plans || [];
      } else {
        error = "Tải kế hoạch thất bại. Vui lòng thử lại.";
        showNotification({ title: "Tải thất bại", message: error }, "error");
      }
    } catch (err) {
      error = "Đã xảy ra lỗi khi tải kế hoạch.";
      showNotification({ title: "Tải thất bại", message: error }, "error");
    } finally {
      isLoading = false;
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

      if (result.success && result.data) {
        return {
          ...result.data,
          id: result.data.id || friendId,
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching user details for ${friendId}:`, error);
      return null;
    }
  }

  async function fetchGalleriesForFriend(friendId: string): Promise<Gallery[]> {
    try {
      const token = getAccessTokenFromCookie();
      const apiUrl = `${BACKEND_BASE}/api/gallery/user/${friendId}/galleries`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data || [];
      }
      return [];
    } catch (error) {
      console.error(`Error fetching galleries for ${friendId}:`, error);
      return [];
    }
  }

  async function fetchPostsForFriend(friendId: string): Promise<Post[]> {
    try {
      const token = getAccessTokenFromCookie();
      const apiUrl = `${BACKEND_BASE}/api/posts/me?page=0&size=10`;

      console.log("📄 Fetching posts for friend:", friendId, "from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-User-Id": friendId,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log(
          "📄 Full posts response for",
          friendId,
          ":",
          JSON.stringify(result, null, 2)
        );
        console.log("📄 Result.success:", result.success);
        console.log("📄 Result.data:", result.data);
        console.log("📄 Result.data.items:", result.data?.items);

        if (result.data && result.data.items) {
          const items = result.data.items;
          console.log("📄 Raw items:", items);
          console.log("📄 Items count:", items.length);

          // Filter only APPROVED posts
          const approvedPosts = items.filter(
            (item: any) => item.status === "APPROVED"
          );
          console.log("📄 Approved posts count:", approvedPosts.length);

          if (approvedPosts.length === 0) {
            console.log("📄 No APPROVED posts found for", friendId);
            return [];
          }

          const mappedPosts = approvedPosts.map((item: any) => ({
            postId: item.id || item.postId,
            title: item.title || "Untitled",
            content: item.content || "",
            category: item.category || "Khác",
            totalLikes: item.likeCount || 0,
            totalViews: item.viewCount || 0,
            publishedAt: item.publishedAt || item.createdAt,
          }));

          console.log("📄 Mapped posts:", mappedPosts);
          console.log(
            "📄 Returning",
            mappedPosts.length,
            "posts for",
            friendId
          );
          return mappedPosts;
        } else {
          console.log("📄 No data.items found in response for", friendId);
        }
      } else {
        console.log(
          "📄 Response not ok for",
          friendId,
          "status:",
          response.status
        );
      }
      console.log("📄 Returning empty array for", friendId);
      return [];
    } catch (error) {
      console.error(`Error fetching posts for ${friendId}:`, error);
      return [];
    }
  }

  async function fetchFriends() {
    const currentUserId = getUserIdFromToken();
    if (!currentUserId) {
      isFriendsLoading = false;
      return;
    }

    isFriendsLoading = true;

    try {
      const token = getAccessTokenFromCookie();
      const response = await fetch(`${BACKEND_BASE}/users/friends/accepted`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("👥 Friends relations:", result);

      if (result.success) {
        const friendRelations: FriendRelation[] = result.data || [];

        // Fetch details, galleries, and posts for each friend
        const friendDataPromises = friendRelations.map(async (relation) => {
          const friendDetail = await fetchUserDetails(relation.friendId);
          if (!friendDetail) return { galleries: null, posts: null };

          const [galleries, posts] = await Promise.all([
            fetchGalleriesForFriend(relation.friendId),
            fetchPostsForFriend(relation.friendId),
          ]);

          return {
            galleries:
              galleries.length > 0 ? { friend: friendDetail, galleries } : null,
            posts: posts.length > 0 ? { friend: friendDetail, posts } : null,
          };
        });

        const friendData = await Promise.all(friendDataPromises);

        console.log("🔍 Raw friend data:", friendData);

        // Separate galleries and posts
        friendsWithGalleries = friendData
          .map((item) => item.galleries)
          .filter((item): item is FriendWithGalleries => item !== null);

        friendsWithPosts = friendData
          .map((item) => item.posts)
          .filter((item): item is FriendWithPosts => item !== null);

        console.log(
          "👥 Friends with galleries:",
          friendsWithGalleries.length,
          friendsWithGalleries
        );
        console.log(
          "📄 Friends with posts:",
          friendsWithPosts.length,
          friendsWithPosts
        );

        if (friendsWithPosts.length > 0) {
          console.log("📄 First friend with posts:", friendsWithPosts[0]);
          console.log("📄 Posts in first friend:", friendsWithPosts[0].posts);
        }
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      isFriendsLoading = false;
    }
  }

  onMount(() => {
    fetchPlans();
    fetchFriends();
  });
</script>

<div
  class="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-screen py-6"
>
  <!-- Friends Gallery Section - Social Media Style Feed -->
  <div class="max-w-2xl mx-auto px-4">
    {#if isFriendsLoading}
      <div class="flex items-center justify-center py-12">
        <div
          class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"
        ></div>
      </div>
    {:else if friendsWithGalleries.length === 0 && friendsWithPosts.length === 0}
      <!-- Empty State -->
      <div class="flex items-center justify-center min-h-[60vh]">
        <div class="text-center max-w-md">
          <div
            class="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-teal-600"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-3">
            Hãy tìm kiếm một người bạn để chia sẻ khoảnh khắc nhé
          </h3>
          <p class="text-gray-500 text-sm">
            Kết bạn và khám phá những khoảnh khắc đáng nhớ từ bạn bè của bạn
          </p>
        </div>
      </div>
    {:else}
      <div class="space-y-4">
        {#each friendsWithGalleries as { friend, galleries } (friend.id)}
          {#each galleries as gallery (gallery.galleryId)}
            <div
              class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <!-- Friend Header -->
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold flex-shrink-0"
                >
                  {friend.firstName?.charAt(0).toUpperCase() ||
                    friend.lastName?.charAt(0).toUpperCase() ||
                    "?"}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-800 truncate">
                    {friend.firstName || ""}
                    {friend.lastName || ""}
                  </h3>
                  {#if friend.city}
                    <p class="text-xs text-gray-500 flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path
                          d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                        />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {friend.city}
                    </p>
                  {/if}
                </div>
                {#if friend.isPremium}
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-md text-xs font-semibold flex-shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
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

              <!-- Gallery Post -->
              <GalleryDashboardCard {gallery} friendId={friend.id} />
            </div>
          {/each}
        {/each}

        <!-- Friend Posts -->
        {#each friendsWithPosts as { friend, posts } (friend.id)}
          {#each posts as post (post.postId)}
            <div
              class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <!-- Friend Header -->
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0"
                >
                  {friend.firstName?.charAt(0).toUpperCase() ||
                    friend.lastName?.charAt(0).toUpperCase() ||
                    "?"}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-800 truncate">
                    {friend.firstName || ""}
                    {friend.lastName || ""}
                  </h3>
                  {#if friend.city}
                    <p class="text-xs text-gray-500 flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path
                          d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
                        />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {friend.city}
                    </p>
                  {/if}
                </div>
                {#if friend.isPremium}
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-md text-xs font-semibold flex-shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
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

              <!-- Blog Post -->
              <PostDashboardCard {post} friendId={friend.id} />
            </div>
          {/each}
        {/each}
      </div>
    {/if}
  </div>
</div>
