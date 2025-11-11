<script lang="ts">
  import { onMount } from "svelte";
  import { showNotification } from "$lib";

  type ModerateAction = "APPROVE" | "REJECT";
  type AuthSource = "cookie";

  interface AuthContext {
    token: string;
    userId?: string;
    roles?: string[];
    source: AuthSource;
  }

  interface PendingPost {
    id: string;
    authorUserId?: string;
    title: string;
    content?: string;
    status?: string;
    likeCount?: number;
    viewCount?: number;
    category?: string;
    coverImageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  }

  interface PageResponse<T> {
    items?: T[];
    numberOfElements?: number;
    totalElements?: number;
  }

  interface ApiResponse<T> {
    status?: number;
    message?: string;
    data?: T;
    meta?: Record<string, unknown>;
  }

  const BLOG_SERVICE_BASE_URL = getBlogServiceBase();
  const pendingPageSize = 5;

  let pendingPosts: PendingPost[] = [];
  let pendingLoading = false;
  let pendingError = "";
  let pendingPage = 0;
  let pendingTotal = 0;
  let pendingHasMore = false;
  let moderationNotes: Record<string, string> = {};
  let moderationBusy: Record<string, boolean> = {};
  let authSource: AuthSource | null = null;

  function getBlogServiceBase() {
    const local = import.meta.env?.VITE_BLOG_SERVICE_LOCAL;
    if (local) return stripTrailingSlash(local);

    const domain = import.meta.env?.VITE_BE_DOMAIN;
    const port = import.meta.env?.VITE_BE_PORT;

    if (domain && port) {
      return `${stripTrailingSlash(domain)}:${port}`;
    }

    if (domain) {
      return stripTrailingSlash(domain);
    }

    return "http://localhost:8080";
  }

  function stripTrailingSlash(value: string) {
    return value.endsWith("/") ? value.slice(0, -1) : value;
  }

  function blogUrl(path: string, params?: Record<string, string | number>) {
    const base = BLOG_SERVICE_BASE_URL.endsWith("/")
      ? BLOG_SERVICE_BASE_URL
      : `${BLOG_SERVICE_BASE_URL}/`;
    const url = new URL(path, base);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }
    return url.toString();
  }

  function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
    return null;
  }

  function getAccessToken(): string | null {
    return getCookie("accessToken") ?? getCookie("access_token");
  }

  function decodeJWT(token: string) {
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  function resolveUserId(token: string) {
    const payload = decodeJWT(token);
    if (!payload) return null;
    return (
      payload?.user_id ||
      payload?.id ||
      payload?.sub ||
      payload?.userId ||
      null
    );
  }

  function resolveRoles(token: string): string[] {
    const payload = decodeJWT(token);
    if (!payload) return [];
    return extractRolesFromPayload(payload);
  }

  function extractRolesFromPayload(payload: Record<string, unknown>): string[] {
    const candidates = [
      payload?.roles,
      payload?.role,
      payload?.user_role,
      payload?.userRole,
    ];

    for (const candidate of candidates) {
      const normalized = normalizeRoles(candidate);
      if (normalized.length) return normalized;
    }
    return [];
  }

  function normalizeRoles(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .map((role) => String(role).trim().toUpperCase())
        .filter((role) => role.length > 0);
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((role) => role.trim().toUpperCase())
        .filter((role) => role.length > 0);
    }
    return [];
  }

  function getCookieContext(): AuthContext | null {
    const token = getAccessToken();
    if (!token) return null;
    return {
      token,
      userId: resolveUserId(token) ?? undefined,
      roles: resolveRoles(token),
      source: "cookie",
    };
  }

  function getAuthContext(): AuthContext | null {
    return getCookieContext();
  }

  function buildAuthHeaders(context: AuthContext) {
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${context.token}`,
    };
    if (context.userId) {
      headers["X-User-Id"] = context.userId;
    }
    if (context.roles?.length) {
      headers["X-User-Roles"] = context.roles.join(",");
    }
    return headers;
  }

  async function ensureAuthContext(): Promise<AuthContext | null> {
    const context = getAuthContext();
    if (!context) {
      pendingError =
        "Không tìm thấy token hợp lệ. Vui lòng đăng nhập lại để tiếp tục duyệt bài.";
      showNotification(
        {
          title: "Thiếu thông tin đăng nhập",
          message: pendingError,
        },
        "error",
      );
      return null;
    }
    authSource = context.source;
    return context;
  }

  function handleNoteInput(postId: string, value: string) {
    moderationNotes = { ...moderationNotes, [postId]: value };
  }

  function formatUserId(userId?: string) {
    if (!userId) return "Không rõ";
    return `${userId.slice(0, 8)}…${userId.slice(-4)}`;
  }

  function getExcerpt(content = "", maxLength = 220) {
    if (content.length <= maxLength) return content;
    return `${content.slice(0, maxLength)}…`;
  }

  function formatDateTime(value?: string) {
    if (!value) return "Không rõ thời gian";
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  async function fetchPendingPosts(reset = false) {
    if (pendingLoading) return;

    const auth = await ensureAuthContext();
    if (!auth) return;

    pendingLoading = true;
    pendingError = "";
    const pageToLoad = reset ? 0 : pendingPage;

    if (reset) {
      pendingPosts = [];
      pendingPage = 0;
      pendingHasMore = false;
    }

    try {
      const response = await fetch(
        blogUrl("/api/admin/posts/pending", {
          page: pageToLoad,
          size: pendingPageSize,
        }),
        {
          headers: buildAuthHeaders(auth),
          credentials: "include",
        },
      );

      if (!response.ok) {
        const raw = await response.text();
        const fallbackMessage =
          response.status === 401
            ? "Phiên đăng nhập đã hết hạn hoặc không hợp lệ."
            : "Không thể tải danh sách bài viết đang chờ duyệt.";
        throw new Error(raw || fallbackMessage);
      }

      const payload: ApiResponse<PageResponse<PendingPost>> =
        await response.json();
      const newItems = payload?.data?.items ?? [];
      const nextPosts = reset ? newItems : [...pendingPosts, ...newItems];
      pendingPosts = nextPosts;

      const totalFromApi = payload?.data?.totalElements;
      pendingTotal =
        typeof totalFromApi === "number" ? totalFromApi : nextPosts.length;
      pendingHasMore = pendingPosts.length < pendingTotal;
      pendingPage = pageToLoad + 1;
    } catch (error) {
      pendingError =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi lấy dữ liệu bài viết.";
      showNotification(
        {
          title: "Không thể tải bài viết",
          message: pendingError,
        },
        "error",
      );
    } finally {
      pendingLoading = false;
    }
  }

  async function moderatePost(postId: string, action: ModerateAction) {
    if (moderationBusy[postId]) return;

    const auth = await ensureAuthContext();
    if (!auth) return;

    moderationBusy = { ...moderationBusy, [postId]: true };
    pendingError = "";

    try {
      const note = moderationNotes[postId]?.trim();
      const response = await fetch(
        blogUrl(`/api/admin/posts/${postId}/moderate`),
        {
          method: "POST",
          headers: {
            ...buildAuthHeaders(auth),
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action,
            ...(note ? { note } : {}),
          }),
        },
      );

      if (!response.ok) {
        const raw = await response.text();
        const fallbackMessage =
          response.status === 401
            ? "Phiên đăng nhập đã hết hạn hoặc không hợp lệ."
            : "Không thể cập nhật trạng thái bài viết. Vui lòng thử lại sau.";
        throw new Error(raw || fallbackMessage);
      }

      pendingPosts = pendingPosts.filter((post) => post.id !== postId);
      pendingTotal = Math.max(0, pendingTotal - 1);
      pendingHasMore = pendingPosts.length < pendingTotal;
      moderationNotes = { ...moderationNotes, [postId]: "" };

      showNotification(
        {
          title: action === "APPROVE" ? "Đã duyệt bài viết" : "Đã từ chối",
          message:
            action === "APPROVE"
              ? "Bài viết được xuất bản thành công."
              : "Bài viết đã bị từ chối.",
        },
        "success",
      );

      if (pendingPosts.length === 0 && pendingHasMore) {
        await fetchPendingPosts();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể xử lý yêu cầu duyệt bài.";
      pendingError = message;
      showNotification(
        {
          title: "Không thể cập nhật bài viết",
          message,
          icon: "⚠️",
        },
        "error",
      );
    } finally {
      moderationBusy = { ...moderationBusy, [postId]: false };
    }
  }

  onMount(() => {
    fetchPendingPosts(true);
  });
</script>

<div class="rounded-lg border border-gray-200 bg-white shadow-sm">
  <div
    class="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 px-6 py-4"
  >
    <div>
      <h4 class="text-lg font-semibold text-gray-900">
        Bài viết đang chờ duyệt
      </h4>
      <p class="text-sm text-gray-500">
        {pendingTotal > 0
          ? `Có ${pendingTotal} bài viết ở trạng thái Pending`
          : "Không có bài viết Pending vào lúc này"}
      </p>
      {#if authSource}
        <p class="text-xs text-gray-400">
          Đang dùng token của phiên đăng nhập hiện tại.
        </p>
      {/if}
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        onclick={() => fetchPendingPosts(true)}
        class="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800 disabled:opacity-50"
        disabled={pendingLoading}
      >
        Tải lại
      </button>
      {#if pendingHasMore}
        <button
          type="button"
          onclick={() => fetchPendingPosts()}
          class="rounded-full border border-teal-200 px-4 py-1.5 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal-50 disabled:opacity-50"
          disabled={pendingLoading}
        >
          Tải thêm
        </button>
      {/if}
    </div>
  </div>

  {#if pendingLoading && pendingPosts.length === 0}
    <div class="px-6 py-8 text-center text-gray-500">
      Đang tải danh sách bài viết…
    </div>
  {:else if pendingError && pendingPosts.length === 0}
    <div class="px-6 py-8 text-center text-red-600">
      {pendingError}
    </div>
  {:else if pendingPosts.length === 0}
    <div class="px-6 py-8 text-center text-gray-500">
      Hiện chưa có bài viết nào cần duyệt.
    </div>
  {:else}
    <div class="divide-y divide-gray-100">
      {#each pendingPosts as post (post.id)}
        <div class="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-stretch lg:gap-6">
          {#if post.coverImageUrl}
            <div class="max-w-xs overflow-hidden rounded-xl border border-gray-100">
              <img
                src={post.coverImageUrl}
                alt={`Ảnh bìa bài viết ${post.title}`}
                class="h-48 w-full object-cover"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
            </div>
          {/if}
          <div class="flex flex-1 flex-col gap-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Tác giả
                </p>
                <p class="text-sm font-semibold text-gray-900">
                  {formatUserId(post.authorUserId)}
                </p>
                <p class="text-xs text-gray-400">
                  Gửi lúc {formatDateTime(post.createdAt)}
                </p>
              </div>
              <span
                class="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase text-orange-600"
              >
                {post.status ?? "PENDING"}
              </span>
            </div>
            <div>
              <h5 class="text-xl font-semibold text-gray-900">
                {post.title}
              </h5>
              <p class="mt-2 text-sm text-gray-600">
                {getExcerpt(post.content)}
              </p>
            </div>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500">
              {#if post.category}
                <span
                  class="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700"
                >
                  #{post.category}
                </span>
              {/if}
              <span>👍 {post.likeCount ?? 0}</span>
              <span>👁️ {post.viewCount ?? 0}</span>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-semibold uppercase text-gray-500">
                Ghi chú cho quyết định (tuỳ chọn)
              </label>
              <textarea
                class="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-700 focus:border-teal-400 focus:outline-none"
                rows="2"
                value={moderationNotes[post.id] ?? ""}
                oninput={(event) =>
                  handleNoteInput(
                    post.id,
                    (event.currentTarget as HTMLTextAreaElement).value,
                  )}
                placeholder="Nhập lý do duyệt / từ chối để ghi lại lịch sử."
              />
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600 disabled:opacity-50"
                onclick={() => moderatePost(post.id, "APPROVE")}
                disabled={!!moderationBusy[post.id]}
              >
                {moderationBusy[post.id] ? "Đang xử lý…" : "Approve"}
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                onclick={() => moderatePost(post.id, "REJECT")}
                disabled={!!moderationBusy[post.id]}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if pendingHasMore && pendingPosts.length > 0}
    <div class="border-t border-gray-100 px-6 py-4 text-right">
      <button
        type="button"
        onclick={() => fetchPendingPosts()}
        class="rounded-full border border-teal-200 px-5 py-2 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal-50 disabled:opacity-50"
        disabled={pendingLoading}
      >
        {pendingLoading ? "Đang tải…" : "Tải thêm bài viết"}
      </button>
    </div>
  {/if}
</div>
