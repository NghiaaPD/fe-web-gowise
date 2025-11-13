<script lang="ts">
  import { onMount } from "svelte";
  import LoadingScreen from "../../components/loadingScreen.svelte";
  import { showNotification } from "$lib/index";

  // Redirect to user-specific route
  onMount(() => {
    // If user just registered, show a notification to check email
    try {
      const justRegistered = localStorage.getItem("justRegistered");
      if (justRegistered === "1") {
        showNotification(
          {
            title: "Đăng ký thành công",
            message: "Vui lòng kiểm tra email để kích hoạt tài khoản.",
          },
          "success"
        );
        localStorage.removeItem("justRegistered");
      }
    } catch (e) {
      // ignore
    }
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

    // Decode token để lấy user_id và role
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      const tokenData = JSON.parse(decoded);
      const tokenUserId = tokenData?.user_id || tokenData?.id || tokenData?.sub;
      const userRole = tokenData?.role || tokenData?.user_role || "user";

      // Kiểm tra role và redirect tương ứng
      if (userRole === "admin" || userRole === "administrator") {
        // Admin users go to admin dashboard
        window.location.href = "/admin/dashboard";
      } else if (tokenUserId) {
        // Regular users go to their specific main screen
        window.location.href = `/${tokenUserId}/mainScreen`;
      } else {
        // Không lấy được user ID từ token
        console.error("Cannot extract user ID from token");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      window.location.href = "/";
    }
  });
</script>

<LoadingScreen manualControl={false} />

<!-- Floating Action Button -->
<button
  class="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 flex items-center hover:scale-110 justify-center transition-all duration-300 z-[1000] group"
  aria-label="Add user"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="text-white transition-transform duration-300 group-hover:rotate-90"
  >
    <path d="M2 21a8 8 0 0 1 13.292-6" />
    <circle cx="10" cy="8" r="5" />
    <path d="M19 16v6" />
    <path d="M22 19h-6" />
  </svg>
</button>
