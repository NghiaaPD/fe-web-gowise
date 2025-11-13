<script lang="ts">
  import IoMdTime from "svelte-icons/io/IoMdTime.svelte";
  import IoMdHeart from "svelte-icons/io/IoMdHeart.svelte";
  import IoMdEye from "svelte-icons/io/IoMdEye.svelte";

  interface Post {
    postId: string;
    title: string;
    content: string;
    category: string;
    totalLikes: number;
    totalViews: number;
    publishedAt?: string;
  }

  let { post, friendId }: { post: Post; friendId: string } = $props();

  let fullContent = $state("");
  let isLoadingContent = $state(false);
  let showFullContent = $state(false);

  const BACKEND_BASE = (() => {
    const domain =
      import.meta.env.VITE_BE_DOMAIN?.replace(/\/$/, "") ?? "http://localhost";
    const port = import.meta.env.VITE_BE_PORT
      ? `:${import.meta.env.VITE_BE_PORT}`
      : "";
    return `${domain}${port}`;
  })();

  function getAccessTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const tokenCookie = document.cookie
      .split(";")
      .find((cookie) => cookie.trim().startsWith("accessToken="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }

  function getPreviewContent(content: string, maxLength: number = 200): string {
    if (!content) return "";
    const normalized = content.trim();
    if (normalized.length <= maxLength) return normalized;
    return normalized.slice(0, maxLength) + "...";
  }

  function formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  async function toggleContent(e: MouseEvent) {
    e.stopPropagation();

    if (showFullContent) {
      showFullContent = false;
      return;
    }

    if (fullContent) {
      showFullContent = true;
      return;
    }

    // Fetch full post content
    await fetchFullPost();
  }

  async function fetchFullPost() {
    isLoadingContent = true;
    try {
      const token = getAccessTokenFromCookie();
      const apiUrl = `${BACKEND_BASE}/api/posts/${post.postId}`;

      console.log("📄 Fetching full post from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("📄 Post response:", result);

        if (result.success && result.data) {
          fullContent = result.data.content || post.content;
          showFullContent = true;
        }
      } else {
        console.error("Failed to fetch post:", response.status);
        fullContent = post.content;
        showFullContent = true;
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      fullContent = post.content;
      showFullContent = true;
    } finally {
      isLoadingContent = false;
    }
  }
</script>

<div class="w-full">
  <!-- Post Content -->
  <div class="mb-4">
    <h3 class="text-lg font-bold text-gray-800 mb-2">
      {post.title}
    </h3>

    <!-- Category Badge -->
    {#if post.category}
      <span
        class="inline-block px-3 py-1 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 rounded-full text-xs font-medium mb-3"
      >
        {post.category}
      </span>
    {/if}

    <!-- Content Preview/Full -->
    <div class="text-gray-700 text-sm leading-relaxed break-words">
      {#if showFullContent}
        <p class="whitespace-pre-wrap break-words">
          {fullContent || post.content}
        </p>
      {:else}
        <p class="break-words">{getPreviewContent(post.content)}</p>
      {/if}
    </div>

    <!-- Read More/Less Button -->
    <button
      onclick={toggleContent}
      class="mt-2 text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1 transition-colors"
      disabled={isLoadingContent}
    >
      {#if isLoadingContent}
        <div
          class="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"
        ></div>
        Đang tải...
      {:else if showFullContent}
        Thu gọn
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
        >
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      {:else}
        Xem thêm
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
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      {/if}
    </button>
  </div>

  <!-- Interaction Bar -->
  <div class="flex items-center justify-between pt-3 border-t border-gray-100">
    <!-- Left: Date and Views -->
    <div class="flex items-center gap-4 text-xs text-gray-500">
      {#if post.publishedAt}
        <div class="flex items-center gap-1">
          <div class="w-3 h-3">
            <IoMdTime />
          </div>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      {/if}
      <div class="flex items-center gap-1">
        <div class="w-3 h-3">
          <IoMdEye />
        </div>
        <span>{formatNumber(post.totalViews)}</span>
      </div>
    </div>

    <!-- Right: Likes -->
    <div class="flex items-center gap-1 text-red-500">
      <div class="w-4 h-4">
        <IoMdHeart />
      </div>
      <span class="text-sm font-medium">{formatNumber(post.totalLikes)}</span>
    </div>
  </div>
</div>

<style>
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
