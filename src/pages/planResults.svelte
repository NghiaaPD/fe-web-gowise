<script lang="ts">
  import FlightTicketCard from "../components/flightTicketCard.svelte";
  import HotelBookCard from "../components/hotelBookCard.svelte";
  import DayPlan from "../components/dayPlan.svelte";
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
  let itineraryData: any = null;
  let selectedInterests: string[] = [];
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
        itineraryData = travelPlanData.itineraryData || null;
        selectedInterests = travelPlanData.selectedInterests || [];
        userLocation = travelPlanData.userLocation || null;

        console.log("📊 Processed data:");
        console.log("🎯 Destination:", destination);
        console.log("✈️ Flight data:", flightData);
        console.log("🏨 Hotel data:", hotelData);
        console.log("🗓️ Itinerary data:", itineraryData);
        console.log("🎨 Selected interests:", selectedInterests);

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

  // Get itinerary days
  $: itineraryDays =
    itineraryData?.success && itineraryData.data?.itinerary
      ? Object.entries(itineraryData.data.itinerary)
          .filter(([key]) => key.startsWith("day_"))
          .map(([key, value]) => ({
            dayNumber: parseInt(key.split("_")[1]),
            dayData: value,
          }))
          .sort((a, b) => a.dayNumber - b.dayNumber)
      : [];

  // Debug logging
  $: if (flightData) console.log("🔄 Flight options updated:", flightOptions);
  $: if (hotelData) console.log("🔄 Hotel options updated:", hotelOptions);
  $: if (itineraryData)
    console.log("🔄 Itinerary days updated:", itineraryDays);

  // Handle selections
  function handleFlightSelect(flight: any) {
    console.log("Selected flight:", flight);
    // Handle flight selection logic here
  }

  function handleHotelSelect(hotel: any) {
    console.log("Selected hotel:", hotel);
    // Handle hotel selection logic here
  }

  async function handleSavePlan() {
    try {
      // Get user_id from token (similar to mainScreen logic)
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("accessToken=")
      );
      let user_id = "default_user";
      if (tokenCookie) {
        const token = tokenCookie.split("=")[1];
        try {
          const payload = token.split(".")[1];
          const decoded = atob(payload);
          const tokenData = JSON.parse(decoded);
          user_id =
            tokenData?.user_id ||
            tokenData?.id ||
            tokenData?.sub ||
            "default_user";
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }

      // Generate plan_id (using timestamp for simplicity)
      const plan_id = `plan_${Date.now()}`;

      // Prepare plan_content
      const plan_content = {
        ...travelPlanData, // Include all data from instructPage
        flightOptions,
        hotelOptions,
        itineraryDays,
      };

      const requestBody = {
        user_id,
        plan_id,
        plan_content,
      };

      console.log("📤 Saving plan:", requestBody);

      const response = await fetch("http://nghiapd.ddns.net:8081/plans/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Plan saved successfully:", result);
        alert("Travel plan saved successfully!");
      } else {
        console.error("❌ Failed to save plan:", response.statusText);
        alert("Failed to save travel plan. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error saving plan:", error);
      alert("An error occurred while saving the plan.");
    }
  }
</script>

<svelte:head>
  <title>Travel Plan Results - GoWise</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Back Button -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
    <button
      class="back-btn flex items-center gap-2 text-teal-600 hover:text-teal-800 font-medium py-2 px-4 rounded-lg bg-white border border-gray-200 shadow-sm transition-all duration-200 mb-4"
      on:click={() => window.history.back()}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  </div>

<style>
.back-btn {
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, box-shadow, background;
}
.back-btn:hover {
  transform: scale(1.045) translateX(-3px);
  box-shadow: 0 6px 24px 0 rgba(20, 184, 166, 0.13);
  background: linear-gradient(90deg, #f0fdfa 0%, #e0f7fa 100%);
}
.back-btn:active {
  transform: scale(0.98) translateX(-1px);
  box-shadow: 0 2px 8px 0 rgba(20, 184, 166, 0.16);
  background: #f0fdfa;
}
</style>
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
            on:click={() => (window.location.href = "/instruct")}
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

    <!-- Itinerary Section -->
    {#if itineraryDays && itineraryDays.length > 0}
      <div class="mt-12">
        <div class="flex items-center justify-between mb-6">
          <h2
            class="text-2xl font-semibold text-gray-900 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-6 h-6 text-teal-600"
              aria-hidden="true"
            >
              <path
                d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"
              />
              <path d="M15 5.764v15" />
              <path d="M9 3.236v15" />
            </svg>
            Your Travel Itinerary
          </h2>
          <span class="text-sm text-gray-500">
            {itineraryDays.length} day{itineraryDays.length !== 1 ? "s" : ""} planned
          </span>
        </div>

        <div class="space-y-8">
          {#each itineraryDays as { dayNumber, dayData }}
            <DayPlan {dayData} {dayNumber} />
          {/each}
        </div>
      </div>
    {:else if itineraryData === null}
      <div
        class="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8"
      >
        <div class="text-center">
          <div class="text-gray-500 mb-2">Loading itinerary...</div>
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"
          ></div>
        </div>
      </div>
    {:else if itineraryData && !itineraryData.success}
      <div
        class="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8"
      >
        <div class="text-center">
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
            Unable to create itinerary
          </div>
          <div class="text-gray-500 text-sm">
            We couldn't generate a detailed itinerary for your trip. Please try
            again later.
          </div>
        </div>
      </div>
    {/if}

    <!-- Summary Section -->
    <div class="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Trip Summary</h3>

      {#if travelPlanData}
        <div class="mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
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

          {#if selectedInterests && selectedInterests.length > 0}
            <div class="border-t border-gray-200 pt-4">
              <span class="font-medium text-gray-700">Your Interests:</span>
              <div class="flex flex-wrap gap-2 mt-2">
                {#each selectedInterests as interest}
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                  >
                    {interest.charAt(0).toUpperCase() + interest.slice(1)}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
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
          on:click={handleSavePlan}
        >
          Save Travel Plan
        </button>
      </div>
    </div>
  </div>
</div>
