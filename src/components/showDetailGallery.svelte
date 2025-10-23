<script lang="ts">
  import { onMount, tick } from "svelte";
  import { createEventDispatcher } from "svelte";
  import FaTimes from "svelte-icons/fa/FaTimes.svelte";
  import FaChevronLeft from "svelte-icons/fa/FaChevronLeft.svelte";
  import FaChevronRight from "svelte-icons/fa/FaChevronRight.svelte";
  import { fly } from "svelte/transition";

  export let galleryId: string;
  export let userId: string;
  export let isOpen: boolean = false;

  const dispatch = createEventDispatcher();

  let photos: Array<{
    id: string;
    userId?: string;
    tripId?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    imageUrl?: string;
    caption?: string;
    location?: string;
    likeCount?: number;
    takenAt?: string;
    uploadedAt?: string;
    isPublic?: boolean;
  }> = [];
  let currentIndex = 0;
  // direction: 1 means incoming from right (next), -1 incoming from left (prev)
  let direction = 1;
  // previous index used for overlapping slide animation
  let prevIndex: number | null = null;
  // when true, triggers the CSS transform to animate
  let animate = false;
  // prevent rapid interactions during animation
  let animating = false;
  const SLIDE_MS = 2000;

  // preload image helper with timeout fallback
  function loadImage(url: string, timeout = 1000) {
    return new Promise<void>((resolve) => {
      if (!url) return resolve();
      const img = new Image();
      let done = false;
      const t = setTimeout(() => {
        if (!done) {
          done = true;
          resolve();
        }
      }, timeout);
      img.onload = () => {
        if (!done) {
          done = true;
          clearTimeout(t);
          resolve();
        }
      };
      img.onerror = () => {
        if (!done) {
          done = true;
          clearTimeout(t);
          resolve();
        }
      };
      img.src = url;
    });
  }
  let isLoading = true;
  let error: string | null = null;
  let dialogRef: HTMLDivElement | null = null;

  function formatDate(s?: string) {
    if (!s) return "";
    try {
      return new Date(s).toLocaleString();
    } catch (e) {
      return s;
    }
  }

  // Helper to get JWT token from cookies
  function getAccessToken(): string | null {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    if (!tokenCookie) return null;
    return tokenCookie.split("=")[1];
  }

  // Fetch photos for the gallery
  async function fetchGalleryPhotos() {
    isLoading = true;
    error = null;
    const token = getAccessToken();

    if (!token || !userId || !galleryId) {
      error = "Missing authentication or gallery ID";
      isLoading = false;
      return;
    }

    try {
      const apiUrl = `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/api/gallery/user/${userId}/trip/${galleryId}`;
      console.log(`[Gallery Detail API] Fetching photos from: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`[Gallery Detail API] Response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log(
          `[Gallery Detail API] Fetched ${data.length} photos:`,
          data
        );

        // Transform API response to photo format (uses fileUrl & thumbnailUrl from backend)
        photos = data.map((item: any) => ({
          id: item.id || item.photoId || item.uuid || "",
          userId: item.userId || item.user_id,
          tripId: item.tripId || item.trip_id || item.tripId,
          fileUrl:
            item.fileUrl ||
            item.file_url ||
            item.fileUrl ||
            item.imageUrl ||
            item.url,
          thumbnailUrl:
            item.thumbnailUrl || item.thumbnail_url || item.thumbnailUrl,
          imageUrl: item.imageUrl || item.url,
          caption: item.caption || "",
          location: item.location || "",
          likeCount: item.likeCount || item.likes || 0,
          takenAt: item.takenAt || item.taken_at,
          uploadedAt: item.uploadedAt || item.uploaded_at,
          isPublic: item.isPublic || item.is_public || false,
        }));
      } else {
        const errorText = await response.text();
        console.error(
          `[Gallery Detail API] Failed to fetch photos:`,
          errorText
        );
        error = "Failed to load gallery photos";
      }
    } catch (err) {
      console.error("[Gallery Detail API] Error fetching photos:", err);
      error = "Error loading gallery photos";
    } finally {
      isLoading = false;
    }
  }

  // Reset state when galleryId changes
  $: if (galleryId && userId && isOpen) {
    currentIndex = 0;
    fetchGalleryPhotos();
  }

  function nextPhoto() {
    if (currentIndex < photos.length - 1) {
      direction = 1;
      goToIndex(currentIndex + 1);
    }
  }

  function prevPhoto() {
    if (currentIndex > 0) {
      direction = -1;
      goToIndex(currentIndex - 1);
    }
  }

  async function goToIndex(newIndex: number) {
    if (newIndex === currentIndex) return;
    if (animating) return;
    animating = true;
    prevIndex = currentIndex;
    direction = newIndex > currentIndex ? 1 : -1;
    const nextUrl =
      photos[newIndex]?.fileUrl ||
      photos[newIndex]?.imageUrl ||
      photos[newIndex]?.thumbnailUrl ||
      "";
    // preload the next image (short timeout fallback)
    await loadImage(nextUrl, 1200);
    currentIndex = newIndex;
    animate = false;
    await tick();
    // start animation
    animate = true;
    // clear prev after animation ends
    setTimeout(() => {
      prevIndex = null;
      animate = false;
      animating = false;
    }, SLIDE_MS + 20);
  }

  function close() {
    dispatch("close");
  }

  function handleBackdropKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      close();
    }
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) return;
    switch (event.key) {
      case "ArrowLeft":
        prevPhoto();
        break;
      case "ArrowRight":
        nextPhoto();
        break;
      case "Escape":
        close();
        break;
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });

  // Focus the dialog for accessibility when opened
  $: if (isOpen && dialogRef) {
    // small timeout to wait for DOM
    setTimeout(() => dialogRef?.focus(), 0);
  }
