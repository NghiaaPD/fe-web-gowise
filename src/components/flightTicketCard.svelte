<script lang="ts">
  interface CarbonEmissions {
    this_flight: number;
    typical_for_this_route: number;
    difference_percent: number;
  }

  interface Airport {
    name: string;
    id: string;
    time: string;
  }

  interface AirlineInfo {
    departure_airport: Airport;
    arrival_airport: Airport;
    airplane: string;
    flight_number: string;
    airline: string;
  }

  interface Flight {
    price: string;
    price_value: number;
    duration: string;
    duration_minutes: number;
    duration_hours: number;
    score: number;
    carbon_emissions: CarbonEmissions;
    airline_logo: string;
    booking_token: string;
    type: string;
    airline_info: AirlineInfo;
  }

  interface Props {
    flight: Flight;
    onSelect?: (flight: Flight) => void;
  }

  let { flight, onSelect = () => {} }: Props = $props();

  function formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function formatDate(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function handleSelect() {
    onSelect(flight);
  }

  // Calculate emissions difference
  const emissionsDiff = flight.carbon_emissions.difference_percent;
  const emissionsStatus =
    emissionsDiff > 0 ? "higher" : emissionsDiff < 0 ? "lower" : "average";
</script>

<div
  class="bg-white rounded-xl p-5 shadow-md border border-gray-200 cursor-pointer transition-all duration-300 mb-4 hover:shadow-lg hover:-translate-y-0.5"
  onclick={handleSelect}
  onkeydown={(e) => e.key === "Enter" && handleSelect()}
  role="button"
  tabindex="0"
>
  <!-- Flight Header -->
  <div class="flex justify-between items-start mb-5">
    <div class="flex items-center gap-3">
      <img
        src={flight.airline_logo}
        alt={flight.airline_info.airline}
        class="w-8 h-8 object-contain"
      />
      <div class="flex flex-col gap-0.5">
        <span class="font-semibold text-sm text-gray-800"
          >{flight.airline_info.flight_number}</span
        >
        <span class="text-xs text-gray-500">{flight.airline_info.airplane}</span
        >
      </div>
    </div>
    <div class="text-right">
      <span class="text-lg font-bold text-gray-800 block">{flight.price}</span>
      <span class="text-xs text-gray-500">{flight.type}</span>
    </div>
  </div>

  <!-- Flight Route -->
  <div class="flex items-center gap-5 mb-4">
    <!-- Departure -->
    <div class="flex-1 min-w-0 text-left">
      <div class="text-lg font-semibold text-gray-800 mb-1">
        {formatTime(flight.airline_info.departure_airport.time)}
      </div>
      <div class="text-sm font-medium text-gray-600 mb-0.5">
        {flight.airline_info.departure_airport.id}
      </div>
      <div
        class="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis airport-name"
      >
        {flight.airline_info.departure_airport.name}
      </div>
    </div>

    <!-- Flight Path -->
    <div class="flex-2 flex flex-col items-center gap-2">
      <div class="text-center">
        <span class="text-xs text-gray-500 whitespace-nowrap"
          >Travel time: {flight.duration}</span
        >
      </div>
      <div class="flex items-center w-full relative">
        <div class="w-2 h-2 rounded-full bg-teal-600 relative z-10"></div>
        <div
          class="flex-1 h-0.5 bg-gradient-to-r from-teal-600 to-teal-500 mx-[-2px] relative path-connector"
        ></div>
        <div class="w-2 h-2 rounded-full bg-teal-600 relative z-10"></div>
      </div>
    </div>

    <!-- Arrival -->
    <div class="flex-1 min-w-0 text-right">
      <div class="text-lg font-semibold text-gray-800 mb-1">
        {formatTime(flight.airline_info.arrival_airport.time)}
      </div>
      <div class="text-sm font-medium text-gray-600 mb-0.5">
        {flight.airline_info.arrival_airport.id}
      </div>
      <div
        class="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis airport-name"
      >
        {flight.airline_info.arrival_airport.name}
      </div>
    </div>
  </div>

  <!-- Flight Footer -->
  <div
    class="border-t border-gray-100 pt-3 flex justify-between items-start gap-4 md:flex-row flex-col md:gap-4 gap-2 md:items-start items-start"
  >
    <div class="flex-1">
      <span class="text-xs text-gray-600 font-medium"
        >Economy • {flight.airline_info.airplane}</span
      >
    </div>
    <div class="flex-2 md:text-right text-left">
      <span class="text-xs text-gray-500 block leading-relaxed"
        >Average legroom (31 in)</span
      >
      <span class="text-xs text-teal-600 font-medium block leading-relaxed">
        {emissionsStatus === "higher" ? "+" : ""}{flight.carbon_emissions
          .difference_percent}% emissions • {Math.round(
          flight.carbon_emissions.this_flight / 1000
        )} kg
      </span>
      <span class="text-xs text-gray-500 block leading-relaxed"
        >On-demand video</span
      >
      <span class="text-xs text-gray-500 block leading-relaxed">
        Carbon emissions estimate • {Math.round(
          flight.carbon_emissions.this_flight / 1000
        )} kg
      </span>
    </div>
  </div>
</div>

<style>
  /* Custom styles for flight path arrow that can't be done with Tailwind */
  .path-connector::after {
    content: "";
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid #0d9488;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
  }

  /* Custom flex-2 utility for flight path */
  .flex-2 {
    flex: 2;
  }

  /* Hide airport names on mobile */
  @media (max-width: 480px) {
    .airport-name {
      display: none !important;
    }
  }
</style>
