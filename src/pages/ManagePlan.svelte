<script lang="ts">
    import PlanCard from "../components/PlanCard.svelte";
    import ViewDetail from "../components/ViewDetail.svelte";
    import { fade, slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import FaSearch from "svelte-icons/fa/FaSearch.svelte";
    import FaPlus from "svelte-icons/fa/FaPlus.svelte";
    import FaFilter from "svelte-icons/fa/FaFilter.svelte";
    import FaPencilAlt from "svelte-icons/fa/FaPencilAlt.svelte";
    import IoMdGrid from "svelte-icons/io/IoMdGrid.svelte";
    import IoMdList from "svelte-icons/io/IoMdList.svelte";

    // View state
    let currentView = "list"; // "list" or "detail"
    let isTransitioning = false;
    type Plan = {
        title: string;
        location: string;
        duration: string;
        budget: string;
        created: string;
        status: "active" | "draft" | "completed";
        description: string;
    };
    let selectedPlan: Plan | null = null;

    let plans = [
        {
            title: "Tokyo Adventure",
            location: "Japan",
            duration: "7 days",
            budget: "$2000",
            created: "1/15/2024",
            status: "active" as const,
            description:
                "Explore the vibrant city of Tokyo and its surroundings.",
        },
        {
            title: "European Explorer",
            location: "Europe",
            duration: "14 days",
            budget: "$3500",
            created: "2/20/2024",
            status: "draft" as const,
            description: "A grand tour across Europe's most iconic cities.",
        },
        {
            title: "Bali Retreat",
            location: "Indonesia",
            duration: "10 days",
            budget: "$1800",
            created: "3/10/2024",
            status: "completed" as const,
            description: "Relax and unwind on the beautiful beaches of Bali.",
        },
        {
            title: "Safari Experience",
            location: "Kenya",
            duration: "12 days",
            budget: "$4200",
            created: "3/25/2024",
            status: "active" as const,
            description:
                "Witness the majestic wildlife of Kenya on a safari adventure.",
        },
        {
            title: "Northern Lights",
            location: "Iceland",
            duration: "5 days",
            budget: "$2800",
            created: "4/05/2024",
            status: "draft" as const,
            description: "Chase the magical aurora borealis in Iceland.",
        },
        {
            title: "Mediterranean Cruise",
            location: "Italy & Greece",
            duration: "21 days",
            budget: "$5500",
            created: "4/15/2024",
            status: "completed" as const,
            description:
                "Sail through the Mediterranean and explore Italy and Greece.",
        },
    ];

    // Filter and search state
    let searchQuery = "";
    let selectedStatus = "all";
    let viewMode = "grid"; // grid or list
    let sortBy = "created"; // created, budget, duration

    // Computed filtered plans
    $: filteredPlans = plans
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
                return (
                    new Date(b.created).getTime() -
                    new Date(a.created).getTime()
                );
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
        total: plans.length,
        active: plans.filter((p) => p.status === "active").length,
        draft: plans.filter((p) => p.status === "draft").length,
        completed: plans.filter((p) => p.status === "completed").length,
    };

    function handleCreatePlan() {
        console.log("Create new plan");
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
            <ViewDetail plan={selectedPlan} on:back={handleBackToList} />
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
                        <h1 class="text-3xl font-bold text-gray-800 mb-2">
                            Manage Plans
                        </h1>
                        <p class="text-gray-600">
                            Organize and manage all your travel plans in one
                            place ✈️
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
                <div
                    class="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">
                                Total Plans
                            </p>
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

                <div
                    class="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
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

                <div
                    class="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
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

                <div
                    class="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
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
                                <IoMdGrid />
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
                                <IoMdList />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Plans Grid/List -->
            <div class="mb-8">
                {#if filteredPlans.length === 0}
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
                            Try adjusting your search or filters to find what
                            you're looking for.
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
                                    on:viewDetail={(event) =>
                                        handleViewDetail(event.detail)}
                                />
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Results Summary -->
            {#if filteredPlans.length > 0}
                <div class="text-center text-gray-600">
                    <p>
                        Showing {filteredPlans.length} of {plans.length} plans
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
