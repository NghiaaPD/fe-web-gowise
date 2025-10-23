<script lang="ts">
  import { onMount } from "svelte";
  import FundCard from "../components/GalleryCard.svelte";
  import UploadScreen from "../components/uploadScreen.svelte";
  import ShowDetailGallery from "../components/showDetailGallery.svelte";
  import FaSearch from "svelte-icons/fa/FaSearch.svelte";
  import FaPlus from "svelte-icons/fa/FaPlus.svelte";
  import FaFilter from "svelte-icons/fa/FaFilter.svelte";
  import FaPencilAlt from "svelte-icons/fa/FaPencilAlt.svelte";
  import FaImages from "svelte-icons/fa/FaImages.svelte";
  import IoMdGrid from "svelte-icons/io/IoMdGrid.svelte";
  import IoMdList from "svelte-icons/io/IoMdList.svelte";
  import IoMdCash from "svelte-icons/io/IoMdCash.svelte";
  import IoMdPeople from "svelte-icons/io/IoMdPeople.svelte";

  // Show/hide upload screen
  let showUploadScreen = false;
  let showDetailGallery = false;
  let selectedGalleryId = "";
  let isLoading = true;

  // Gallery data
  let galleries: Array<{
    id: string;
    imageUrl: string;
    caption: string;
    location: string;
    photoCount?: number;
    totalLikes?: number;
  }> = [];

  // Helper to get JWT token from cookies
  function getAccessToken(): string | null {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    if (!tokenCookie) return null;
    return tokenCookie.split("=")[1];
  }

  // Helper to get userId from JWT token
  function getUserIdFromToken(): string | null {
    const token = getAccessToken();
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      const tokenData = JSON.parse(decoded);
      console.log("[Gallery API] Decoded token data:", tokenData);
      const userId =
        tokenData?.user_id || tokenData?.id || tokenData?.sub || null;
      console.log("[Gallery API] Extracted userId:", userId);
      return userId;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  // Fetch galleries from API
  async function fetchGalleries() {
    isLoading = true;
    const token = getAccessToken();
    const userId = getUserIdFromToken();

    if (!token || !userId) {
      console.error("No authentication token or userId found");
      isLoading = false;
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/api/gallery/user/${userId}/galleries`;
      console.log(`[Gallery API] Fetching galleries from: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`[Gallery API] Response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`[Gallery API] Fetched ${data.length} galleries:`, data);

        // Transform API response to gallery format
        galleries = data.map((item: any) => ({
          id: item.galleryId,
          imageUrl: item.thumbnailUrl,
          caption: `Bộ sưu tập ${item.photoCount} ảnh`,
          location: "",
          photoCount: item.photoCount,
          totalLikes: item.totalLikes,
        }));
      } else {
        const error = await response.text();
        console.error(`[Gallery API] Failed to fetch galleries:`, error);
      }
    } catch (error) {
      console.error("[Gallery API] Error fetching galleries:", error);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    fetchGalleries();
  });

  // Filter and search state
  let searchQuery = "";

  // Computed filtered galleries
  $: filteredGalleries = galleries.filter((gallery) => {
    const matchesSearch =
      gallery.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gallery.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Statistics
  $: stats = {
    total: galleries.length,
    filtered: filteredGalleries.length,
  };

  function handleCreateFund() {
    showUploadScreen = true;
  }

  function handleUpload(event: CustomEvent) {
    console.log("Upload completed:", event.detail);
    if (event.detail.success) {
      console.log(`✅ Successfully uploaded ${event.detail.count} photos`);
      // Refresh gallery list after successful upload
      fetchGalleries();
    }
    // Modal will close itself after successful upload
  }

  function handleCloseUpload() {
    showUploadScreen = false;
  }

  function handleCloseDetailGallery() {
    showDetailGallery = false;
    selectedGalleryId = "";
  }

  function handleGalleryClick(gallery: any) {
    console.log("Gallery clicked:", gallery);
    selectedGalleryId = gallery.id;
    showDetailGallery = true;
  }
</script>

<div class="p-6 bg-gray-50 min-h-screen {showUploadScreen ? 'blur-sm' : ''}">
  <!-- Header Section -->
  <div class="mb-8">
    <div
      class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
    >
      <!-- Title and Description -->
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Kho kỉ niệm</h1>
        <p class="text-gray-600">
          Lưu giữ và chia sẻ những khoảnh khắc đáng nhớ �
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          on:click={handleCreateFund}
          class="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
        >
          <div class="w-4 h-4">
            <FaPlus />
          </div>
          <span class="font-medium">Tạo Kho Ảnh</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Statistics Cards -->
  <div class="grid grid-cols-2 gap-4 mb-8">
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Tổng số ảnh</p>
          <p class="text-2xl font-bold text-gray-800">
            {stats.total}
          </p>
        </div>
        <div
          class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center"
        >
          <div class="w-5 h-5 text-teal-600">
            <FaImages />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">Đang hiển thị</p>
          <p class="text-2xl font-bold text-blue-600">
            {stats.filtered}
          </p>
        </div>
        <div
          class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
        >
          <div class="w-5 h-5 text-blue-600">
            <FaSearch />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Gallery Grid -->
  <div class="mb-8">
    {#if isLoading}
      <!-- Loading State -->
      <div class="text-center py-16">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"
        ></div>
        <p class="text-gray-600">Đang tải kho ảnh...</p>
      </div>
    {:else if filteredGalleries.length === 0}
      <!-- Empty State -->
      <div class="text-center py-16">
        <div
          class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <div class="w-12 h-12 text-gray-400">
            <FaImages />
          </div>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          Chưa có ảnh nào
        </h3>
        <p class="text-gray-600 mb-6">
          Hãy tải lên những khoảnh khắc đáng nhớ của bạn.
        </p>
        <button
          on:click={handleCreateFund}
          class="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors duration-300"
        >
          Tải ảnh đầu tiên
        </button>
      </div>
    {:else}
      <!-- Gallery Grid - Masonry style -->
      <div
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
      >
        {#each filteredGalleries as gallery}
          <div
            on:click={() => handleGalleryClick(gallery)}
            on:keydown={(e) => e.key === "Enter" && handleGalleryClick(gallery)}
            role="button"
            tabindex="0"
          >
            <FundCard
              imageUrl={gallery.imageUrl}
              caption={gallery.caption}
              location={gallery.location}
              photoCount={gallery.photoCount}
              totalLikes={gallery.totalLikes}
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Results Summary -->
  {#if filteredGalleries.length > 0}
    <div class="text-center text-gray-600">
      <p>
        Hiển thị {filteredGalleries.length} trong tổng số {galleries.length} ảnh
      </p>
    </div>
  {/if}
</div>

<!-- Detail Gallery Modal -->
{#if showDetailGallery}
  <ShowDetailGallery
    galleryId={selectedGalleryId}
    userId={getUserIdFromToken() || ""}
    isOpen={showDetailGallery}
    on:close={handleCloseDetailGallery}
  />
{/if}

<!-- Upload Screen Modal -->
{#if showUploadScreen}
  <UploadScreen on:close={handleCloseUpload} on:upload={handleUpload} />
{/if}
