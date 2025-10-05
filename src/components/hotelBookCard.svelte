<script lang="ts">
  interface HotelImage {
    thumbnail: string;
    original_image: string;
  }

  interface MainImage {
    thumbnail: string;
    original_image: string;
  }

  interface Hotel {
    name: string;
    type: string;
    price: string;
    price_value: number;
    currency: string;
    rating: number;
    rating_count: number;
    distance: string;
    neighborhood: string;
    address: string;
    score: number;
    main_image: MainImage;
    images: HotelImage[];
    amenities: string[];
    hotel_class: string;
    description: string;
    link: string;
  }

  interface Props {
    hotel: Hotel;
    onSelect?: (hotel: Hotel) => void;
  }

  let { hotel, onSelect = () => {} }: Props = $props();

  function handleSelect() {
    onSelect(hotel);
  }

  function generateStars(rating: number): Array<boolean> {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  // Get additional images for preview
  const previewImages = hotel.images.slice(0, 3);
  const hasMoreImages = hotel.images.length > 3;
</script>

<div
  class="bg-white rounded-xl shadow-md border border-gray-200 cursor-pointer transition-all duration-300 mb-4 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
  onclick={handleSelect}
  onkeydown={(e) => e.key === "Enter" && handleSelect()}
  role="button"
  tabindex="0"
>
  <!-- Hotel Image -->
  <div class="relative h-48 overflow-hidden">
    <img
      src={hotel.main_image.original_image}
      alt={hotel.name}
      class="w-full h-full object-cover"
    />

    <!-- Image Preview Strip -->
    {#if previewImages.length > 0}
      <div class="absolute bottom-2 right-2 flex gap-1">
        {#each previewImages as image, index}
          <div class="w-8 h-8 rounded overflow-hidden border border-white/50">
            <img
              src={image.thumbnail}
              alt={`${hotel.name} image ${index + 1}`}
              class="w-full h-full object-cover"
            />
          </div>
        {/each}
        {#if hasMoreImages}
          <div
            class="w-8 h-8 rounded bg-black/60 border border-white/50 flex items-center justify-center"
          >
            <span class="text-white text-xs font-medium"
              >+{hotel.images.length - 3}</span
            >
          </div>
        {/if}
      </div>
    {/if}

    <!-- Hotel Type Badge -->
    <div class="absolute top-2 left-2">
      <span
        class="bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded capitalize"
      >
        {hotel.type}
      </span>
    </div>
  </div>

  <!-- Hotel Details -->
  <div class="p-4">
    <!-- Hotel Name and Rating -->
    <div class="mb-3">
      <h3 class="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
        {hotel.name}
      </h3>

      <!-- Rating Stars -->
      <div class="flex items-center gap-2 mb-1">
        <div class="flex items-center">
          {#each generateStars(hotel.rating) as filled}
            <svg
              class="w-4 h-4 {filled ? 'text-yellow-400' : 'text-gray-300'}"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          {/each}
        </div>
        <span class="text-sm text-gray-600">
          {hotel.rating} ({hotel.rating_count} reviews)
        </span>
      </div>

      <!-- Location Info -->
      {#if hotel.neighborhood || hotel.address}
        <div class="text-sm text-gray-500">
          {#if hotel.neighborhood}
            <span>{hotel.neighborhood}</span>
          {/if}
          {#if hotel.address}
            <span class="hotel-address">{hotel.address}</span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Amenities -->
    {#if hotel.amenities && hotel.amenities.length > 0}
      <div class="mb-3">
        <div class="flex flex-wrap gap-1">
          {#each hotel.amenities.slice(0, 3) as amenity}
            <span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {amenity}
            </span>
          {/each}
          {#if hotel.amenities.length > 3}
            <span class="text-gray-500 text-xs">
              +{hotel.amenities.length - 3} more
            </span>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Price and Booking -->
    <div class="flex items-end justify-between">
      <div class="flex flex-col">
        {#if hotel.hotel_class}
          <span class="text-xs text-gray-500 mb-1">{hotel.hotel_class}</span>
        {/if}
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-bold text-gray-900">{hotel.price}</span>
          <span class="text-sm text-gray-600">per night</span>
        </div>
      </div>

      <button
        class="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        onclick={(e) => {
          e.stopPropagation();
          window.open(hotel.link, "_blank");
        }}
      >
        Book Now
      </button>
    </div>
  </div>
</div>

<style>
  /* Line clamp utility for hotel name */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Hide address on mobile */
  @media (max-width: 480px) {
    .hotel-address {
      display: none !important;
    }
  }
</style>
