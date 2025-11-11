<script lang="ts">
  import SideBar from "../../../components/SideBar.svelte";
  import HeaderMainScreen from "../../../components/HeaderMainScreen.svelte";
  import DashBoard from "../../../pages/DashBoard.svelte";
  import ManagePlan from "../../../pages/ManagePlan.svelte";
  import BlogBoard from "../../../pages/BlogBoard.svelte";
  import FundBoard from "../../../pages/GalleryBoard.svelte";
  import AchievementPage from "../../../pages/achievementPage.svelte";
  import ChatBotPage from "../../../pages/ChatBotPage.svelte";
  import SettingPage from "../../../pages/SettingPage.svelte";
  import FillInformation from "../../../components/fillInformation.svelte";
  import { onMount } from "svelte";

  const USER_CACHE_KEY = "gowise:user-data";
  const BACKEND_BASE = (() => {
    const domain = import.meta.env.VITE_BE_DOMAIN?.replace(/\/$/, "") ?? "http://localhost";
    const port = import.meta.env.VITE_BE_PORT ? `:${import.meta.env.VITE_BE_PORT}` : "";
    return `${domain}${port}`;
  })();

  function readCachedUserData() {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(USER_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn("Unable to read cached user data", error);
      return null;
    }
  }

  function cacheUserData(data: any | null) {
    if (typeof window === "undefined") return;
    try {
      if (data) {
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(data));
      } else {
        sessionStorage.removeItem(USER_CACHE_KEY);
      }
    } catch (error) {
      console.warn("Unable to cache user data", error);
    }
  }

  function getAccessTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const tokenCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("accessToken="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }

  function clearPaymentQueryParam() {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("payment");
    const query = url.searchParams.toString();
    const next = query ? `${url.pathname}?${query}` : url.pathname;
    window.history.replaceState({}, "", next);
  }

  // Get userId from URL path (alternative approach without $app/stores)
  let userId = $state("");

  // Current active page
  let currentPage = $state("dashboard");

  // Achievement reload key - increments each time achievement tab is clicked
  let achievementKey = $state(0);

  // Show fill information dialog
  let showFillDialog = $state(false);

  // User data state
  let userData = $state(readCachedUserData());
  let showUpgradeBanner = $state(false);
  let upgradeBannerMessage = $state("");

  // Handle navigation from sidebar
  function handleNavigation(event: CustomEvent<{ page: string }>) {
    const previousPage = currentPage;
    currentPage = event.detail.page;

    // Increment achievement key when navigating to achievement page
    if (event.detail.page === "achievement") {
      achievementKey++;
    }
  }

  // Function to refresh user data
  async function refreshUserData() {
    if (!userId) return;

    try {
      const token = getAccessTokenFromCookie();
      if (!token) return;

      const res = await fetch(`${BACKEND_BASE}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const response = await res.json();
        userData = response.data;
        cacheUserData(userData);
      } else if (res.status === 404) {
        cacheUserData(null);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }

  // Handle profile update event
  function handleProfileUpdate() {
    refreshUserData();
  }

  // Verify user authentication and token
  onMount(async () => {
    // Extract userId from current URL path
    const pathSegments = window.location.pathname.split("/");
    userId = pathSegments[1]; // Assuming URL format: /{userId}/mainScreen

    // Kiểm tra accessToken từ cookie
    const token = getAccessTokenFromCookie();

    if (!token) {
      // Không có token, redirect về trang đăng nhập
      window.location.href = "/";
      return;
    }

    // Decode token để kiểm tra user_id và role
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      const tokenData = JSON.parse(decoded);
      const tokenUserId = tokenData?.user_id || tokenData?.id || tokenData?.sub;
      const userRole = tokenData?.role || tokenData?.user_role || "user";

      // Kiểm tra nếu user là admin thì redirect về admin dashboard
      if (userRole === "admin" || userRole === "administrator") {
        window.location.href = "/admin/dashboard";
        return;
      }

      // Kiểm tra user_id từ token có khớp với URL không
      if (tokenUserId && tokenUserId.toString() !== userId) {
        // User ID không khớp, redirect về trang đúng của user
        window.location.href = `/${tokenUserId}/mainScreen`;
        return;
      }

      if (!tokenUserId) {
        // Không lấy được user ID từ token
        console.error("Cannot extract user ID from token");
        window.location.href = "/";
        return;
      }

      // Log successful authentication
      console.log(`User ${userId} authenticated successfully`);

      // Gọi API để lấy thông tin user
      try {
        const res = await fetch(`${BACKEND_BASE}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 404) {
          showFillDialog = true;
          cacheUserData(null);
        } else if (res.ok) {
          const response = await res.json();
          userData = response.data; // Lấy data từ response
          cacheUserData(userData);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get("payment");
      if (paymentStatus === "success") {
        await handlePostPaymentUpgrade(token);
      } else if (paymentStatus === "failed" || paymentStatus === "cancel") {
        clearPaymentQueryParam();
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      window.location.href = "/";
      return;
    }
  });

  async function handlePostPaymentUpgrade(token: string) {
    if (!userId) return;
    try {
      const response = await fetch(`${BACKEND_BASE}/users/${userId}/is_premium`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPremium: true }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        const message =
          payload?.message || `Không thể cập nhật tài khoản (HTTP ${response.status})`;
        throw new Error(message);
      }
      await refreshUserData();
      showUpgradeBanner = true;
      upgradeBannerMessage = "Chúc mừng! Bạn đã trở thành thành viên Premium.";
      setTimeout(() => {
        showUpgradeBanner = false;
        upgradeBannerMessage = "";
      }, 5000);
    } catch (error) {
      showUpgradeBanner = true;
      upgradeBannerMessage =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái Premium sau thanh toán.";
      setTimeout(() => {
        showUpgradeBanner = false;
        upgradeBannerMessage = "";
      }, 6000);
    } finally {
      clearPaymentQueryParam();
    }
  }
</script>

{#if showUpgradeBanner}
  <div class="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
    <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg shadow">
      {upgradeBannerMessage}
    </div>
  </div>
{/if}

<div class="flex h-screen w-full">
  <div class="w-1/5 min-w-[128px] max-w-[256px] h-full">
    <SideBar on:navigate={handleNavigation} />
  </div>
  <div class="flex-1 h-full flex flex-col">
    <div class="w-full h-[80px] flex-shrink-0">
      <HeaderMainScreen {userData} />
    </div>
    <div class="flex-1 w-full overflow-y-auto">
      {#if currentPage === "dashboard"}
        <DashBoard />
      {:else if currentPage === "plans"}
        <ManagePlan />
      {:else if currentPage === "blog"}
        <BlogBoard />
      {:else if currentPage === "fund"}
        <FundBoard />
      {:else if currentPage === "achievement"}
        {#key achievementKey}
          <AchievementPage />
        {/key}
      {:else if currentPage === "chat"}
        <ChatBotPage />
      {:else if currentPage === "settings"}
        <SettingPage on:profileUpdated={handleProfileUpdate} />
      {:else}
        <!-- Default to dashboard -->
        <DashBoard />
      {/if}
    </div>
  </div>
</div>

{#if showFillDialog}
  <FillInformation on:close={() => (showFillDialog = false)} />
{/if}
