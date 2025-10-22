<script lang="ts">
  import { onMount } from "svelte";
  import AchievementCard from "../components/achivementCard.svelte";

  interface Achievement {
    id: number;
    title: string;
    description: string;
    category: "travel" | "social" | "planning" | "milestone";
    isUnlocked: boolean;
    progress: number;
    maxProgress: number;
    points: number;
    unlockedDate?: string;
    icon: string;
  }

  let achievements: Achievement[] = [
    {
      id: 1,
      title: "Plan Đầu Tiên",
      description: "Tạo kế hoạch du lịch đầu tiên của bạn",
      category: "planning",
      isUnlocked: false,
      progress: 0,
      maxProgress: 1,
      points: 100,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M12 2v4"/><path d="M16 2v4"/><rect width="16" height="18" x="4" y="4" rx="2"/><path d="M8 10h6"/><path d="M8 14h8"/><path d="M8 18h5"/></svg>',
    },
    {
      id: 2,
      title: "Khoảnh Khắc Đầu Tiên",
      description: "Chia sẻ hình ảnh đầu tiên của bạn",
      category: "social",
      isUnlocked: false,
      progress: 0,
      maxProgress: 1,
      points: 50,
      icon: "📸",
    },
    {
      id: 3,
      title: "Người Bạn Đầu Tiên",
      description: "Kết bạn với người dùng đầu tiên",
      category: "social",
      isUnlocked: false,
      progress: 0,
      maxProgress: 1,
      points: 75,
      icon: "👥",
    },
  ];

  let isLoading = true;
  let userId: string | null = null;

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

  // Check if user has created their first plan
  async function checkFirstPlan(): Promise<boolean> {
    try {
      if (!userId) {
        console.log("[Achievement] No userId found");
        return false;
      }

      console.log("[Achievement] Checking first plan for userId:", userId);

      const response = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/plans/${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      console.log("[Achievement] API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("[Achievement] API Response data:", data);

        // Check if data is array directly or nested in a property
        let plans = data;
        if (data.data) {
          plans = data.data;
        } else if (data.plans) {
          plans = data.plans;
        }

        const hasPlan = Array.isArray(plans) && plans.length > 0;
        console.log(
          "[Achievement] Has first plan?",
          hasPlan,
          "Plans count:",
          plans?.length
        );
        return hasPlan;
      }

      console.log("[Achievement] API Response not OK");
      return false;
    } catch (error) {
      console.error("[Achievement] Error checking first plan:", error);
      return false;
    }
  }

  // Check if user has uploaded their first photo
  // TODO: Replace with actual API endpoint when available
  async function checkFirstPhoto(): Promise<boolean> {
    try {
      // Placeholder - endpoint not yet available
      // When API is ready, replace with:
      // const response = await fetch(`${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/photos/${userId}`);
      // const photos = await response.json();
      // return Array.isArray(photos) && photos.length > 0;

      return false; // Default to locked until API is available
    } catch (error) {
      console.error("Error checking first photo:", error);
      return false;
    }
  }

  // Check if user has added their first friend
  // TODO: Replace with actual API endpoint when available
  async function checkFirstFriend(): Promise<boolean> {
    try {
      // Placeholder - endpoint not yet available
      // When API is ready, replace with:
      // const response = await fetch(`${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/friends/${userId}`);
      // const friends = await response.json();
      // return Array.isArray(friends) && friends.length > 0;

      return false; // Default to locked until API is available
    } catch (error) {
      console.error("Error checking first friend:", error);
      return false;
    }
  }

  // Load achievements data
  async function loadAchievements() {
    isLoading = true;
    userId = getUserIdFromToken();

    console.log("[Achievement] Loading achievements for userId:", userId);

    if (!userId) {
      console.error("[Achievement] User ID not found");
      isLoading = false;
      return;
    }

    try {
      // Check each achievement
      console.log("[Achievement] Checking all achievements...");
      const [hasFirstPlan, hasFirstPhoto, hasFirstFriend] = await Promise.all([
        checkFirstPlan(),
        checkFirstPhoto(),
        checkFirstFriend(),
      ]);

      console.log("[Achievement] Results:", {
        hasFirstPlan,
        hasFirstPhoto,
        hasFirstFriend,
      });

      // Update achievement 1 - First Plan
      if (hasFirstPlan) {
        console.log("[Achievement] ✅ Unlocking First Plan achievement!");
        achievements[0].isUnlocked = true;
        achievements[0].progress = 1;
        achievements[0].unlockedDate = new Date().toISOString();
      } else {
        console.log("[Achievement] ❌ First Plan still locked");
      }

      // Update achievement 2 - First Photo
      if (hasFirstPhoto) {
        console.log("[Achievement] ✅ Unlocking First Photo achievement!");
        achievements[1].isUnlocked = true;
        achievements[1].progress = 1;
        achievements[1].unlockedDate = new Date().toISOString();
      }

      // Update achievement 3 - First Friend
      if (hasFirstFriend) {
        console.log("[Achievement] ✅ Unlocking First Friend achievement!");
        achievements[2].isUnlocked = true;
        achievements[2].progress = 1;
        achievements[2].unlockedDate = new Date().toISOString();
      }

      // Trigger reactivity
      achievements = [...achievements];
      console.log("[Achievement] Final achievements state:", achievements);
    } catch (error) {
      console.error("[Achievement] Error loading achievements:", error);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadAchievements();
  });

  // Statistics
  $: totalPoints = achievements
    .filter((a) => a.isUnlocked)
    .reduce((sum, a) => sum + a.points, 0);

  // Filter state
  let selectedCategory: string = "all";

  $: filteredAchievements = achievements.filter((achievement) => {
    if (selectedCategory === "all") return true;
    return achievement.category === selectedCategory;
  });
</script>

<div class="p-6 bg-gray-50 min-h-screen">
  <!-- Header Section -->
  <div class="mb-8">
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Thành tựu</h1>
      <p class="text-gray-600">
        Khám phá và mở khóa các thành tựu trong hành trình của bạn 🏆
      </p>
    </div>
  </div>

  <!-- Statistics Cards -->
  <div class="grid grid-cols-2 gap-4 mb-8">
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Tổng điểm</p>
          <p class="text-2xl font-bold text-gray-800">{totalPoints}</p>
        </div>
        <div
          class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"
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
            class="text-yellow-600"
          >
            <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
            <path
              d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"
            />
            <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
            <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
          </svg>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Hạng</p>
          <p class="text-2xl font-bold text-blue-600">
            {totalPoints >= 1000 ? "Vàng" : totalPoints >= 500 ? "Bạc" : "Đồng"}
          </p>
        </div>
        <div
          class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
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
            class="text-blue-600"
          >
            <path
              d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"
            />
            <path d="M11 12 5.12 2.2" />
            <path d="m13 12 5.88-9.8" />
            <path d="M8 7h8" />
            <circle cx="12" cy="17" r="5" />
            <path d="M12 18v-2h-.5" />
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Filter Tabs -->
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-8">
    <div class="flex flex-wrap gap-2">
      <button
        on:click={() => (selectedCategory = "all")}
        class="px-4 py-2 rounded-lg transition-all duration-300 {selectedCategory ===
        'all'
          ? 'bg-teal-500 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
      >
        Tất cả
      </button>
      <button
        on:click={() => (selectedCategory = "travel")}
        class="px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 {selectedCategory ===
        'travel'
          ? 'bg-teal-500 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
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
          <path d="M10.5 17h1.227a2 2 0 0 0 1.345-.52L18 12" />
          <path d="m12 13.5 3.75.5" />
          <path d="m4.5 8 10.58-5.06a1 1 0 0 1 1.342.488L18.5 8" />
          <path d="M6 10V8" />
          <path d="M6 14v1" />
          <path d="M6 19v2" />
          <rect x="2" y="8" width="20" height="13" rx="2" />
        </svg>
        Du lịch
      </button>
      <button
        on:click={() => (selectedCategory = "social")}
        class="px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 {selectedCategory ===
        'social'
          ? 'bg-teal-500 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
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
          <path
            d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"
          />
          <path
            d="M7.5 9.5c0 .687.265 1.383.697 1.844l3.009 3.264a1.14 1.14 0 0 0 .407.314 1 1 0 0 0 .783-.004 1.14 1.14 0 0 0 .398-.31l3.008-3.264A2.77 2.77 0 0 0 16.5 9.5 2.5 2.5 0 0 0 12 8a2.5 2.5 0 0 0-4.5 1.5"
          />
        </svg>
        Xã hội
      </button>
      <button
        on:click={() => (selectedCategory = "planning")}
        class="px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 {selectedCategory ===
        'planning'
          ? 'bg-teal-500 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
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
          class="lucide lucide-notebook-pen-icon lucide-notebook-pen"
          ><path
            d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"
          /><path d="M2 6h4" /><path d="M2 10h4" /><path d="M2 14h4" /><path
            d="M2 18h4"
          /><path
            d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"
          /></svg
        >
        Lập kế hoạch
      </button>
      <button
        on:click={() => (selectedCategory = "milestone")}
        class="px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 {selectedCategory ===
        'milestone'
          ? 'bg-teal-500 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
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
          <path d="m12 8 6-3-6-3v10" />
          <path
            d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"
          />
          <path d="m6.49 12.85 11.02 6.3" />
          <path d="M17.51 12.85 6.5 19.15" />
        </svg>
        Cột mốc
      </button>
    </div>
  </div>

  <!-- Loading State -->
  {#if isLoading}
    <div class="flex justify-center items-center py-16">
      <div class="text-center">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"
        ></div>
        <p class="text-gray-600">Đang tải thành tựu...</p>
      </div>
    </div>
  {:else}
    <!-- Achievements Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredAchievements as achievement}
        <AchievementCard
          id={achievement.id}
          title={achievement.title}
          description={achievement.description}
          category={achievement.category}
          isUnlocked={achievement.isUnlocked}
          progress={achievement.progress}
          maxProgress={achievement.maxProgress}
          points={achievement.points}
          unlockedDate={achievement.unlockedDate}
          icon={achievement.icon}
        />
      {/each}
    </div>

    <!-- Empty State -->
    {#if filteredAchievements.length === 0}
      <div class="text-center py-16">
        <div
          class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
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
            class="text-gray-400"
          >
            <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978" />
            <path
              d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"
            />
            <path d="M18 9h1.5a1 1 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" />
            <path d="M6 9H4.5a1 1 0 0 1 0-5H6" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          Không có thành tựu nào
        </h3>
        <p class="text-gray-600">Hãy thử chọn danh mục khác.</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  /* Custom animations */
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
</style>
