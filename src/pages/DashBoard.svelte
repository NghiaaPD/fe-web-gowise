<script lang="ts">
    import RecentPlanCard from "../components/RecentPlanCard.svelte";
    import WeatherCard from "../components/WeatherCard.svelte";
    import PlanCard from "../components/PlanCard.svelte";
    import IoMdPaperPlane from "svelte-icons/io/IoMdPaperPlane.svelte";
    import IoMdTrendingUp from "svelte-icons/io/IoMdTrendingUp.svelte";

    // Dashboard data
    let totalPlans = 3;
    let activePlans = 1;
    let completedPlans = 16;
    let draftPlans = 5;

    // Recent plans data
    let recentPlans = [
        {
            title: "Tokyo Adventure",
            location: "Japan",
            duration: "7 days",
            status: "published" as const,
            iconColor: "#FF6B6B",
        },
        {
            title: "European Explorer",
            location: "Europe",
            duration: "14 days",
            status: "draft" as const,
            iconColor: "#4ECDC4",
        },
        {
            title: "Bali Retreat",
            location: "Indonesia",
            duration: "10 days",
            status: "completed" as const,
            iconColor: "#45B7D1",
        },
    ];

    // Sample plan data for PlanCard
    let samplePlans = [
        {
            title: "Tokyo Adventure",
            location: "Japan",
            duration: "7 days",
            budget: "$2000",
            created: "1/15/2024",
            status: "active" as const,
        },
        {
            title: "European Explorer",
            location: "Europe",
            duration: "14 days",
            budget: "$3500",
            created: "2/20/2024",
            status: "draft" as const,
        },
        {
            title: "Bali Retreat",
            location: "Indonesia",
            duration: "10 days",
            budget: "$1800",
            created: "3/10/2024",
            status: "completed" as const,
        },
    ];

    // Weather data for multiple locations
    let weatherData = [
        {
            location: "Tokyo, Japan",
            temperature: 22,
            condition: "Sunny",
            humidity: 65,
            visibility: 10,
            windSpeed: 12,
            uvIndex: 6,
            backgroundColor: "#A7F3D0",
            textColor: "#065F46",
        },
        {
            location: "Paris, France",
            temperature: 18,
            condition: "Cloudy",
            humidity: 78,
            visibility: 8,
            windSpeed: 8,
            uvIndex: 3,
            backgroundColor: "#DBEAFE",
            textColor: "#1E3A8A",
        },
        {
            location: "Bali, Indonesia",
            temperature: 28,
            condition: "Light Rain",
            humidity: 85,
            visibility: 6,
            windSpeed: 15,
            uvIndex: 4,
            backgroundColor: "#FEF3C7",
            textColor: "#92400E",
        },
    ];
</script>

<div
    class="p-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-screen"
>
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-[#0D9488] mb-2">Dashboard</h1>
        <p class="text-gray-600 text-sm">
            Welcome back! Here's what's happening with your travel plans ✈️
        </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- Total Plans -->
        <div
            class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-4 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
        >
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-blue-100 mb-1 text-xs font-medium">
                        Total Plans
                    </p>
                    <p class="text-2xl font-bold">{totalPlans}</p>
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
                    <p class="text-emerald-100 mb-1 text-xs font-medium">
                        Active Plans
                    </p>
                    <p class="text-2xl font-bold">{activePlans}</p>
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
                    <p class="text-purple-100 mb-1 text-xs font-medium">
                        Completed
                    </p>
                    <p class="text-2xl font-bold">{completedPlans}</p>
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
                    <p class="text-orange-100 mb-1 text-xs font-medium">
                        Drafts
                    </p>
                    <p class="text-2xl font-bold">{draftPlans}</p>
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
                <h2 class="text-lg font-bold text-cyan-700 mb-1">
                    Recent Plans
                </h2>
                <p class="text-gray-600 text-sm">
                    Your latest travel planning activity 🗺️
                </p>
            </div>

            <div class="space-y-3">
                {#each recentPlans as plan}
                    <div
                        class="transform hover:scale-102 transition-all duration-300"
                    >
                        <RecentPlanCard
                            title={plan.title}
                            location={plan.location}
                            duration={plan.duration}
                            status={plan.status}
                            iconColor={plan.iconColor}
                        />
                    </div>
                {/each}
            </div>
        </div>

        <!-- Weather Board Section -->
        <div>
            <div class="mb-4">
                <h2 class="text-lg font-bold text-emerald-700 mb-1">
                    Weather Board
                </h2>
                <p class="text-gray-600 text-sm">
                    Current weather conditions 🌤️
                </p>
            </div>

            <div class="space-y-3">
                {#each weatherData as weather}
                    <div
                        class="rounded-2xl overflow-hidden transform hover:scale-102 transition-all duration-300 hover:shadow-lg"
                    >
                        <WeatherCard
                            location={weather.location}
                            temperature={weather.temperature}
                            condition={weather.condition}
                            humidity={weather.humidity}
                            visibility={weather.visibility}
                            windSpeed={weather.windSpeed}
                            uvIndex={weather.uvIndex}
                            backgroundColor={weather.backgroundColor}
                            textColor={weather.textColor}
                        />
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
