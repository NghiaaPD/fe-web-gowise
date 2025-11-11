<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import AdminPendingPosts from "../../../../components/AdminPendingPosts.svelte";

  onMount(() => {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken="),
    );

    if (!tokenCookie) {
      window.location.href = "/";
      return;
    }

    const token = tokenCookie.split("=")[1];

    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      const tokenData = JSON.parse(decoded);
      const userRole = tokenData?.role || tokenData?.user_role || "user";

      if (userRole !== "admin" && userRole !== "administrator") {
        const userId = tokenData?.user_id || tokenData?.id || tokenData?.sub;
        if (userId) {
          window.location.href = `/${userId}/mainScreen`;
        } else {
          window.location.href = "/";
        }
        return;
      }

      console.log(
        `Admin user authenticated successfully with role: ${userRole}`,
      );
    } catch (error) {
      console.error("Error verifying admin token:", error);
      window.location.href = "/";
    }
  });

  function goBack() {
    goto("/admin/dashboard?tab=users");
  }
</script>

<div class="min-h-screen bg-gray-50 p-6">
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-teal-600">Quản lý bài viết</p>
        <h1 class="text-3xl font-bold text-gray-900">
          Bài viết Pending cần duyệt
        </h1>
        <p class="text-sm text-gray-500">
          Kiểm tra nội dung người dùng gửi lên và quyết định Approve hoặc Reject.
        </p>
      </div>
      <button
        type="button"
        class="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-white"
        onclick={goBack}
      >
        Quay lại bảng quản trị
      </button>
    </div>

    <AdminPendingPosts />
  </div>
</div>
