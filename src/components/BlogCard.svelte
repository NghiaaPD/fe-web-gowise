<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IoIosPin from "svelte-icons/io/IoIosPin.svelte";
  import IoMdTime from "svelte-icons/io/IoMdTime.svelte";
  import IoMdHeart from "svelte-icons/io/IoMdHeart.svelte";
  import IoMdEye from "svelte-icons/io/IoMdEye.svelte";

  const dispatch = createEventDispatcher();

  export let title: string = "Ultimate Guide to Tokyo Street Food";
  export let description: string =
    "Discover the best street food experiences in Tokyo, from ramen alleys to conveyor belt sushi...";
  export let author: string = "Sarah Johnson";
  export let readTime: string = "5 min read";
  export let publishDate: string = "1/25/2024";
  export let likes: number = 234;
  export let views: number = 1543;
  export let imageUrl: string = "/static/tokyo-street-food.jpg";
  export let category: string = "Food & Culture";
  export let featured: boolean = false;

  function handleReadMore() {
    dispatch("readMore", {
      title,
      description,
      author,
      readTime,
      publishDate,
      likes,
      views,
      imageUrl,
      category,
      featured,
    });
  }

  function handleLike() {
    likes += 1;
    dispatch("like", {
      title,
      likes,
    });
  }

  function formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  }
</script>

<div class="relative group">
  <!-- Main Card Container -->
  <div
    class="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
  >
    <!-- Featured Badge -->
    {#if featured}
      <div class="absolute top-4 left-4 z-20">
        <span
          class="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg"
        >
          Nổi bật
        </span>
      </div>
    {/if}

    <!-- Category Badge -->
    <div class="absolute top-4 right-4 z-20">
      <span
        class="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full shadow-lg border border-gray-200"
      >
        {category}
      </span>
    </div>

    <!-- Image Section -->
    <div class="relative h-48 overflow-hidden">
      <div
        class="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"
      ></div>
      <!-- Placeholder for actual image -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
      ></div>

      <!-- Image overlay content -->
      <div class="absolute bottom-4 left-4 right-4">
        <div class="flex items-center justify-between text-white">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4">
              <IoIosPin />
            </div>
            <span class="text-sm font-medium">{author}</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4">
              <IoMdTime />
            </div>
            <span class="text-sm">{readTime}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-6 relative z-20">
      <!-- Title -->
      <h3
        class="text-xl font-bold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors duration-300 line-clamp-2"
      >
        {title}
      </h3>

      <!-- Description -->
      <p class="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
        {description}
      </p>

      <!-- Meta Information -->
      <div class="flex items-center justify-between mb-4 text-sm text-gray-500">
        <div class="flex items-center space-x-4">
          <!-- Publish Date -->
          <span>{publishDate}</span>

          <!-- Views -->
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3">
              <IoMdEye />
            </div>
            <span>{formatNumber(views)}</span>
          </div>
        </div>

        <!-- Likes -->
        <button
          on:click={handleLike}
          class="relative z-10 flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors duration-200"
          style="pointer-events: auto;"
        >
          <div class="w-4 h-4">
            <IoMdHeart />
          </div>
          <span class="font-medium">{formatNumber(likes)}</span>
        </button>
      </div>

      <!-- Action Button -->
      <button
        on:click={handleReadMore}
        class="relative z-10 w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg group/button"
        style="pointer-events: auto;"
      >
        <span class="font-medium">Đọc thêm</span>
      </button>
    </div>

    <!-- Hover Glow Effect - DISABLED -->
    <!-- <div
            class="absolute inset-0 bg-gradient-to-r from-teal-400/10 via-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
        ></div> -->
  </div>
</div>

<style>
  /* Line clamp utilities */
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

  /* Ensure buttons are always clickable */
  button {
    position: relative;
    z-index: 10;
    pointer-events: auto;
  }
</style>
