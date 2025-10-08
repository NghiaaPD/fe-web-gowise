<script lang="ts">
  import DeletePlanDialog from "../components/deletePlanDialog.svelte";
  import { showNotification } from "$lib/index";
  
  import PlanCard from "../components/PlanCard.svelte";
  import ViewDetail from "../components/ViewDetail.svelte";
  import { fade, slide } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { onMount } from "svelte";
  import FaSearch from "svelte-icons/fa/FaSearch.svelte";
  import FaPlus from "svelte-icons/fa/FaPlus.svelte";
  import FaPencilAlt from "svelte-icons/fa/FaPencilAlt.svelte";
  import FaTh from "svelte-icons/fa/FaTh.svelte";
  import FaList from "svelte-icons/fa/FaList.svelte";

  let showDeleteDialog = false;
  let planToDelete: any = null;

  function handleDeleteDialogCancel() {
    showDeleteDialog = false;
    planToDelete = null;
  }

  // Called when delete button is clicked on a plan card
  function handleDeletePlan(plan: any) {
    showDeleteDialog = true;
    planToDelete = plan;
  }

  // Called when user confirms delete in the dialog
  async function handleDeleteDialogConfirm() {
    if (!planToDelete) return;
    const userId = getUserIdFromToken();
    const planId =
      planToDelete._id?.$oid ||
      planToDelete.plan_content?.plan_id ||
      planToDelete.plan_id;
    if (!userId || !planId) {
      showDeleteDialog = false;
      planToDelete = null;
      return;
    }
    try {
      const response = await fetch(
        `http://nghiapd.ddns.net:8081/plans/${userId}/${planId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        plans = plans.filter(
          (p) =>
            (p._id?.$oid || p.plan_content?.plan_id || p.plan_id) !== planId
        );
        showNotification(
          {
            title: "Plan Deleted",
            message: "The plan was deleted successfully.",
          },
          "success"
        );
      } else {
        // Optionally handle error
      }
    } catch (e) {
      // Optionally handle error
    } finally {
      showDeleteDialog = false;
      planToDelete = null;
    }
  }
  // Edit plan: save plan data to localStorage and route to planResults
  function handleEditPlan(plan: any) {
    // Save the full plan_content if available, else save the plan object
    const planData = plan.plan_content ? { ...plan.plan_content } : { ...plan };
    localStorage.setItem("travelPlanData", JSON.stringify(planData));
    window.location.href = "/planResults";
  }

  // View state
  let currentView = "list"; // "list" or "detail"
  let isTransitioning = false;
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
  let selectedPlan: Plan | null = null;

  // API state
  let plans: Plan[] = [];
  let isLoading = true;
  let error: string | null = null;

  let userId: string | null = null;

  // Helper to get userId from JWT token in cookies
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

  // Fetch plans from API
  async function fetchPlans() {
    try {
      isLoading = true;
      error = null;

      userId = getUserIdFromToken();
      if (!userId) {
        error = "Unable to get user ID from token.";
        isLoading = false;
        return;
      }

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
        plans = data.plans || [];
      } else {
        error = "Failed to load plans. Please try again.";
      }
    } catch (err) {
      error = "An error occurred while loading plans.";
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    fetchPlans();
  });
  // Get transformed selected plan for ViewDetail
  $: selectedPlanTransformed = selectedPlan
    ? {
        ...selectedPlan,
        title: selectedPlan.title,
        location: selectedPlan.location,
        duration: selectedPlan.duration,
        budget: selectedPlan.budget,
        created: selectedPlan.created,
        status: selectedPlan.status ?? "active",
        description: selectedPlan.description,
      }
    : undefined;

  // Filter and search state
  let searchQuery = "";
  let selectedStatus = "all";
  let viewMode = "grid"; // grid or list
  let sortBy = "created"; // created, budget, duration

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

  async function handleViewDetail(plan: any) {
    isTransitioning = true;
    selectedPlan = null;
    currentView = "list";

    // Always get userId from access token in cookies
    const userId = getUserIdFromToken();
    // Always get planId from the plan object as received from the initial plans list
    const planId = plan._id?.$oid || plan.plan_content?.plan_id || plan.plan_id;

    try {
      if (!userId || !planId) {
        error = "Missing user or plan ID.";
        isTransitioning = false;
        return;
      }
      console.log("[ViewDetail] Fetching detail:", { userId, planId });
      const response = await fetch(
        `http://nghiapd.ddns.net:8081/plans/${userId}/${planId}`
      );
      if (!response.ok) {
        error = "Failed to load plan details.";
        isTransitioning = false;
        return;
      }
      const data = await response.json();
      console.log("[ViewDetail] API response:", data);
      const planRaw = data.plan || data;
      // Merge itinerary_data and root-level fields into plan_content for consistency
      let content = { ...(planRaw.plan_content || {}) };
      // If itinerary_data exists, merge its fields in (but don't overwrite plan_content fields)
      if (
        planRaw.itinerary_data &&
        typeof planRaw.itinerary_data === "object"
      ) {
        content = { ...planRaw.itinerary_data, ...content };
      }
      // Merge root-level fields (flightOptions, hotelOptions, itineraryDays, selectedInterests, etc.) if not present in content
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
        if (planRaw[key] !== undefined && content[key] === undefined) {
          content[key] = planRaw[key];
        }
      }
      const startDate = content.startDate || content.start_date;
      const endDate = content.endDate || content.end_date;
      const duration =
        startDate && endDate
          ? `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
          : "Unknown";
      selectedPlan = {
        ...planRaw,
        plan_content: content,
        title: content.destination
          ? `Trip to ${content.destination}`
          : "Unknown Plan",
        location: content.destination || "Unknown",
        duration,
        budget: content.budget ? `$${content.budget}` : "$0",
        created: planRaw.created_at
          ? new Date(planRaw.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
        status: planRaw.status || "active",
        description: `Travel plan for ${content.participants || "1"} ${content.participants === "1" ? "person" : "people"} to ${content.destination || "destination"}`,
      };
      currentView = "detail";
    } catch (e) {
      error = "An error occurred while loading plan details.";
      console.error("[ViewDetail] Error fetching plan detail:", e);
    } finally {
      isTransitioning = false;
    }
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
            <p class="text-gray-600 mb-6">
              An error occurred while loading plans.
            </p>
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
                  on:viewDetail={() => handleViewDetail(plan)}
                  on:edit={(event) => handleEditPlan(plan)}
                  on:delete={() => handleDeletePlan(plan)}
                />
              </div>
            {/each}
            <DeletePlanDialog
              open={showDeleteDialog}
              planTitle={planToDelete ? planToDelete.title : ""}
              on:cancel={handleDeleteDialogCancel}
              on:confirm={handleDeleteDialogConfirm}
            />
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
