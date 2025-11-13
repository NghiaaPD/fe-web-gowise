<script lang="ts">
  export let imageUrl: string = "";
  export let caption: string = "";
  export let location: string = "";
  export let photoCount: number | undefined = undefined;
  export let totalLikes: number | undefined = undefined;
  export let onDelete: ((event: MouseEvent) => void) | undefined = undefined;
</script>

<div
  class="relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group"
>
  <!-- Image -->
  <img
    src={imageUrl}
    alt={caption || "Gallery image"}
    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
  />

  <!-- Delete button (top right, visible on hover) -->
  <button
    onclick={(e) => {
      e.stopPropagation();
      onDelete?.(e);
    }}
    class="absolute top-3 right-3 w-8 h-8 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center z-20 shadow-lg"
    aria-label="Xóa bộ sưu tập"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  </button>

  <!-- Photo count badge (always visible) -->
  {#if photoCount !== undefined}
    <div
      class="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
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
      {photoCount}
    </div>
  {/if}

  <!-- Total likes badge (always visible, bottom left) -->
  {#if totalLikes !== undefined}
    <div
      class="absolute top-3 left-3 bg-red-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
      >
        <path
          d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
        />
      </svg>
      {totalLikes}
    </div>
  {/if}

  <!-- Overlay with caption and location (appears on hover) -->
  {#if caption || location}
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
    >
      {#if caption}
        <h3 class="text-white font-semibold text-sm mb-1 line-clamp-2">
          {caption}
        </h3>
      {/if}
      {#if location}
        <p class="text-white/80 text-xs flex items-center gap-1">
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
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {location}
        </p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
