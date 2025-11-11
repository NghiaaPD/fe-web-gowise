<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import FaSearch from "svelte-icons/fa/FaSearch.svelte";
  import FaPencilAlt from "svelte-icons/fa/FaPencilAlt.svelte";
  import { showNotification } from "$lib";
  import IoIosPin from "svelte-icons/io/IoIosPin.svelte";
  import IoMdTime from "svelte-icons/io/IoMdTime.svelte";
  import IoMdHeart from "svelte-icons/io/IoMdHeart.svelte";
  import IoMdEye from "svelte-icons/io/IoMdEye.svelte";

  type PostStatus = "PENDING" | "APPROVED" | "REJECTED";

  interface PostResponse {
    id: string;
    authorUserId: string;
    title: string;
    content: string;
    status: PostStatus;
    likeCount: number;
    viewCount: number;
    category?: string | null;
    coverImageUrl?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    publishedAt?: string | null;
  }

  interface PageResponse<T> {
    items: T[];
    numberOfElements: number;
    totalElements: number;
  }

  interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
    meta?: Record<string, unknown> | null;
  }

  interface BlogPostView {
    id: string;
    authorUserId: string;
    title: string;
    content: string;
    status: PostStatus;
    likes: number;
    views: number;
    author: string;
    readTime: string;
    publishDateLabel: string;
    publishedAt: Date;
    description: string;
    imageUrl: string;
    category: string;
    featured: boolean;
  }

  interface UserPostStats {
    totalPosts: number;
    totalLikes: number;
    totalViews: number;
  }

  const FEATURED_LIKE_THRESHOLD = 30;
  const FEATURED_VIEW_THRESHOLD = 800;
  const PLACEHOLDER_IMAGES = ["/beach.jpg"];
  const FALLBACK_CATEGORIES = [
    "Du lịch",
    "Địa điểm ăn chơi",
    "Đô ăn & nước uống",
    "Du lịch tiết kiệm",
  ];
  const LIKED_STORAGE_KEY = "gowise_blog_liked_posts";
  const createTitleId = "blog-title-input";
  const createContentId = "blog-content-input";
  const createCategoryId = "blog-category-select";

  const blogServiceBaseCandidates = collectBlogServiceCandidates();
  let blogServiceBaseUrl = blogServiceBaseCandidates[0] || "";

  let blogPosts: BlogPostView[] = [];
  let searchQuery = "";
  let selectedCategory = "";
  let viewMode = "grid";
  let sortBy = "date";
  let categories: string[] = [...FALLBACK_CATEGORIES];
  let filteredPosts: BlogPostView[] = [];
  let stats = {
    total: 0,
    totalViews: 0,
    totalLikes: 0,
  };
  let isLoading = false;
  let loadError = "";
  let userId = "";
  let accessToken = "";
  let likedPostIds: Set<string> = new Set();
  let detailModalOpen = false;
  let selectedPost: BlogPostView | null = null;
  let createModalOpen = false;
  let isSubmittingPost = false;
  let hasMounted = false;
  let appliedSearchQuery = "";
  let appliedCategory = "";
  let filterDebounceHandle: ReturnType<typeof setTimeout> | null = null;
  function getDefaultCategory() {
    return categories.length ? categories[0] : FALLBACK_CATEGORIES[0];
  }

  let createForm = {
    title: "",
    content: "",
    category: getDefaultCategory(),
  };
  let formErrors = {
    title: "",
    content: "",
    category: "",
  };
  let userStats: UserPostStats | null = null;

  onMount(() => {
    resolveSession();
    loadLikedFromStorage();
    fetchFeed();
    fetchMyPostStats();
    hasMounted = true;
  });

  onDestroy(() => {
    if (filterDebounceHandle) {
      clearTimeout(filterDebounceHandle);
    }
  });

  $: filteredPosts = applyFilters(blogPosts);
  $: stats = computeStats(blogPosts, userStats);

  function appendPort(domain: string, port: string) {
    if (!port) return domain;
    const normalized = domain.replace(/\/$/, "");
    const hasPort = /:\\d+$/.test(normalized.replace(/^https?:\/\//, ""));
    return hasPort ? normalized : `${normalized}:${port}`;
  }

  function collectBlogServiceCandidates(): string[] {
    // Return full backend URL to bypass Vite proxy
    return ["http://gowise.ddns.net:8081"];
  }

  function resolveSession() {
    if (typeof window === "undefined") return;
    const segments = window.location.pathname.split("/").filter(Boolean);
    userId = segments[0] || "";
    const tokenCookie =
      typeof document !== "undefined"
        ? document.cookie
            .split(";")
            .map((c) => c.trim())
            .find((cookie) => cookie.startsWith("accessToken="))
        : undefined;
    if (tokenCookie) {
      accessToken = decodeURIComponent(tokenCookie.split("=")[1] || "");
      console.log(
        "✅ Found accessToken:",
        accessToken.substring(0, 20) + "..."
      );
    } else {
      console.warn("❌ No accessToken found in cookies");
      console.log("Available cookies:", document.cookie);
    }
    console.log("🆔 User ID from URL:", userId);
  }

  function loadLikedFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(LIKED_STORAGE_KEY);
      if (raw) {
        likedPostIds = new Set(JSON.parse(raw));
      }
    } catch (error) {
      console.warn("Unable to read liked posts from storage", error);
    }
  }

  function persistLikedToStorage() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        LIKED_STORAGE_KEY,
        JSON.stringify(Array.from(likedPostIds))
      );
    } catch (error) {
      console.warn("Unable to persist liked posts", error);
    }
  }

  async function fetchFromBlog<T>(
    path: string,
    {
      method = "GET",
      jsonBody,
      withAuth = false,
      allow404 = false,
    }: {
      method?: string;
      jsonBody?: unknown;
      withAuth?: boolean;
      allow404?: boolean;
    } = {}
  ): Promise<T | null> {
    const candidates = blogServiceBaseUrl
      ? [
          blogServiceBaseUrl,
          ...blogServiceBaseCandidates.filter(
            (candidate) => candidate !== blogServiceBaseUrl
          ),
        ]
      : [...blogServiceBaseCandidates];

    if (candidates.length === 0) {
      throw new Error("Blog service URL chưa được cấu hình.");
    }

    let saw404 = false;
    let lastError: Error | null = null;

    for (const candidate of candidates) {
      if (!candidate) continue;
      try {
        const perform = async (useAuthHeader: boolean) => {
          const headers = buildHeaders({
            json: jsonBody !== undefined,
            withAuth: useAuthHeader,
          });
          const body =
            jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined;
          const finalUrl = buildBlogUrl(path, candidate);
          console.log('🚀 [fetchFromBlog] Final URL to fetch:', finalUrl);
          console.log('🚀 [fetchFromBlog] Headers:', headers);
          return fetch(finalUrl, {
            method,
            headers,
            body,
          });
        };

        let response = await perform(withAuth && !!accessToken);

        console.log(
          `🌐 API Response: ${response.status} ${response.statusText} for ${path}`
        );

        if (response.status === 401 && withAuth && accessToken) {
          response = await perform(false);
        }

        if (response.status === 404) {
          console.warn(`❌ 404 Not Found: ${path}`);
          saw404 = true;
          continue;
        }

        if (!response.ok) {
          let detail = `HTTP_${response.status}`;
          try {
            const errorPayload = await response.clone().json();
            console.error(`❌ Error response:`, errorPayload);
            detail = (errorPayload as { message?: string })?.message || detail;
          } catch (parseError) {
            console.warn("Cannot parse error response", parseError);
          }
          lastError = new Error(detail);
          (lastError as Error & { status?: number }).status = response.status;
          break;
        }

        blogServiceBaseUrl = candidate;

        if (response.status === 204) {
          return null;
        }

        try {
          const data = (await response.json()) as T;
          return data;
        } catch (parseError) {
          console.warn("Cannot parse response JSON", parseError);
          return null;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    if (saw404 && allow404) {
      return null;
    }

    if (lastError) {
      throw lastError;
    }

    if (saw404) {
      throw new Error("HTTP_404");
    }

    return null;
  }

  async function fetchFeed({
    search,
    category,
  }: { search?: string; category?: string } = {}) {
    if (blogServiceBaseCandidates.length === 0) {
      loadError = "Blog service URL chưa được cấu hình.";
      return;
    }
    if (!userId) {
      loadError = "Vui lòng đăng nhập để xem bài viết của bạn.";
      console.warn("❌ No userId found, cannot fetch posts");
      return;
    }
    const searchParam = search !== undefined ? search : searchQuery.trim();
    const categoryParam =
      category !== undefined ? category : selectedCategory.trim();
    isLoading = true;
    loadError = "";
    try {
      const params = new URLSearchParams({
        page: "0",
        size: "100",
      });
      if (searchParam) params.set("search", searchParam);
      if (categoryParam) params.set("category", categoryParam);

      const url = `/api/posts/me?${params.toString()}`;
      console.log("🔍 Fetching posts from:", url);

      const myPostsPayload = await fetchFromBlog<
        ApiResponse<PageResponse<PostResponse>>
      >(url, {
        withAuth: false, // API chỉ cần X-User-Id và X-User-Roles headers
        allow404: true,
      });

      console.log("📦 Response received:", myPostsPayload);

      if (myPostsPayload) {
        console.log(
          "✅ Posts loaded:",
          myPostsPayload.data?.items?.length || 0
        );
        applyServerPayload(myPostsPayload);
        appliedSearchQuery = searchParam;
        appliedCategory = categoryParam;
      } else {
        console.warn("⚠️ No payload returned (404 or empty)");
        applyServerPayload(null);
        appliedSearchQuery = searchParam;
        appliedCategory = categoryParam;
      }
    } catch (error) {
      console.error("❌ Failed to load blog feed:", error);
      loadError = "Không thể tải bài viết ngay lúc này. Vui lòng thử lại sau.";
    } finally {
      isLoading = false;
    }
  }

  function applyServerPayload(
    payload: ApiResponse<PageResponse<PostResponse>> | null
  ) {
    if (!payload) {
      blogPosts = [];
      categories = [...FALLBACK_CATEGORIES];
      ensureComposeCategory();
      return;
    }
    const items = payload.data?.items ?? [];
    blogPosts = items.map((post, index) => hydratePost(post, index));
    updateCategories(payload.meta?.categories, blogPosts);
  }

  async function fetchMyPostStats() {
    if (!userId) return;
    try {
      const payload = await fetchFromBlog<
        ApiResponse<PageResponse<PostResponse>>
      >(`/api/posts/me?page=0&size=1`, {
        withAuth: false, // API chỉ cần X-User-Id header
        allow404: true,
      });
      if (!payload) return;
      const totalElements = payload.data?.totalElements ?? 0;
      const totalLikes = Number(payload.meta?.totalLike ?? 0);
      const totalViews = Number(payload.meta?.totalViews ?? 0);
      userStats = {
        totalPosts: totalElements,
        totalLikes,
        totalViews,
      };
    } catch (error) {
      console.warn("Cannot load personal stats", error);
    }
  }

  function hydratePost(
    post: PostResponse,
    index = 0,
    previous?: BlogPostView
  ): BlogPostView {
    const parsedDate = post.publishedAt ? new Date(post.publishedAt) : null;
    const publishedAt =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate
        : (previous?.publishedAt ?? computePseudoPublishedDate(index));
    const category =
      (post.category && post.category.trim()) ||
      previous?.category ||
      inferCategory(post.content);
    const imageUrl =
      (post.coverImageUrl && post.coverImageUrl.trim()) ||
      previous?.imageUrl ||
      pickHeroImage(index);
    const author = previous?.author ?? formatAuthor(post.authorUserId);
    return {
      id: post.id,
      authorUserId: post.authorUserId,
      title: post.title,
      content: post.content,
      status: post.status,
      likes: post.likeCount,
      views: post.viewCount,
      author,
      readTime: formatReadTime(post.content),
      publishDateLabel: formatDateLabel(publishedAt),
      publishedAt,
      description: formatDescription(post.content),
      imageUrl,
      category,
      featured: isFeatured(post.likeCount, post.viewCount),
    };
  }

  function computePseudoPublishedDate(index: number) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return date;
  }

  function inferCategory(content: string) {
    const lower = content.toLowerCase();
    if (/(food|cuisine|restaurant|coffee)/.test(lower)) return "Food & Culture";
    if (/(budget|saving|cheap|cost)/.test(lower)) return "Budget Travel";
    if (/(city|guide|metro)/.test(lower)) return "City Guide";
    if (/(safety|secure|solo)/.test(lower)) return "Travel Safety";
    if (/(photo|camera|lens)/.test(lower)) return "Photography";
    if (/(eco|green|sustain|climate)/.test(lower)) return "Eco Travel";
    return "Travel Stories";
  }

  function pickHeroImage(index: number) {
    return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
  }

  function formatAuthor(authorUserId: string) {
    if (!authorUserId) return "Traveler";
    return `Traveler ${authorUserId.slice(0, 4).toUpperCase()}`;
  }

  function formatReadTime(content: string) {
    const words = content?.split(/\s+/).filter(Boolean).length || 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  }

  function formatDescription(content: string) {
    const normalized = content?.trim() || "";
    if (!normalized) return "Đang cập nhật nội dung...";
    return normalized.length > 220
      ? `${normalized.slice(0, 220)}...`
      : normalized;
  }

  function formatDateLabel(date: Date) {
    return date.toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  }

  function isFeatured(likes: number, views: number) {
    return likes >= FEATURED_LIKE_THRESHOLD || views >= FEATURED_VIEW_THRESHOLD;
  }

  function ensureCategorySelection() {
    if (selectedCategory && !categories.includes(selectedCategory)) {
      selectedCategory = "";
    }
  }

  function ensureComposeCategory() {
    if (!createForm.category || !categories.includes(createForm.category)) {
      createForm = { ...createForm, category: getDefaultCategory() };
    }
  }

  function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
  }

  function updateCategories(metaCategories: unknown, posts: BlogPostView[]) {
    const fromMeta = Array.isArray(metaCategories)
      ? metaCategories.filter(isNonEmptyString)
      : [];
    const fromPosts = posts
      .map((post) => post.category)
      .filter(isNonEmptyString);
    const merged = [...FALLBACK_CATEGORIES, ...fromMeta, ...fromPosts].filter(
      isNonEmptyString
    );
    const unique = merged.filter(
      (category, index, arr) =>
        arr.findIndex(
          (candidate) => candidate.toLowerCase() === category.toLowerCase()
        ) === index
    );
    categories = unique;
    ensureCategorySelection();
    ensureComposeCategory();
  }

  function applyFilters(collection: BlogPostView[]) {
    return collection
      .filter((post) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query);
        const matchesCategory =
          !selectedCategory || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "date") {
          return b.publishedAt.getTime() - a.publishedAt.getTime();
        }
        if (sortBy === "popularity") {
          return b.views - a.views;
        }
        if (sortBy === "likes") {
          return b.likes - a.likes;
        }
        return 0;
      });
  }

  function computeStats(
    posts: BlogPostView[],
    personalStats: {
      totalPosts: number;
      totalLikes: number;
      totalViews: number;
    } | null
  ) {
    const base = {
      total: posts.length,
      totalViews: posts.reduce((sum, post) => sum + post.views, 0),
      totalLikes: posts.reduce((sum, post) => sum + post.likes, 0),
    };
    if (!personalStats) {
      return base;
    }
    return {
      total: personalStats.totalPosts,
      totalViews: personalStats.totalViews,
      totalLikes: personalStats.totalLikes,
    };
  }

  function buildHeaders({
    json = false,
    withAuth = false,
  }: { json?: boolean; withAuth?: boolean } = {}) {
    const headers: Record<string, string> = {};
    if (json) headers["Content-Type"] = "application/json";
    if (userId) headers["X-User-Id"] = userId;

    // Lấy role từ JWT token và gửi X-User-Roles
    if (accessToken) {
      try {
        const payload = accessToken.split(".")[1];
        const decoded = JSON.parse(atob(payload));
        const role = decoded.role || decoded.roles?.[0] || "user";
        headers["X-User-Roles"] = role;
        console.log("📋 Headers being sent:", {
          "X-User-Id": userId,
          "X-User-Roles": role,
        });
      } catch (error) {
        console.warn("Cannot decode token for roles", error);
      }
    }

    return headers;
  }

  function buildBlogUrl(path: string, base = blogServiceBaseUrl) {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    // Gọi trực tiếp full URL đến backend (bypass Vite proxy)
    const fullUrl = `http://gowise.ddns.net:8081${normalizedPath}`;
    console.log("🔗 Using full URL (direct to backend):", fullUrl);

    return fullUrl;
  }

  function extractErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message;
    return "Đã có lỗi xảy ra, vui lòng thử lại.";
  }

  function handleWritePost() {
    if (!userId) {
      showNotification(
        {
          title: "Chưa đăng nhập",
          message: "Vui lòng đăng nhập để viết bài mới.",
        },
        "error"
      );
      return;
    }
    formErrors = { title: "", content: "", category: "" };
    if (!createForm.category) {
      createForm = { ...createForm, category: getDefaultCategory() };
    }
    createModalOpen = true;
  }

  async function handleLike(post: BlogPostView) {
    if (blogServiceBaseCandidates.length === 0) {
      showNotification(
        {
          title: "Thiếu cấu hình",
          message: "Không xác định được địa chỉ Blog Service.",
        },
        "error"
      );
      return;
    }
    if (!userId) {
      showNotification(
        {
          title: "Yêu thích bài viết",
          message: "Đăng nhập để tiếp tục tương tác.",
        },
        "error"
      );
      return;
    }
    try {
      const alreadyLiked = likedPostIds.has(post.id);
      const method = alreadyLiked ? "DELETE" : "POST";
      const payload = await fetchFromBlog<ApiResponse<number>>(
        `/api/posts/${post.id}/like`,
        {
          method,
          withAuth: false, // API chỉ cần X-User-Id header
        }
      );
      if (!payload || payload.data === undefined) {
        throw new Error("Không thể cập nhật lượt thích.");
      }
      const updatedLikes = Number(payload.data ?? post.likes);
      blogPosts = blogPosts.map((item) =>
        item.id === post.id ? { ...item, likes: updatedLikes } : item
      );
      if (selectedPost?.id === post.id) {
        selectedPost = { ...selectedPost, likes: updatedLikes };
      }
      if (alreadyLiked) {
        likedPostIds.delete(post.id);
      } else {
        likedPostIds.add(post.id);
      }
      likedPostIds = new Set(likedPostIds);
      persistLikedToStorage();
    } catch (error) {
      console.error("Failed to like post", error);
      showNotification(
        {
          title: "Thao tác thất bại",
          message: extractErrorMessage(error),
        },
        "error"
      );
    }
  }

  function scheduleRealtimeFilters() {
    if (!hasMounted) return;
    const trimmedSearch = searchQuery.trim();
    const trimmedCategory = selectedCategory.trim();
    const searchChanged = trimmedSearch !== appliedSearchQuery;
    const categoryChanged = trimmedCategory !== appliedCategory;
    if (!searchChanged && !categoryChanged) {
      return;
    }
    if (filterDebounceHandle) {
      clearTimeout(filterDebounceHandle);
    }
    const delay = searchChanged ? 350 : 0;
    filterDebounceHandle = setTimeout(() => {
      fetchFeed({
        search: trimmedSearch,
        category: trimmedCategory,
      });
    }, delay);
  }

  function handleSearchInput(value: string) {
    searchQuery = value;
    scheduleRealtimeFilters();
  }

  function handleCategoryFilter(category: string) {
    selectedCategory = category;
    scheduleRealtimeFilters();
  }

  async function handleDelete(post: BlogPostView) {
    if (blogServiceBaseCandidates.length === 0) {
      showNotification(
        {
          title: "Thiếu cấu hình",
          message: "Không xác định được địa chỉ Blog Service.",
        },
        "error"
      );
      return;
    }
    if (!userId) {
      showNotification(
        {
          title: "Cần đăng nhập",
          message: "Hãy đăng nhập để xoá bài viết của bạn.",
        },
        "error"
      );
      return;
    }
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Bạn có chắc chắn muốn xoá "${post.title}"?`
      );
      if (!confirmed) {
        return;
      }
    }
    try {
      const payload = await fetchFromBlog<ApiResponse<UserPostStats>>(
        `/api/posts/${post.id}`,
        {
          method: "DELETE",
          withAuth: false, // API chỉ cần X-User-Id header
        }
      );
      blogPosts = blogPosts.filter((item) => item.id !== post.id);
      likedPostIds.delete(post.id);
      likedPostIds = new Set(likedPostIds);
      persistLikedToStorage();
      updateCategories(null, blogPosts);
      if (selectedPost?.id === post.id) {
        closeDetailModal();
      }
      if (payload?.data) {
        userStats = {
          totalPosts: Number(payload.data.totalPosts ?? 0),
          totalLikes: Number(payload.data.totalLikes ?? 0),
          totalViews: Number(payload.data.totalViews ?? 0),
        };
      } else {
        await fetchMyPostStats();
      }
      showNotification(
        {
          title: "Đã xoá bài viết",
          message: "Bài viết đã được xoá khỏi bảng tin.",
        },
        "success"
      );
    } catch (error) {
      console.error("Failed to delete post", error);
      showNotification(
        {
          title: "Không thể xoá bài viết",
          message: extractErrorMessage(error),
        },
        "error"
      );
    }
  }

  function handleReadMore(post: BlogPostView) {
    selectedPost = post;
    detailModalOpen = true;
    fetchPostDetail(post.id);
  }

  async function fetchPostDetail(postId: string) {
    if (!userId) return;
    try {
      const payload = await fetchFromBlog<ApiResponse<PostResponse>>(
        `/api/posts/${postId}`,
        {
          withAuth: false, // API chỉ cần X-User-Id header
          allow404: true,
        }
      );
      if (!payload?.data) return;
      const updated = hydratePost(
        payload.data,
        blogPosts.findIndex((p) => p.id === postId),
        blogPosts.find((p) => p.id === postId)
      );
      blogPosts = blogPosts.map((post) =>
        post.id === postId ? updated : post
      );
      updateCategories(null, blogPosts);
      if (selectedPost?.id === postId) {
        selectedPost = updated;
      }
    } catch (error) {
      console.warn("Cannot load post detail", error);
    }
  }

  function closeDetailModal() {
    detailModalOpen = false;
    selectedPost = null;
  }

  function closeCreateModal() {
    createModalOpen = false;
    formErrors = { title: "", content: "", category: "" };
  }

  function validateCreateForm() {
    const errors = { title: "", content: "", category: "" };
    if (!createForm.title.trim()) {
      errors.title = "Tiêu đề không được để trống.";
    } else if (createForm.title.trim().length < 6) {
      errors.title = "Tiêu đề nên có ít nhất 6 ký tự.";
    }
    if (!createForm.content.trim()) {
      errors.content = "Nội dung không được để trống.";
    } else if (createForm.content.trim().length < 50) {
      errors.content = "Chia sẻ nhiều hơn (tối thiểu 50 ký tự).";
    }
    if (!createForm.category) {
      errors.category = "Hãy chọn chuyên mục.";
    }
    formErrors = errors;
    return !errors.title && !errors.content && !errors.category;
  }

  async function submitNewPost() {
    if (
      blogServiceBaseCandidates.length === 0 ||
      !validateCreateForm() ||
      !userId
    )
      return;
    isSubmittingPost = true;
    try {
      console.log("📝 Submitting post:", {
        title: createForm.title.trim(),
        content: createForm.content.trim().substring(0, 50) + "...",
        category: createForm.category,
        userId,
        hasToken: !!accessToken,
      });
      const payload = await fetchFromBlog<ApiResponse<PostResponse>>(
        `/api/posts`,
        {
          method: "POST",
          jsonBody: {
            title: createForm.title.trim(),
            content: createForm.content.trim(),
            category: createForm.category,
          },
          withAuth: false, // API chỉ cần X-User-Id header, không cần Authorization
        }
      );
      console.log("📦 Response payload:", payload);
      // Backend có thể trả về 204 No Content (payload null nhưng thành công)
      // hoặc 200/201 với payload data
      if (payload && payload.status !== 200 && payload.status !== 201) {
        console.error("❌ Backend trả về lỗi:", payload);
        throw new Error(payload.message || "Không thể tạo bài viết mới.");
      }
      // Nếu payload null, coi như thành công (204 No Content)
      console.log("✅ Post created successfully (status 204 or 200/201)");
      showNotification(
        {
          title: "Đã gửi bài",
          message: "Bài viết sẽ hiển thị sau khi được duyệt.",
        },
        "success"
      );
      createForm = {
        title: "",
        content: "",
        category: getDefaultCategory(),
      };
      closeCreateModal();
      await Promise.all([fetchFeed(), fetchMyPostStats()]);
    } catch (error) {
      console.error("Failed to submit post", error);
      showNotification(
        {
          title: "Gửi bài thất bại",
          message: extractErrorMessage(error),
        },
        "error"
      );
    } finally {
      isSubmittingPost = false;
    }
  }

  function formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  }
</script>

<div class="p-6 bg-gray-50 min-h-screen">
  <!-- Header Section -->
  <div class="mb-8">
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
    >
      <!-- Title and Description -->
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Travel Blog</h1>
        <p class="text-gray-600">
          Discover amazing travel stories, tips, and guides from our community
          ✈️
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          on:click={handleWritePost}
          class="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
        >
          <div class="w-4 h-4">
            <FaPencilAlt />
          </div>
          <span class="font-medium">Write Post</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Statistics Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Total Posts</p>
          <p class="text-2xl font-bold text-gray-800">
            {stats.total}
          </p>
        </div>
        <div
          class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
        >
          <div class="w-5 h-5 text-blue-600">
            <FaPencilAlt />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Total Views</p>
          <p class="text-2xl font-bold text-green-600">
            {formatNumber(stats.totalViews)}
          </p>
        </div>
        <div
          class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
        >
          <div class="w-4 h-4 text-green-600">
            <FaPencilAlt />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Total Likes</p>
          <p class="text-2xl font-bold text-red-600">
            {formatNumber(stats.totalLikes)}
          </p>
        </div>
        <div
          class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"
        >
          <div class="w-4 h-4 text-red-600">
            <FaPencilAlt />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters and Search Section -->
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
    <div class="flex flex-col lg:flex-row lg:items-center gap-4">
      <!-- Search Bar -->
      <div class="flex-1 relative">
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
          <div class="w-4 h-4 text-gray-400">
            <FaSearch />
          </div>
        </div>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Tìm bài viết theo tiêu đề, nội dung hoặc tác giả..."
          aria-label="Tìm bài viết"
          on:input={(event) =>
            handleSearchInput((event.currentTarget as HTMLInputElement).value)}
          class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
        />
      </div>

      <!-- Category Filter -->
      <div class="flex items-center gap-2">
        <select
          bind:value={selectedCategory}
          class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          on:change={(event) =>
            handleCategoryFilter(
              (event.currentTarget as HTMLSelectElement).value
            )}
        >
          <option value=""> Categories </option>
          {#each categories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
        {#if selectedCategory}
          <button
            type="button"
            class="text-sm text-gray-500 hover:text-gray-700"
            on:click={() => handleCategoryFilter("")}
          >
            Bỏ lọc
          </button>
        {/if}
      </div>

      <!-- Sort By -->
      <select
        bind:value={sortBy}
        class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
      >
        <option value="date">Latest First</option>
        <option value="popularity">Most Popular</option>
        <option value="likes">Most Liked</option>
      </select>

      <!-- View Mode Toggle -->
      <div class="relative flex bg-gray-100 rounded-lg p-1">
        <!-- Sliding background indicator -->
        <div
          class="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out"
          style="left: {viewMode === 'grid'
            ? '4px'
            : 'calc(50% + 2px)'}; width: calc(50% - 6px);"
        ></div>

        <button
          on:click={() => (viewMode = "grid")}
          class="relative z-10 flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-300 {viewMode ===
          'grid'
            ? 'text-teal-600'
            : 'text-gray-500 hover:text-gray-700'}"
          aria-label="Hiển thị dạng lưới"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="8" height="8" rx="1.5"></rect>
            <rect x="13" y="3" width="8" height="8" rx="1.5"></rect>
            <rect x="3" y="13" width="8" height="8" rx="1.5"></rect>
            <rect x="13" y="13" width="8" height="8" rx="1.5"></rect>
          </svg>
        </button>
        <button
          on:click={() => (viewMode = "list")}
          class="relative z-10 flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-300 {viewMode ===
          'list'
            ? 'text-teal-600'
            : 'text-gray-500 hover:text-gray-700'}"
          aria-label="Hiển thị dạng danh sách"
        >
          <svg
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="2.5" rx="1.2"></rect>
            <rect x="3" y="10.75" width="18" height="2.5" rx="1.2"></rect>
            <rect x="3" y="16.5" width="18" height="2.5" rx="1.2"></rect>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Blog Posts Grid/List -->
  <div class="mb-8">
    {#if loadError}
      <div
        class="text-center py-12 bg-white rounded-xl border border-red-100 text-red-600"
      >
        {loadError}
      </div>
    {:else if isLoading}
      <div class="text-center py-16 text-gray-500">Đang tải bài viết...</div>
    {:else if filteredPosts.length === 0}
      <!-- Empty State -->
      <div class="text-center py-16">
        <div
          class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <div class="w-12 h-12 text-gray-400">
            <FaSearch />
          </div>
        </div>
        {#if selectedCategory}
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            Không có bài viết về chủ đề này
          </h3>
          <p class="text-gray-600 mb-6">
            Hãy thử chọn một chuyên mục khác hoặc bỏ lọc để xem tất cả bài viết.
          </p>
          <button
            on:click={() => handleCategoryFilter("")}
            class="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300"
          >
            Bỏ lọc
          </button>
        {:else}
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            Chưa có bài viết
          </h3>
          <p class="text-gray-600 mb-6">
            Hãy chia sẻ hành trình đầu tiên của bạn hoặc thử điều chỉnh bộ lọc.
          </p>
          <button
            on:click={handleWritePost}
            class="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors duration-300"
          >
            Viết bài đầu tiên
          </button>
        {/if}
      </div>
    {:else}
      <!-- Posts Grid -->
      <div
        class="grid grid-cols-1 {viewMode === 'grid'
          ? 'md:grid-cols-2 lg:grid-cols-3'
          : ''} gap-6"
      >
        {#each filteredPosts as post}
          <div
            class="transform transition-all duration-300 hover:scale-102 {viewMode ===
            'list'
              ? 'max-w-none'
              : ''}"
          >
            <div class="relative group">
              <div
                class="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
              >
                {#if post.featured}
                  <div class="absolute top-4 left-4 z-20">
                    <span
                      class="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg"
                    >
                      Nổi bật
                    </span>
                  </div>
                {/if}
                <div class="absolute top-4 right-4 z-20">
                  <span
                    class="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full shadow-lg border border-gray-200"
                  >
                    {post.category}
                  </span>
                </div>
                <div class="relative h-48 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={`Ảnh bìa ${post.title}`}
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                  ></div>
                  <div class="absolute bottom-4 left-4 right-4">
                    <div class="flex items-center justify-between text-white">
                      <div class="flex items-center space-x-2">
                        <div class="w-4 h-4">
                          <IoIosPin />
                        </div>
                        <span class="text-sm font-medium">
                          {post.author}
                        </span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <div class="w-4 h-4">
                          <IoMdTime />
                        </div>
                        <span class="text-sm">{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="p-6 relative z-20">
                  <h3
                    class="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors duration-300 line-clamp-1"
                  >
                    {post.title}
                  </h3>
                  <p
                    class="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed"
                  >
                    {post.description}
                  </p>
                  <div
                    class="flex items-center justify-between mb-4 text-sm text-gray-500"
                  >
                    <div class="flex items-center space-x-4">
                      <span>{post.publishDateLabel}</span>
                      <div class="flex items-center space-x-1">
                        <div class="w-3 h-3">
                          <IoMdEye />
                        </div>
                        <span>{formatNumber(post.views)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      on:click={() => handleLike(post)}
                      class="relative z-10 flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors duration-200"
                    >
                      <div class="w-4 h-4">
                        <IoMdHeart />
                      </div>
                      <span class="font-medium">
                        {formatNumber(post.likes)}
                      </span>
                    </button>
                  </div>
                  <div class="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      on:click={() => handleReadMore(post)}
                      class="relative z-10 flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg"
                    >
                      <span class="font-medium">Đọc thêm</span>
                    </button>
                    <button
                      type="button"
                      on:click={() => handleDelete(post)}
                      class="relative z-10 flex-1 flex items-center justify-center px-6 py-3 bg-white border border-red-200 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors duration-300"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Results Summary -->
  {#if filteredPosts.length > 0}
    <div class="text-center text-gray-600">
      <p>Showing {filteredPosts.length} of {blogPosts.length} posts</p>
    </div>
  {/if}
</div>

{#if detailModalOpen && selectedPost}
  <div class="fixed inset-0 z-40 flex items-center justify-center px-4">
    <button
      type="button"
      class="absolute inset-0 bg-black/50 cursor-default"
      aria-label="Đóng chi tiết bài viết"
      on:click={closeDetailModal}
      on:keydown={(event) => event.key === "Enter" && closeDetailModal()}
    ></button>
    <div
      class="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8 space-y-6"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-teal-600 mb-2">
            {selectedPost.category}
          </div>
          <h2 class="text-2xl font-bold text-gray-800">
            {selectedPost.title}
          </h2>
        </div>
        <button
          class="text-gray-400 hover:text-gray-600"
          on:click={closeDetailModal}
        >
          ✕
        </button>
      </div>
      <div class="flex flex-wrap gap-4 text-sm text-gray-500">
        <span>By {selectedPost.author}</span>
        <span>• {selectedPost.readTime}</span>
        <span>• {selectedPost.publishDateLabel}</span>
        <span class="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold">
          {selectedPost.status}
        </span>
      </div>
      <div class="flex gap-6 text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-800"
            >{formatNumber(selectedPost.views)}</span
          >
          <span>views</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-800"
            >{formatNumber(selectedPost.likes)}</span
          >
          <span>likes</span>
        </div>
        <button
          type="button"
          class="ml-auto flex items-center gap-2 text-teal-600 hover:text-teal-700 hover:cursor-pointer"
          on:click={() => selectedPost && handleLike(selectedPost)}
        >
          <span>Yêu thích</span>
        </button>
      </div>
      <div class="text-gray-700 leading-relaxed whitespace-pre-line">
        {selectedPost.content}
      </div>
    </div>
  </div>
{/if}

{#if createModalOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center px-6">
    <button
      type="button"
      class="absolute inset-0 bg-black/40 cursor-default"
      aria-label="Đóng cửa sổ tạo bài"
      on:click={closeCreateModal}
      on:keydown={(event) => event.key === "Enter" && closeCreateModal()}
    ></button>
    <form
      class="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-10 space-y-6"
      on:submit|preventDefault={submitNewPost}
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Chia sẻ hành trình của bạn</p>
          <h3 class="text-2xl font-bold text-gray-800">Viết bài blog</h3>
        </div>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600"
          on:click={closeCreateModal}
        >
          ✕
        </button>
      </div>
      <div>
        <label
          class="text-sm font-medium text-gray-600 mb-1 block"
          for={createTitleId}>Tiêu đề</label
        >
        <input
          id={createTitleId}
          type="text"
          bind:value={createForm.title}
          class="w-full px-5 py-4 border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-200"
          placeholder="Ví dụ: Kinh nghiệm khám phá Sapa mùa mây"
        />
        {#if formErrors.title}
          <p class="text-sm text-red-500 mt-1">{formErrors.title}</p>
        {/if}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            class="text-sm font-medium text-gray-600 mb-1 block"
            for={createCategoryId}>Chuyên mục</label
          >
          <select
            id={createCategoryId}
            bind:value={createForm.category}
            class="w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-200"
          >
            <option value="" disabled>Chọn chuyên mục</option>
            {#each categories as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
          {#if formErrors.category}
            <p class="text-sm text-red-500 mt-1">
              {formErrors.category}
            </p>
          {/if}
        </div>
        <div
          class="hidden md:flex flex-col justify-center bg-gradient-to-br from-teal-50 via-white to-teal-100 border border-teal-100 rounded-xl p-4"
        >
          <h4 class="text-sm font-semibold text-teal-600 mb-1">Gợi ý</h4>
          <p class="text-xs text-gray-600">
            Chọn chuyên mục phù hợp giúp bài viết dễ dàng đến với người đọc có
            cùng sở thích.
          </p>
        </div>
      </div>
      <div>
        <label
          class="text-sm font-medium text-gray-600 mb-1 block"
          for={createContentId}>Nội dung</label
        >
        <textarea
          id={createContentId}
          rows="12"
          bind:value={createForm.content}
          class="w-full px-5 py-4 border rounded-xl text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500 border-gray-200"
          placeholder="Kể lại hành trình, mẹo di chuyển, điểm đến yêu thích..."
        ></textarea>
        {#if formErrors.content}
          <p class="text-sm text-red-500 mt-1">
            {formErrors.content}
          </p>
        {/if}
      </div>
      <div class="flex justify-between text-xs text-gray-400">
        <span>Tối thiểu 50 ký tự</span>
        <span>{createForm.content.trim().length} ký tự</span>
      </div>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
          on:click={closeCreateModal}
        >
          Huỷ
        </button>
        <button
          type="submit"
          class="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold hover:from-teal-600 hover:to-teal-700 disabled:opacity-60"
          disabled={isSubmittingPost}
        >
          {isSubmittingPost ? "Đang gửi..." : "Gửi bài"}
        </button>
      </div>
    </form>
  </div>
{/if}

<style>
  /* Custom styles for better animations */
  .hover\:scale-102:hover {
    transform: scale(1.02);
  }

  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
