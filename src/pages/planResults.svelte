<script lang="ts">
  import FlightTicketCard from "../components/flightTicketCard.svelte";
  import HotelBookCard from "../components/hotelBookCard.svelte";
  import { onMount } from "svelte";

  import FaPlane from "svelte-icons/fa/FaPlane.svelte";

  // Travel plan data from instructPage
  let travelPlanData: any = null;
  let destination: string = "";
  let startDate: string = "";
  let endDate: string = "";
  let participants: string = "";
  let budget: string = "";
  let travelType: string | null = null;
  let flightData: any = null;
  let hotelData: any = null;
  let userLocation: any = null;
  let isLoading: boolean = true;

  // Load travel plan data on component mount
  onMount(() => {
    console.log("📄 PlanResults: Loading stored data...");

    const storedData = localStorage.getItem("travelPlanData");
    console.log("💾 Raw stored data:", storedData);

    if (storedData) {
      try {
        travelPlanData = JSON.parse(storedData);
        console.log("✅ Parsed travel plan data:", travelPlanData);

        destination = travelPlanData.destination || "Your destination";
        startDate = travelPlanData.startDate || "";
        endDate = travelPlanData.endDate || "";
        participants = travelPlanData.participants || "2";
        budget = travelPlanData.budget || "500";
        travelType = travelPlanData.travelType || null;
        flightData = travelPlanData.flightData || null;
        hotelData = travelPlanData.hotelData || null;
        userLocation = travelPlanData.userLocation || null;

        console.log("📊 Processed data:");
        console.log("🎯 Destination:", destination);
        console.log("✈️ Flight data:", flightData);
        console.log("🏨 Hotel data:", hotelData);

        // Set loading to false when data is loaded
        isLoading = false;
      } catch (error) {
        console.error("❌ Error parsing travel plan data:", error);
        isLoading = false;
      }
    } else {
      console.log("⚠️ No stored data found");
      isLoading = false;
    }
  });

  // Calculate trip duration
  $: tripDuration =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 1;

  // Get flight and hotel options from API data - only top 1
  $: flightOptions =
    flightData?.success && flightData.top_1?.flight
      ? [flightData.top_1.flight]
      : [];

  $: hotelOptions =
    hotelData?.success && hotelData.top_1?.hotel ? [hotelData.top_1.hotel] : [];

  // Calculate pricing from actual data
  $: flightPrice =
    flightOptions[0]?.price_value || (flightData?.no_flights_found ? 0 : 121);
  $: hotelPrice =
    hotelOptions[0]?.price_value || (hotelData?.no_hotels_found ? 0 : 39);

  // Debug logging
  $: if (flightData) console.log("🔄 Flight options updated:", flightOptions);
  $: if (hotelData) console.log("🔄 Hotel options updated:", hotelOptions);

  // Handle selections
  function handleFlightSelect(flight: any) {
    console.log("Selected flight:", flight);
    // Handle flight selection logic here
  }

  function handleHotelSelect(hotel: any) {
    console.log("Selected hotel:", hotel);
    // Handle hotel selection logic here
  }
</script>

<svelte:head>
  <title>Travel Plan Results - GoWise</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {#if destination && destination !== "Your destination"}
              Travel Plans for {destination}
            {:else}
              Your Travel Plan Results
            {/if}
          </h1>
          <p class="text-gray-600 mt-1">
            {#if startDate && endDate}
              {new Date(startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} - {new Date(endDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })} • {participants}
              {participants === "1" ? "person" : "people"} • Budget: ${budget}
            {:else}
              Find the perfect flight and accommodation for your trip
            {/if}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <button
            class="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            onclick={() => (window.location.href = "/instruct")}
          >
            Modify Search
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Flights Section -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2
            class="text-xl font-semibold text-gray-900 flex items-center gap-2"
          >
            <div class="w-6 h-6 text-teal-600">
              <FaPlane />
            </div>
            Available Flights
          </h2>
          <span class="text-sm text-gray-500">Best option</span>
        </div>

        <div class="space-y-4">
          {#if flightOptions.length > 0}
            {#each flightOptions as flight, index (index)}
              <FlightTicketCard {flight} onSelect={handleFlightSelect} />
            {/each}
          {:else if flightData?.no_flights_found}
            <div class="text-center py-8">
              <div class="text-gray-600 mb-2">
                <svg
                  class="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div class="text-gray-700 font-medium mb-1">
                No flights available
              </div>
              <div class="text-gray-500 text-sm">
                No flights found to {flightData.destination || destination} for the
                selected dates
              </div>
            </div>
          {:else if flightData === null}
            <div class="text-center py-8">
              <div class="text-gray-500 mb-2">Loading flight options...</div>
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"
              ></div>
            </div>
          {:else}
            <div class="text-center py-8">
              <div class="text-gray-500 mb-2">No flight data available</div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Hotels Section -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2
            class="text-xl font-semibold text-gray-900 flex items-center gap-2"
          >
            <svg
              class="w-6 h-6 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Available Hotels
          </h2>
          <span class="text-sm text-gray-500">Best option</span>
        </div>

        <div class="space-y-4">
          {#if hotelOptions.length > 0}
            {#each hotelOptions as hotel, index (index)}
              <HotelBookCard {hotel} onSelect={handleHotelSelect} />
            {/each}
          {:else if hotelData?.no_hotels_found}
            <div class="text-center py-8">
              <div class="text-gray-600 mb-2">
                <svg
                  class="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div class="text-gray-700 font-medium mb-1">
                No hotels available
              </div>
              <div class="text-gray-500 text-sm">
                No hotels found in {hotelData.destination || destination} for the
                selected dates
              </div>
            </div>
          {:else if hotelData === null}
            <div class="text-center py-8">
              <div class="text-gray-500 mb-2">Loading hotel options...</div>
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"
              ></div>
            </div>
          {:else}
            <div class="text-center py-8">
              <div class="text-gray-500 mb-2">No hotel data available</div>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Summary Section -->
    <div class="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Trip Summary</h3>

      {#if travelPlanData}
        <div class="mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {#if destination && destination !== "Your destination"}
              <div>
                <span class="font-medium text-gray-700">Destination:</span>
                <div class="text-gray-900">{destination}</div>
              </div>
            {/if}
            <div>
              <span class="font-medium text-gray-700">Duration:</span>
              <div class="text-gray-900">
                {tripDuration} day{tripDuration !== 1 ? "s" : ""}
              </div>
            </div>
            <div>
              <span class="font-medium text-gray-700">Travelers:</span>
              <div class="text-gray-900">
                {participants}
                {participants === "1" ? "person" : "people"}
              </div>
            </div>
            <div>
              <span class="font-medium text-gray-700">Budget:</span>
              <div class="text-gray-900">${budget}</div>
            </div>
          </div>
        </div>
      {/if}

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-teal-600">${flightPrice}</div>
          <div class="text-sm text-gray-500">Flight Cost</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-teal-600">${hotelPrice}</div>
          <div class="text-sm text-gray-500">Hotel per night</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">
            ${flightPrice + hotelPrice * tripDuration}
          </div>
          <div class="text-sm text-gray-500">Total Estimated</div>
        </div>
      </div>

      <div class="mt-6 flex justify-center">
        <button
          class="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200"
        >
          Book Complete Package
        </button>
      </div>
    </div>
  </div>
</div>
