<script lang="ts">
  import PlanCard from "../components/PlanCard.svelte";
  import ViewDetail from "../components/ViewDetail.svelte";
  import { fade, slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { onMount } from "svelte";
  import FaSearch from "svelte-icons/fa/FaSearch.svelte";
  import FaPlus from "svelte-icons/fa/FaPlus.svelte";
  import FaFilter from "svelte-icons/fa/FaFilter.svelte";
  import FaPencilAlt from "svelte-icons/fa/FaPencilAlt.svelte";
  import FaTh from "svelte-icons/fa/FaTh.svelte";
  import FaList from "svelte-icons/fa/FaList.svelte";

  // View state
  let currentView = "list"; // "list" or "detail"
  let isTransitioning = false;
  type Plan = {
    _id: { $oid: string };
    user_id: string;
    itinerary_data: {
      plan_id: string;
      hasExistingPlan: boolean;
      travelType: string | null;
      destination: string;
      startDate: string;
      endDate: string;
      participants: string;
      budget: string;
      flightData: any;
      hotelData: any;
      itineraryData: any;
      selectedInterests: string[];
      userLocation: any;
    };
    flightOptions: any[];
    hotelOptions: any[];
    itineraryDays: any[];
    created_at: string;
    updated_at: string;
    status?: "active" | "draft" | "completed";
  };
  let selectedPlan: Plan | null = null;

  // API state
  let plans: Plan[] = [];
  let isLoading = true;
  let error: string | null = null;
  let userId: string | null = null;

  // Get transformed selected plan for ViewDetail
  $: selectedPlanTransformed = selectedPlan
    ? {
        ...selectedPlan,
        title: `Trip to ${selectedPlan.itinerary_data?.destination || "Unknown"}`,
        location: selectedPlan.itinerary_data?.destination || "Unknown",
        duration:
          selectedPlan.itinerary_data?.startDate &&
          selectedPlan.itinerary_data?.endDate
            ? `${Math.ceil((new Date(selectedPlan.itinerary_data.endDate).getTime() - new Date(selectedPlan.itinerary_data.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
            : "Unknown",
        budget: `$${selectedPlan.itinerary_data?.budget || "0"}`,
        created: new Date(selectedPlan.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: (selectedPlan.status || "active") as
          | "active"
          | "draft"
          | "completed",
        description: `Travel plan for ${selectedPlan.itinerary_data?.participants || "1"} ${selectedPlan.itinerary_data?.participants === "1" ? "person" : "people"} to ${selectedPlan.itinerary_data?.destination || "destination"}`,
      }
    : undefined;

  // Get user ID from token (similar to mainScreen logic)
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
      console.error("Error decoding token:", error);
      return null;
    }
  }

  // Fetch plans from API
  async function fetchPlans() {
    try {
      isLoading = true;
      error = null;

      userId = getUserIdFromToken();
      if (!userId) {
        error = "Unable to get user ID from token";
        isLoading = false;
        return;
      }

      console.log("📥 Fetching plans for user:", userId);

      const response = await fetch(
        `http://nghiapd.ddns.net:8081/plans/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Plans fetched successfully:", data);

        // API returns {success: true, plans: [...], total_plans: number, user_id: string}
        plans = data.plans || [];
      } else {
        console.error("❌ Failed to fetch plans:", response.statusText);
        error = "Failed to load plans. Please try again.";
      }
    } catch (err) {
      console.error("❌ Error fetching plans:", err);
      error = "An error occurred while loading plans.";
    } finally {
      isLoading = false;
    }
  }

  // Load plans on component mount
  onMount(() => {
    fetchPlans();
  });

  // Filter and search state
  let searchQuery = "";
  let selectedStatus = "all";
  let viewMode = "grid"; // grid or list
  let sortBy = "created"; // created, budget, duration

  // Transform API plans to UI format
  $: transformedPlans = plans.map((plan) => ({
    ...plan,
    title: `Trip to ${plan.itinerary_data?.destination || "Unknown"}`,
    location: plan.itinerary_data?.destination || "Unknown",
    duration:
      plan.itinerary_data?.startDate && plan.itinerary_data?.endDate
        ? `${Math.ceil((new Date(plan.itinerary_data.endDate).getTime() - new Date(plan.itinerary_data.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
        : "Unknown",
    budget: `$${plan.itinerary_data?.budget || "0"}`,
    created: new Date(plan.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: (plan.status || "active") as "active" | "draft" | "completed",
    description: `Travel plan for ${plan.itinerary_data?.participants || "1"} ${plan.itinerary_data?.participants === "1" ? "person" : "people"} to ${plan.itinerary_data?.destination || "destination"}`,
  }));

  // Computed filtered plans
  $: filteredPlans = transformedPlans
    .filter((plan) => {
      const matchesSearch =
        plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" || plan.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "created") {
        return new Date(b.created).getTime() - new Date(a.created).getTime();
      } else if (sortBy === "budget") {
        return (
          parseInt(b.budget.replace("$", "")) -
          parseInt(a.budget.replace("$", ""))
        );
      } else if (sortBy === "duration") {
        return parseInt(b.duration) - parseInt(a.duration);
      }
      return 0;
    });

  // Statistics
  $: stats = {
    total: transformedPlans.length,
    active: transformedPlans.filter((p) => p.status === "active").length,
    draft: transformedPlans.filter((p) => p.status === "draft").length,
    completed: transformedPlans.filter((p) => p.status === "completed").length,
  };

  function handleCreatePlan() {
    window.location.href = "/instruct";
  }

  function handleImportPlan() {
    console.log("Import plan");
  }

  function handleViewDetail(plan: any) {
    isTransitioning = true;

    // Add transition delay for smooth effect
    setTimeout(() => {
      selectedPlan = plan;
      currentView = "detail";
      isTransitioning = false;
    }, 200);
  }

  function handleBackToList() {
    isTransitioning = true;

    // Add transition delay for smooth effect
    setTimeout(() => {
      currentView = "list";
      selectedPlan = null;
      isTransitioning = false;
    }, 200);
  }
</script>

<div class="p-6 bg-gray-50 min-h-screen relative">
  {#if isTransitioning}
    <!-- Loading overlay during transition -->
    <div
      class="fixed inset-0 bg-gray-50/80 backdrop-blur-sm z-50 flex items-center justify-center"
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 200 }}
    >
      <div class="flex flex-col items-center space-y-4">
        <div class="w-8 h-8 animate-spin">
          <svg
            class="w-full h-full text-teal-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              class="opacity-25"
            ></circle>
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              class="opacity-75"
            ></path>
          </svg>
        </div>
        <p class="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  {/if}

  {#if currentView === "detail" && selectedPlan && !isTransitioning}
    <div
      in:slide={{ duration: 400, easing: quintOut }}
      out:slide={{ duration: 300, easing: quintOut }}
    >
      <ViewDetail plan={selectedPlanTransformed} on:back={handleBackToList} />
    </div>
  {:else if currentView === "list" && !isTransitioning}
    <div
      in:slide={{ duration: 400, easing: quintOut }}
      out:slide={{ duration: 300, easing: quintOut }}
    >
      <!-- Header Section -->
      <div class="mb-8">
        <div
          class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <!-- Title and Description -->
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Manage Plans</h1>
            <p class="text-gray-600">
              Organize and manage all your travel plans in one place ✈️
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              on:click={handleCreatePlan}
              class="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
            >
              <div class="w-4 h-4">
                <FaPlus />
              </div>
              <span class="font-medium">Create New Plan</span>
            </button>

            <button
              on:click={handleImportPlan}
              class="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md"
            >
              <span class="font-medium">Import Plan</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Plans</p>
              <p class="text-2xl font-bold text-gray-800">
                {stats.total}
              </p>
            </div>
            <div
              class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <div class="w-5 h-5 text-blue-600">
                <FaPencilAlt />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Active</p>
              <p class="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div
              class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <div class="w-4 h-4 text-green-600">
                <FaPencilAlt />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Drafts</p>
              <p class="text-2xl font-bold text-yellow-600">
                {stats.draft}
              </p>
            </div>
            <div
              class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"
            >
              <div class="w-4 h-4 text-yellow-600">
                <FaPencilAlt />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Completed</p>
              <p class="text-2xl font-bold text-blue-600">
                {stats.completed}
              </p>
            </div>
            <div
              class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <div class="w-4 h-4 text-blue-600">
                <FaPencilAlt />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search Section -->
      <div
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8"
      >
        <div class="flex flex-col lg:flex-row lg:items-center gap-4">
          <!-- Search Bar -->
          <div class="flex-1 relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <div class="w-4 h-4 text-gray-400">
                <FaSearch />
              </div>
            </div>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search plans by title or location..."
              class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          <!-- Status Filter -->
          <select
            bind:value={selectedStatus}
            class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>

          <!-- Sort By -->
          <select
            bind:value={sortBy}
            class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          >
            <option value="created">Sort by Created</option>
            <option value="budget">Sort by Budget</option>
            <option value="duration">Sort by Duration</option>
          </select>

          <!-- View Mode Toggle -->
          <div class="relative flex bg-gray-100 rounded-lg p-1">
            <!-- Sliding background indicator -->
            <div
              class="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out"
              style="left: {viewMode === 'grid'
                ? '4px'
                : 'calc(50% + 2px)'}; width: calc(50% - 6px);"
            ></div>

            <button
              on:click={() => (viewMode = "grid")}
              class="relative z-10 flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-300 {viewMode ===
              'grid'
                ? 'text-teal-600'
                : 'text-gray-500 hover:text-gray-700'}"
            >
              <div class="w-4 h-4">
                <FaTh />
              </div>
            </button>
            <button
              on:click={() => (viewMode = "list")}
              class="relative z-10 flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-300 {viewMode ===
              'list'
                ? 'text-teal-600'
                : 'text-gray-500 hover:text-gray-700'}"
            >
              <div class="w-4 h-4">
                <FaList />
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Plans Grid/List -->
      <div class="mb-8">
        {#if isLoading}
          <!-- Loading State -->
          <div class="text-center py-16">
            <div class="w-12 h-12 animate-spin mx-auto mb-4">
              <svg
                class="w-full h-full text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  class="opacity-25"
                ></circle>
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  class="opacity-75"
                ></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">
              Loading Plans
            </h3>
            <p class="text-gray-600">
              Please wait while we fetch your travel plans...
            </p>
          </div>
        {:else if error}
          <!-- Error State -->
          <div class="text-center py-16">
            <div class="w-12 h-12 text-red-500 mx-auto mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">
              Error Loading Plans
            </h3>
            <p class="text-gray-600 mb-6">{error}</p>
            <button
              on:click={fetchPlans}
              class="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        {:else if filteredPlans.length === 0}
          <!-- Empty State -->
          <div class="text-center py-16">
            <div
              class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <div class="w-12 h-12 text-gray-400">
                <FaSearch />
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">
              No plans found
            </h3>
            <p class="text-gray-600 mb-6">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
            <button
              on:click={handleCreatePlan}
              class="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors duration-300"
            >
              Create Your First Plan
            </button>
          </div>
        {:else}
          <!-- Plans Grid -->
          <div
            class="grid grid-cols-1 {viewMode === 'grid'
              ? 'md:grid-cols-2 lg:grid-cols-3'
              : ''} gap-6"
          >
            {#each filteredPlans as plan, index}
              <div
                class="transform transition-all duration-300 hover:scale-102 {viewMode ===
                'list'
                  ? 'max-w-none'
                  : ''}"
              >
                <PlanCard
                  title={plan.title}
                  location={plan.location}
                  duration={plan.duration}
                  budget={plan.budget}
                  created={plan.created}
                  status={plan.status}
                  on:viewDetail={(event) => handleViewDetail(event.detail)}
                />
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Results Summary -->
      {#if !isLoading && !error && filteredPlans.length > 0}
        <div class="text-center text-gray-600">
          <p>
            Showing {filteredPlans.length} of {transformedPlans.length} plans
          </p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Custom styles for better animations */
  .hover\:scale-102:hover {
    transform: scale(1.02);
  }
</style>
