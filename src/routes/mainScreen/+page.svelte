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
