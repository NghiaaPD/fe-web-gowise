<script lang="ts">
  import RecentPlanCard from "../components/RecentPlanCard.svelte";
  import WeatherCard from "../components/WeatherCard.svelte";
  import PlanCard from "../components/PlanCard.svelte";
  import IoMdPaperPlane from "svelte-icons/io/IoMdPaperPlane.svelte";
  import IoMdTrendingUp from "svelte-icons/io/IoMdTrendingUp.svelte";

  import { onMount, tick } from "svelte";
  import { fetchWeatherApi } from "openmeteo";
  import { showNotification } from "$lib/index";
  // --- Real plan and weather integration ---
  type Plan = {
    _id?: { $oid: string };
    user_id?: string;
    plan_content?: {
      plan_id?: string;
      hasExistingPlan?: boolean;
      travelType?: string | null;
      destination?: string;
      startDate?: string;
      endDate?: string;
      participants?: string;
      budget?: string;
      flightData?: any;
      hotelData?: any;
      itineraryData?: any;
      selectedInterests?: string[];
      userLocation?: any;
      [key: string]: any;
    };
    created_at: string;
    updated_at?: string;
    status?: "active" | "draft" | "completed";
    [key: string]: any;
  };

  let plans: Plan[] = [];
  let isLoading = true;
  let error: string | null = null;
  let userId: string | null = null;

  // Helper to get userId from JWT token in cookies (copied from ManagePlan.svelte)
  function getUserIdFromToken(): string | null {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    if (!tokenCookie) return null;

    const token = tokenCookie.split("=")[1];
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      const tokenData = JSON.parse(decoded);
      return tokenData?.user_id || tokenData?.id || tokenData?.sub || null;
    } catch (error) {
      return null;
    }
  }

  // Fetch plans from API (copied from ManagePlan.svelte)
  async function fetchPlans() {
    try {
      isLoading = true;
      error = null;

      userId = getUserIdFromToken();
      if (!userId) {
        error = "Unable to get user ID from token.";
        showNotification({ title: "Load Failed", message: error }, "error");
        isLoading = false;
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/plans/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        plans = data.plans || [];
      } else {
        error = "Failed to load plans. Please try again.";
        showNotification({ title: "Load Failed", message: error }, "error");
      }
    } catch (err) {
      error = "An error occurred while loading plans.";
      showNotification({ title: "Load Failed", message: error }, "error");
    } finally {
      isLoading = false;
    }
  }

  // Transform API plans to UI format (use plan_content)
  $: transformedPlans = plans.map((plan) => {
    const content = plan.plan_content || {};
    const startDate = content.startDate || content.start_date;
    const endDate = content.endDate || content.end_date;
    const duration =
      startDate && endDate
        ? `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
        : "Unknown";
    return {
      ...plan,
      title: content.destination
        ? `Trip to ${content.destination}`
        : "Unknown Plan",
      location: content.destination || "Unknown",
      duration,
      budget: content.budget ? `$${content.budget}` : "$0",
      created: plan.created_at
        ? new Date(plan.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "",
      status: (plan.status || "active") as "active" | "draft" | "completed",
      description: `Travel plan for ${content.participants || "1"} ${content.participants === "1" ? "person" : "people"} to ${content.destination || "destination"}`,
    };
  });

  // Statistics
  $: stats = {
    total: transformedPlans.length,
    active: transformedPlans.filter((p) => p.status === "active").length,
    draft: transformedPlans.filter((p) => p.status === "draft").length,
    completed: transformedPlans.filter((p) => p.status === "completed").length,
  };

  // Recent plans: just use the 3 most recent
  $: recentPlans = transformedPlans.slice(0, 3).map((plan, idx) => ({
    title: plan.title,
    location: plan.location,
    duration: plan.duration,
    // Map 'active' to 'published' and cast to allowed type
    status: (plan.status === "active" ? "published" : plan.status) as
      | "completed"
      | "draft"
      | "published"
      | undefined,
    iconColor: ["#FF6B6B", "#4ECDC4", "#45B7D1"][idx % 3],
  }));

  // --- Weather integration ---
  // Helper: geocode location to lat/lon using Nominatim
  async function geocodeLocation(
    location: string
  ): Promise<{ lat: number; lon: number } | null> {
    if (!location || location === "Unknown") return null;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  // Helper: fetch weather from open-meteo.com using openmeteo lib
  async function fetchWeather(lat: number, lon: number): Promise<any> {
    try {
      const params = {
        latitude: lat,
        longitude: lon,
        hourly: [
          "temperature_2m",
          "visibility",
          "soil_moisture_1_to_3cm",
          "uv_index",
        ],
      };
      const url = "https://api.open-meteo.com/v1/forecast";
      const responses = await fetchWeatherApi(url, params);
      const response = responses[0];
      if (!response) return null;

      const latitude = response.latitude();
      const longitude = response.longitude();
      const elevation = response.elevation();
      const utcOffsetSeconds = response.utcOffsetSeconds();

      const hourly = response.hourly();
      if (!hourly) return null;

      const timeArr = [
        ...Array(
          (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval()
        ),
      ].map(
        (_, i) =>
          new Date(
            (Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) *
              1000
          )
      );
      const temperature_2m = hourly.variables(0)?.valuesArray() || [];
      const visibility = hourly.variables(1)?.valuesArray() || [];
      const soil_moisture_1_to_3cm = hourly.variables(2)?.valuesArray() || [];
      const uv_index = hourly.variables(3)?.valuesArray() || [];

      // Pick the first hour as 'current' (or you can pick the closest to now)
      return {
        latitude,
        longitude,
        elevation,
        utcOffsetSeconds,
        time: timeArr[0],
        temperature: temperature_2m[0],
        visibility: visibility[0],
        soil_moisture_1_to_3cm: soil_moisture_1_to_3cm[0],
        uv_index: uv_index[0],
      };
    } catch (e) {
      return null;
    }
  }

  // Weather data for each plan
  let weatherData: any[] = [];
  let isWeatherLoading = false;
  let weatherBoardVisible = false;
  let weatherBoardRef: HTMLDivElement | null = null;

  // Only fetch weather when visible
  async function lazyLoadWeather() {
    if (!weatherBoardVisible || isWeatherLoading || weatherData.length > 0)
      return;
    isWeatherLoading = true;
    weatherData = [];
    for (const plan of transformedPlans) {
      let lat = null;
      let lon = null;
      // Only use geocodeLocation for lat/lon
      const geo = await geocodeLocation(plan.location);
      if (geo) {
        lat = geo.lat;
        lon = geo.lon;
      }
      console.log(
        "[Weather] Plan:",
        plan.title,
        "location:",
        plan.location,
        "lat/lon:",
        lat,
        lon
      );
      if (lat && lon) {
        const weather = await fetchWeather(lat, lon);
        console.log("[Weather] Weather result:", weather);
        if (weather) {
          weatherData.push({
            location: plan.location,
            temperature:
              weather.temperature !== undefined
                ? Math.round(weather.temperature)
                : weather.temperature,
            visibility: weather.visibility,
            soilMoisture: weather.soil_moisture_1_to_3cm,
            uvIndex: weather.uv_index,
            backgroundColor: "#A7F3D0",
            textColor: "#065F46",
          });
          continue;
        }
      }
      // fallback: no weather
      weatherData.push({
        location: plan.location,
        temperature: "-",
        visibility: "-",
        soilMoisture: "-",
        uvIndex: "-",
        backgroundColor: "#F3F4F6",
        textColor: "#374151",
      });
    }
    isWeatherLoading = false;
  }

  onMount(() => {
    fetchPlans();
    // Intersection Observer for Weather Board
    const observer = new window.IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          weatherBoardVisible = true;
          await tick();
          lazyLoadWeather();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (weatherBoardRef) observer.observe(weatherBoardRef);
    return () => observer.disconnect();
  });

  // Helper: map open-meteo weathercode to string
  function weatherCodeToString(code: number): string {
    // See https://open-meteo.com/en/docs#api_form for weathercode mapping
    const map: Record<number, string> = {
      0: "Clear",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Drizzle",
      55: "Dense drizzle",
      56: "Freezing drizzle",
      57: "Freezing drizzle",
      61: "Slight rain",
      63: "Rain",
      65: "Heavy rain",
      66: "Freezing rain",
      67: "Freezing rain",
      71: "Slight snow fall",
      73: "Snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with hail",
    };
    return map[code] || "Unknown";
  }
</script>

<div
  class="p-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-screen"
>
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-[#0D9488] mb-2">Dashboard</h1>
    <p class="text-gray-600 text-sm">
      Chào mừng trở lại! Đây là những gì đang xảy ra với kế hoạch du lịch của
      bạn ✈️
    </p>
  </div>

  <!-- Stats Cards (dynamic) -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Total Plans -->
    <div
      class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-4 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-blue-100 mb-1 text-xs font-medium">Total Plans</p>
          <p class="text-2xl font-bold">{stats.total}</p>
        </div>
        <div
          class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
        >
          <div class="w-5 h-5 text-white">
            <IoMdPaperPlane />
          </div>
        </div>
      </div>
    </div>

    <!-- Active Plans -->
    <div
      class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md p-4 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-emerald-100 mb-1 text-xs font-medium">Active Plans</p>
          <p class="text-2xl font-bold">{stats.active}</p>
        </div>
        <div
          class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
        >
          <div class="w-5 h-5 text-white">
            <IoMdTrendingUp />
          </div>
        </div>
      </div>
    </div>

    <!-- Completed Plans -->
    <div
      class="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md p-4 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-purple-100 mb-1 text-xs font-medium">Completed</p>
          <p class="text-2xl font-bold">{stats.completed}</p>
        </div>
        <div
          class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
        >
          <svg
            class="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Draft Plans -->
    <div
      class="bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl shadow-md p-4 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-orange-100 mb-1 text-xs font-medium">Drafts</p>
          <p class="text-2xl font-bold">{stats.draft}</p>
        </div>
        <div
          class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
        >
          <svg
            class="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Recent Plans Section -->
    <div>
      <div class="mb-4">
        <h2 class="text-lg font-bold text-cyan-700 mb-1">Kế hoạch gần đây</h2>
        <p class="text-gray-600 text-sm">
          Your latest travel planning activity 🗺️
        </p>
      </div>

      <div class="space-y-3">
        {#if isLoading}
          <div class="text-center text-gray-500 py-8">Loading plans...</div>
        {:else if error}
          <div class="text-center text-red-500 py-8">
            An error occurred while loading plans.
          </div>
        {:else if recentPlans.length === 0}
          <div class="text-center text-gray-400 py-8">
            Không tìm thấy kế hoạch gần đây.
          </div>
        {:else}
          {#each recentPlans as plan}
            <div class="transform hover:scale-102 transition-all duration-300">
              <RecentPlanCard
                title={plan.title}
                location={plan.location}
                duration={plan.duration}
                status={plan.status}
                iconColor={plan.iconColor}
              />
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Weather Board Section -->
    <div bind:this={weatherBoardRef}>
      <div class="mb-4">
        <h2 class="text-lg font-bold text-emerald-700 mb-1">Bảng thời tiết</h2>
        <p class="text-gray-600 text-sm">Điều kiện thời tiết hiện tại 🌤️</p>
      </div>

      <div class="space-y-3">
        {#if isWeatherLoading}
          <div class="text-center text-gray-500 py-8">Loading weather...</div>
        {:else if weatherData.length === 0}
          <div class="text-center text-gray-400 py-8">
            No weather data found.
          </div>
        {:else}
          {#each weatherData as weather}
            <div
              class="rounded-2xl overflow-hidden transform hover:scale-102 transition-all duration-300 hover:shadow-lg"
            >
              <WeatherCard
                location={weather.location}
                temperature={weather.temperature}
                visibility={weather.visibility}
                uvIndex={weather.uvIndex}
                backgroundColor={weather.backgroundColor}
                textColor={weather.textColor}
              />
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>
