<script lang="ts">
  import SideBar from "../../../components/SideBar.svelte";
  import HeaderMainScreen from "../../../components/HeaderMainScreen.svelte";
  import DashBoard from "../../../pages/DashBoard.svelte";
  import ManagePlan from "../../../pages/ManagePlan.svelte";
  import BlogBoard from "../../../pages/BlogBoard.svelte";
  import FundBoard from "../../../pages/FundBoard.svelte";
  import ChatBotPage from "../../../pages/ChatBotPage.svelte";
  import SettingPage from "../../../pages/SettingPage.svelte";
  import FillInformation from "../../../components/fillInformation.svelte";
  import { onMount } from "svelte";

  // Get userId from URL path (alternative approach without $app/stores)
  let userId = $state("");

  // Current active page
  let currentPage = $state("dashboard");

  // Show fill information dialog
  let showFillDialog = $state(false);

  // Handle navigation from sidebar
  function handleNavigation(event: CustomEvent<{ page: string }>) {
    currentPage = event.detail.page;
  }

  // Verify user authentication and token
  onMount(async () => {
    // Extract userId from current URL path
    const pathSegments = window.location.pathname.split("/");
    userId = pathSegments[1]; // Assuming URL format: /{userId}/mainScreen

    // Kiểm tra accessToken từ cookie
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );

    if (!tokenCookie) {
      // Không có token, redirect về trang đăng nhập
      window.location.href = "/";
      return;
    }

    const token = tokenCookie.split("=")[1];

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
        const res = await fetch(
          `http://nghiapd.ddns.net:8081/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.status === 404) {
          showFillDialog = true;
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      window.location.href = "/";
      return;
    }
  });
</script>

<div class="flex h-screen w-full">
  <div class="w-1/5 min-w-[128px] max-w-[256px] h-full">
    <SideBar on:navigate={handleNavigation} />
  </div>
  <div class="flex-1 h-full flex flex-col">
    <div class="w-full h-[80px] flex-shrink-0">
      <HeaderMainScreen />
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
      {:else if currentPage === "chat"}
        <ChatBotPage />
      {:else if currentPage === "settings"}
        <SettingPage />
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