</script>

{#if isOpen}
  <!-- Modal Backdrop -->
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    on:click={close}
    on:keydown={handleBackdropKeydown}
    role="presentation"
    tabindex="-1"
  >
    <!-- Modal Content: white panel similar to uploadScreen -->
    <div
      class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative"
      role="dialog"
      aria-modal="true"
      tabindex="0"
      bind:this={dialogRef}
      on:click|stopPropagation
      on:keydown={(e) => e.key === "Escape" && close()}
    >
      <!-- Main layout: large image left, details panel right -->
      <div class="flex h-[80vh]">
        <!-- Left: Image area -->
        <!-- Changed bg to white and image to object-cover so the image fills the panel (removes black bars). This will crop images — if you prefer no cropping, revert to object-contain and a black background. -->
        <div class="flex-1 bg-white flex items-center justify-center relative">
          {#if isLoading}
            <div class="text-center text-white">
              <div
                class="inline-block animate-spin rounded-full h-12 w-12 border-4"
                style="border-color: #0d9488; border-top-color: transparent;"
              ></div>
              <p>Đang tải ảnh...</p>
            </div>
          {:else if error}
            <div class="text-center text-white p-6">{error}</div>
          {:else if photos.length === 0}
            <div class="text-center text-white p-6">Không có ảnh</div>
          {:else}
            <div class="w-full h-full relative overflow-hidden">
              {#if prevIndex !== null}
                <img
                  src={photos[prevIndex].fileUrl ||
                    photos[prevIndex].imageUrl ||
                    photos[prevIndex].thumbnailUrl}
                  alt={photos[prevIndex].caption || "Gallery photo"}
                  class="absolute top-0 left-0 w-full h-full object-cover"
                  style={animate
                    ? `transform: translate3d(${-direction * 100}%,0,0); opacity:1; max-height:80vh; transition: transform ${SLIDE_MS}ms cubic-bezier(.22,.1,.12,1), opacity ${SLIDE_MS}ms linear; will-change: transform; pointer-events:none;`
                    : `transform: translate3d(0%,0,0); opacity:1; max-height:80vh; transition: transform ${SLIDE_MS}ms cubic-bezier(.22,.1,.12,1), opacity ${SLIDE_MS}ms linear; will-change: transform; pointer-events:none;`}
                />
              {/if}

              <img
                src={photos[currentIndex].fileUrl ||
                  photos[currentIndex].imageUrl ||
                  photos[currentIndex].thumbnailUrl}
                alt={photos[currentIndex].caption || "Gallery photo"}
                class="absolute top-0 left-0 w-full h-full object-cover"
                style={animate || prevIndex === null
                  ? `transform: translate3d(0%,0,0); opacity:1; max-height:80vh; transition: transform ${SLIDE_MS}ms cubic-bezier(.22,.1,.12,1), opacity ${SLIDE_MS}ms linear; will-change: transform; pointer-events:auto;`
                  : `transform: translate3d(${direction * 100}%,0,0); opacity:1; max-height:80vh; transition: transform ${SLIDE_MS}ms cubic-bezier(.22,.1,.12,1), opacity ${SLIDE_MS}ms linear; will-change: transform; pointer-events:auto;`}
              />
            </div>

            <!-- nav arrows -->
            {#if photos.length > 1}
              <button
                on:click={() => {
                  if (!animating) prevPhoto();
                }}
                disabled={currentIndex === 0 || animating}
                class="absolute left-6 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 disabled:opacity-50"
                aria-label="Previous"
              >
                <div class="w-5 h-5 text-white"><FaChevronLeft /></div>
              </button>
              <button
                on:click={() => {
                  if (!animating) nextPhoto();
                }}
                disabled={currentIndex === photos.length - 1 || animating}
                class="absolute right-6 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 disabled:opacity-50"
                aria-label="Next"
              >
                <div class="w-5 h-5 text-white"><FaChevronRight /></div>
              </button>
            {/if}

            <!-- inline thumbnail indicators (dots) -->
            {#if photos.length > 1}
              <div
                class="absolute bottom-6 left-1/2 -translate-x-1/2 w-auto flex items-center justify-center"
              >
                <div class="flex items-center gap-3 px-2 py-1">
                  {#each photos as _, i}
                    <button
                      on:click={() => goToIndex(i)}
                      aria-label={`Go to photo ${i + 1}`}
                      class="rounded-full p-0 flex items-center justify-center"
                      style={i === currentIndex
                        ? "width:16px; height:16px; background: white; border-radius:9999px; box-shadow: 0 0 0 2px rgba(13,148,136,0.12);"
                        : "width:12px; height:12px; background: rgba(255,255,255,0.9); border-radius:9999px; border: 1px solid rgba(0,0,0,0.06);"}
                    >
                      {#if i === currentIndex}
                        <span
                          style="width:8px; height:8px; background:#0D9488; border-radius:9999px; display:block;"
                        ></span>
                      {/if}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          {/if}
        </div>

        <!-- Right: Details panel -->
        <div class="w-96 bg-white text-gray-900 overflow-y-auto">
          <div
            class="p-4 border-b flex items-center justify-between"
            style="border-color: rgba(13,148,136,0.08);"
          >
            <div>
              <p class="font-semibold text-gray-900">
                {photos[currentIndex]?.caption || "Kho ảnh"}
              </p>
              {#if photos[currentIndex]?.location}
                <p class="text-sm text-slate-500">
                  {photos[currentIndex].location}
                </p>
              {/if}
            </div>
            <div class="flex items-center gap-2">
              <button
                on:click={close}
                aria-label="Đóng"
                title="Đóng"
                class="w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#0D9488] bg-white text-[#0D9488] shadow-sm hover:bg-[#0D9488] hover:text-white transform transition duration-200 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
              >
                <FaTimes class="w-3 h-3" />
              </button>
            </div>
          </div>

          <div class="p-4 space-y-4">
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-full bg-[#0D9488] flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  ><path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM4 20v-1c0-2.21 3.58-4 8-4s8 1.79 8 4v1H4z"
                  /></svg
                >
              </div>
              <div>
                <p class="font-semibold text-gray-900">Người dùng</p>
                <p class="text-sm text-slate-500">
                  {photos[currentIndex]?.userId || ""}
                </p>
              </div>
            </div>

            <div class="text-sm text-gray-700">
              <p>{photos[currentIndex]?.caption}</p>
              {#if photos[currentIndex]?.takenAt}
                <p class="mt-2 text-xs text-gray-500">
                  Taken: {formatDate(photos[currentIndex]?.takenAt)}
                </p>
              {/if}
              {#if photos[currentIndex]?.uploadedAt}
                <p class="mt-1 text-xs text-gray-500">
                  Uploaded: {formatDate(photos[currentIndex]?.uploadedAt)}
                </p>
              {/if}
            </div>

            <!-- Thumbnail grid removed as requested -->
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
