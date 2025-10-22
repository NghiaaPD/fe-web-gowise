<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import FaArrowLeft from "svelte-icons/fa/FaArrowLeft.svelte";
  import FaCalendarAlt from "svelte-icons/fa/FaCalendarAlt.svelte";
  import FaDollarSign from "svelte-icons/fa/FaDollarSign.svelte";
  import FaMapMarkerAlt from "svelte-icons/fa/FaMapMarkerAlt.svelte";
  import FaUsers from "svelte-icons/fa/FaUsers.svelte";
  import FaStar from "svelte-icons/fa/FaStar.svelte";
  import IoMdTime from "svelte-icons/io/IoMdTime.svelte";
  import FaBed from "svelte-icons/fa/FaBed.svelte";
  import FaUtensils from "svelte-icons/fa/FaUtensils.svelte";
  import FlightTicketCard from "./flightTicketCard.svelte";

  const dispatch = createEventDispatcher();

  // plan prop: expects the full plan object, with plan_content and transformed fields
  export let plan: any = {};

  // Defensive: extract plan_content, merge with itinerary_data and root fields if needed
  $: planContent = (() => {
    let content = { ...(plan.plan_content || {}) };
    // Merge itinerary_data if present
    if (plan.itinerary_data && typeof plan.itinerary_data === "object") {
      content = { ...plan.itinerary_data, ...content };
    }
    // Merge root-level fields if not present in content
    const mergeFields = [
      "flightOptions",
      "hotelOptions",
      "itineraryDays",
      "selectedInterests",
      "participants",
      "userLocation",
      "flightData",
      "hotelData",
      "itineraryData",
      "budget",
      "destination",
      "startDate",
      "endDate",
      "plan_id",
      "travelType",
    ];
    for (const key of mergeFields) {
      if (plan[key] !== undefined && content[key] === undefined) {
        content[key] = plan[key];
      }
    }
    return content;
  })();
  $: title = plan.title || planContent.destination || "Unknown Plan";
  $: location = plan.location || planContent.destination || "Unknown";
  $: duration =
    plan.duration ||
    (() => {
      const s = planContent.startDate || planContent.start_date;
      const e = planContent.endDate || planContent.end_date;
      if (s && e) {
        return `${Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24))} days`;
      }
      return "Unknown";
    })();
  $: budget =
    plan.budget || (planContent.budget ? `$${planContent.budget}` : "$0");
  $: created = plan.created || plan.created_at || "";
  $: status = plan.status || "active";
  $: description =
    plan.description ||
    `Travel plan for ${planContent.participants || "1"} ${planContent.participants === "1" ? "person" : "people"} to ${planContent.destination || "destination"}`;

  // Flight, hotel, itinerary, interests (single declaration each, with fallback logic)
  $: flightOptions = (() => {
    let fo = planContent.flightOptions || [];
    if (!Array.isArray(fo)) return [];
    return fo;
  })();

  // Extract top 1 flight from flightData if available
  $: topFlight = (() => {
    const fd = planContent.flightData;
    if (
      fd &&
      typeof fd === "object" &&
      fd.top_1 &&
      Array.isArray(fd.top_1) &&
      fd.top_1.length > 0
    ) {
      return fd.top_1[0].flight;
    }
    // fallback: use first flightOption if available
    if (flightOptions.length > 0) return flightOptions[0];
    return null;
  })();

  import HotelBookCard from "./hotelBookCard.svelte";
  $: hotelOptions = (() => {
    let ho = planContent.hotelOptions || [];
    if (!Array.isArray(ho)) return [];
    return ho;
  })();

  // Extract top 1 hotel from hotelData if available
  $: topHotel = (() => {
    const hd = planContent.hotelData;
    if (
      hd &&
      typeof hd === "object" &&
      hd.top_1 &&
      Array.isArray(hd.top_1) &&
      hd.top_1.length > 0
    ) {
      // Some APIs may wrap hotel in { hotel: {...} }, some may not
      return hd.top_1[0].hotel || hd.top_1[0];
    }
    // fallback: use first hotelOption if available
    if (hotelOptions.length > 0) return hotelOptions[0];
    return null;
  })();
  $: itineraryDays = (() => {
    let it = planContent.itineraryDays || [];
    if (Array.isArray(it)) return it;
    if (it && typeof it === "object") {
      return Object.entries(it)
        .filter(([key]) => key.startsWith("day_"))
        .map(([key, value]) => ({
          dayNumber: parseInt(key.split("_")[1]),
          dayData: value,
        }))
        .sort((a, b) => a.dayNumber - b.dayNumber);
    }
    // Fallback: try to extract from planContent.itineraryData?.data?.itinerary
    if (
      planContent.itineraryData &&
      planContent.itineraryData.data &&
      planContent.itineraryData.data.itinerary
    ) {
      return Object.entries(planContent.itineraryData.data.itinerary)
        .filter(([key]) => key.startsWith("day_"))
        .map(([key, value]) => ({
          dayNumber: parseInt(key.split("_")[1]),
          dayData: value,
        }))
        .sort((a, b) => a.dayNumber - b.dayNumber);
    }
    return [];
  })();
  $: selectedInterests = planContent.selectedInterests || [];
  $: participants = planContent.participants || "1";

  // Calculate pricing
  $: flightPrice = flightOptions[0]?.price_value || 0;
  $: hotelPrice = hotelOptions[0]?.price_value || 0;
  $: tripDuration = (() => {
    const s = planContent.startDate || planContent.start_date;
    const e = planContent.endDate || planContent.end_date;
    if (s && e) {
      return Math.ceil(
        (new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)
      );
    }
    return 1;
  })();

  function handleBackClick() {
    dispatch("back");
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  }

  function formatCurrency(amount: number): string {
    if (typeof amount !== "number" || isNaN(amount)) return "$0";
    return `$${amount.toLocaleString()}`;
  }
