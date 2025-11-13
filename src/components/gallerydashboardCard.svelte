<script lang="ts">
  import { onMount } from "svelte";

  interface Gallery {
    galleryId: string;
    thumbnailUrl: string;
    photoCount: number;
    totalLikes: number;
  }

  interface Photo {
    photoId: string;
    photoUrl: string;
  }

  let { gallery, friendId }: { gallery: Gallery; friendId: string } = $props();

  let photos = $state<Photo[]>([]);
  let currentPhotoIndex = $state(0);
  let isLoadingPhotos = $state(false);

  function getAccessToken(): string | null {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    if (!tokenCookie) return null;
    return tokenCookie.split("=")[1];
  }

  async function fetchGalleryPhotos() {
    isLoadingPhotos = true;
    const token = getAccessToken();

    if (!token || !friendId) {
      isLoadingPhotos = false;
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/api/gallery/user/${friendId}/trip/${gallery.galleryId}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        photos = data.map((item: any) => ({
          photoId: item.id || item.photoId || item.uuid || "",
          photoUrl: item.fileUrl || item.imageUrl || item.thumbnailUrl || "",
        }));
        console.log(
          `📸 Gallery ${gallery.galleryId} has ${photos.length} photos:`,
          photos
        );
      } else {
        console.error("Failed to fetch photos, status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
    } finally {
      isLoadingPhotos = false;
    }
  }

  onMount(() => {
    fetchGalleryPhotos();
  });

  function nextPhoto(e: Event) {
    e.stopPropagation();
    if (currentPhotoIndex < photos.length - 1) {
      currentPhotoIndex++;
    }
  }

  function prevPhoto(e: Event) {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      currentPhotoIndex--;
    }
  }

  let currentPhoto = $derived(
    photos.length > 0 ? photos[currentPhotoIndex] : null
  );
</script>

<div>
  <!-- Gallery Carousel Post -->
  <div class="relative w-full overflow-hidden rounded-lg group">
    {#if isLoadingPhotos}
      <div
        class="w-full h-[500px] bg-gray-100 flex items-center justify-center"
      >
        <div
          class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"
        ></div>
      </div>
    {:else}
      <img
        src={currentPhoto ? currentPhoto.photoUrl : gallery.thumbnailUrl}
        alt="Gallery"
        class="w-full max-h-[500px] object-cover"
      />

      <!-- Navigation Arrows -->
      {#if photos.length > 1}
        <!-- Previous Button -->
        <button
          onclick={prevPhoto}
          disabled={currentPhotoIndex === 0}
          aria-label="Ảnh trước"
          class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed z-10"
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
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <!-- Next Button -->
        <button
          onclick={nextPhoto}
          disabled={currentPhotoIndex === photos.length - 1}
          aria-label="Ảnh tiếp theo"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed z-10"
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
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <!-- Photo Counter -->
        <div
          class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs"
        >
          {currentPhotoIndex + 1} / {photos.length}
        </div>
      {/if}
    {/if}

    <!-- Photo count badge -->
    <div
      class="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-1.5"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      {gallery.photoCount}
    </div>
  </div>

  <!-- Likes Count Section (Facebook style) -->
  <div class="pt-3 pb-2 border-t border-gray-100 mt-2">
    <div class="flex items-center gap-2">
      <button
        class="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
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
        >
          <path
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          />
        </svg>
        <span class="text-sm font-medium">{gallery.totalLikes}</span>
      </button>
      <span class="text-gray-400 text-xs">{gallery.photoCount} ảnh</span>
    </div>
  </div>
</div>