</script>

<div class="bg-gray-50 min-h-screen">
  <!-- Header with Back Button -->
  <div class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center">
      <button
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-teal-200 text-teal-700 font-semibold rounded-lg shadow-sm hover:bg-teal-50 hover:text-teal-800 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
        on:click={() => dispatch("back")}
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Quay lại Danh sách Kế hoạch</span>
      </button>
    </div>
  </div>

  <div class="max-w-6xl mx-auto p-6">
    <!-- Plan Header -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center">
          <div
            class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mr-4"
          >
            <div class="w-6 h-6 text-teal-600">
              <FaMapMarkerAlt />
            </div>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
            <p class="text-gray-600">{location}</p>
          </div>
        </div>
        <span
          class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(
            status
          )}"
        >
          {status.toUpperCase()}
        </span>
      </div>

      <p class="text-gray-700 mb-6">{description}</p>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="flex items-center justify-center mb-2">
            <div class="w-5 h-5 text-gray-600 mr-2">
              <FaCalendarAlt />
            </div>
            <span class="text-sm text-gray-600">Thời gian</span>
          </div>
          <p class="text-lg font-semibold text-gray-800">{duration}</p>
        </div>

        <div class="text-center">
          <div class="flex items-center justify-center mb-2">
            <div class="w-5 h-5 text-gray-600 mr-2">
              <FaDollarSign />
            </div>
            <span class="text-sm text-gray-600">Ngân sách</span>
          </div>
          <p class="text-lg font-semibold text-gray-800">{budget}</p>
        </div>

        <div class="text-center">
          <div class="flex items-center justify-center mb-2">
            <div class="w-5 h-5 text-gray-600 mr-2">
              <FaCalendarAlt />
            </div>
            <span class="text-sm text-gray-600">Ngày tạo</span>
          </div>
          <p class="text-lg font-semibold text-gray-800">{created}</p>
        </div>

        <div class="text-center">
          <div class="flex items-center justify-center mb-2">
            <div class="w-5 h-5 text-gray-600 mr-2">
              <FaUsers />
            </div>
            <span class="text-sm text-gray-600">Người tham gia</span>
          </div>
          <p class="text-lg font-semibold text-gray-800">{participants}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column -->
      <div class="space-y-6">
        <!-- Itinerary -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Lịch trình</h2>
          <div class="space-y-8">
            {#if itineraryDays.length > 0}
              {#each itineraryDays as day, idx}
                <div class="relative pl-8">
                  <!-- Timeline vertical line -->
                  <div
                    class="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-teal-200 rounded-full opacity-30"
                  ></div>
                  <!-- Day badge -->
                  <div class="flex items-center mb-4">
                    <div
                      class="z-10 w-8 h-8 flex items-center justify-center rounded-full bg-teal-500 text-white font-bold shadow-md border-2 border-white mr-3"
                    >
                      {day.dayNumber ?? day.day}
                    </div>
                    <span class="text-lg font-semibold text-teal-700"
                      >Ngày {day.dayNumber ?? day.day}</span
                    >
                  </div>
                  <!-- Activities timeline -->
                  {#if day.dayData}
                    <ul class="space-y-4 ml-2">
                      {#each Object.entries(day.dayData) as [slot, slotDataRaw], slotIdx}
                        {@const slotData = slotDataRaw as {
                          activity?: string;
                          location?: string;
                          time?: string;
                        }}
                        <li class="flex items-start group">
                          <!-- Dot for each slot -->
                          <div class="mt-1 w-4 flex flex-col items-center">
                            <div
                              class="w-3 h-3 rounded-full bg-white border-2 border-teal-400 group-hover:bg-teal-400 transition"
                            ></div>
                            {#if slotIdx < Object.keys(day.dayData).length - 1}
                              <div
                                class="flex-1 w-px bg-teal-200 opacity-60"
                              ></div>
                            {/if}
                          </div>
                          <div class="ml-4 flex-1">
                            <div class="flex items-center mb-1">
                              <span
                                class="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold mr-2 shadow-sm capitalize"
                                >{slot}</span
                              >
                              {#if slotData.time}
                                <span class="text-xs text-gray-500 font-medium"
                                  >{slotData.time}</span
                                >
                              {/if}
                            </div>
                            <div class="font-medium text-gray-800 mb-1">
                              {slotData.activity}
                            </div>
                            {#if slotData.location}
                              <div class="text-xs text-gray-500 italic">
                                {slotData.location}
                              </div>
                            {/if}
                          </div>
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </div>
              {/each}
            {:else}
              <div class="text-gray-500">Không có lịch trình.</div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
        <!-- Flight Info -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Chuyến bay</h2>
          {#if topFlight}
            <FlightTicketCard flight={topFlight} />
          {:else}
            <div class="text-gray-500">Không có dữ liệu chuyến bay.</div>
          {/if}
        </div>

        <!-- Accommodations (moved below Flight) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Chỗ ở</h2>
          {#if topHotel}
            <HotelBookCard hotel={topHotel} />
          {:else}
            <div class="text-gray-500">Không có dữ liệu chỗ ở.</div>
          {/if}
        </div>

        <!-- Trip Summary -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">
            Tóm tắt chuyến đi
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-teal-600">
                {formatCurrency(flightPrice)}
              </div>
              <div class="text-sm text-gray-500">Chi phí chuyến bay</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-teal-600">
                {formatCurrency(hotelPrice)}
              </div>
              <div class="text-sm text-gray-500">Khách sạn mỗi đêm</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                {formatCurrency(flightPrice + hotelPrice * tripDuration)}
              </div>
              <div class="text-sm text-gray-500">Tổng ước tính</div>
            </div>
          </div>
          {#if selectedInterests && selectedInterests.length > 0}
            <div class="border-t border-gray-200 pt-4">
              <div class="font-semibold text-gray-800 mb-2">Sở thích</div>
              <div class="flex flex-wrap gap-2">
                {#each selectedInterests as interest}
                  <span
                    class="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-medium"
                    >{interest}</span
                  >
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom styles for better animations */
  .hover\:scale-102:hover {
    transform: scale(1.02);
  }
  /* Timeline styles for itinerary */
  .itinerary-timeline {
    position: relative;
    padding-left: 2rem;
  }
  .itinerary-timeline:before {
    content: "";
    position: absolute;
    left: 1rem;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom, #14b8a6, #99f6e4);
    border-radius: 2px;
    opacity: 0.2;
  }
</style>
