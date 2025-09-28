<script lang="ts">
    import FundCard from "../components/FundCard.svelte";
    import FaSearch from "svelte-icons/fa/FaSearch.svelte";
    import FaPlus from "svelte-icons/fa/FaPlus.svelte";
    import FaFilter from "svelte-icons/fa/FaFilter.svelte";
    import FaPencilAlt from "svelte-icons/fa/FaPencilAlt.svelte";
    import IoMdGrid from "svelte-icons/io/IoMdGrid.svelte";
    import IoMdList from "svelte-icons/io/IoMdList.svelte";
    import IoMdCash from "svelte-icons/io/IoMdCash.svelte";
    import IoMdPeople from "svelte-icons/io/IoMdPeople.svelte";

    // Fund data
    let funds = [
        {
            title: "Tokyo Adventure",
            contributors: 4,
            timeAgo: "2 hours ago",
            currentAmount: 1450,
            goalAmount: 2000,
            status: "active" as const,
            description:
                "Join us for an amazing adventure in Tokyo! Contribute to make this dream trip come true. We'll explore temples, try street food, and create unforgettable memories.",
        },
        {
            title: "European Explorer",
            contributors: 3,
            timeAgo: "1 day ago",
            currentAmount: 890,
            goalAmount: 3500,
            status: "active" as const,
            description:
                "Multi-city European adventure covering Paris, Rome, and Barcelona. Let's explore the rich culture, history, and cuisine of Europe together.",
        },
        {
            title: "Bali Retreat",
            contributors: 6,
            timeAgo: "3 days ago",
            currentAmount: 1800,
            goalAmount: 1800,
            status: "completed" as const,
            description:
                "Peaceful retreat in Bali with yoga, meditation, and beautiful beaches. This fund has reached its goal and the trip is confirmed!",
        },
        {
            title: "Safari Experience",
            contributors: 2,
            timeAgo: "1 week ago",
            currentAmount: 2100,
            goalAmount: 4200,
            status: "active" as const,
            description:
                "African safari adventure in Kenya. Experience wildlife, stunning landscapes, and local culture in this once-in-a-lifetime journey.",
        },
        {
            title: "Northern Lights",
            contributors: 5,
            timeAgo: "2 weeks ago",
            currentAmount: 150,
            goalAmount: 2800,
            status: "pending" as const,
            description:
                "Chase the Northern Lights in Iceland. A magical winter adventure awaiting your contribution to make it happen.",
        },
        {
            title: "Mediterranean Cruise",
            contributors: 8,
            timeAgo: "1 month ago",
            currentAmount: 5500,
            goalAmount: 5500,
            status: "completed" as const,
            description:
                "Luxury Mediterranean cruise visiting Italy, Greece, and Turkey. This amazing journey has been fully funded!",
        },
    ];

    // Filter and search state
    let searchQuery = "";
    let selectedStatus = "all";
    let viewMode = "grid"; // grid or list
    let sortBy = "recent"; // recent, amount, progress

    // Computed filtered funds
    $: filteredFunds = funds
        .filter((fund) => {
            const matchesSearch =
                fund.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                fund.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            const matchesStatus =
                selectedStatus === "all" || fund.status === selectedStatus;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === "recent") {
                // Sort by time ago (more recent first)
                return a.timeAgo.localeCompare(b.timeAgo);
            } else if (sortBy === "amount") {
                return b.currentAmount - a.currentAmount;
            } else if (sortBy === "progress") {
                const aProgress = (a.currentAmount / a.goalAmount) * 100;
                const bProgress = (b.currentAmount / b.goalAmount) * 100;
                return bProgress - aProgress;
            }
            return 0;
        });

    // Statistics
    $: stats = {
        total: funds.length,
        active: funds.filter((f) => f.status === "active").length,
        completed: funds.filter((f) => f.status === "completed").length,
        totalContributors: funds.reduce((sum, f) => sum + f.contributors, 0),
        totalRaised: funds.reduce((sum, f) => sum + f.currentAmount, 0),
    };

    function handleCreateFund() {
        console.log("Create new fund");
    }

    function handleContribute(event: CustomEvent) {
        console.log("Contribute to fund:", event.detail);
        // TODO: Implement contribute functionality
    }

    function handleAddExpense(event: CustomEvent) {
        console.log("Add expense to fund:", event.detail);
        // TODO: Implement add expense functionality
    }

    function handleViewFundDetail(event: CustomEvent) {
        console.log("View fund details:", event.detail);
        // TODO: Implement fund detail view
    }

    function formatCurrency(amount: number): string {
        return `$${amount.toLocaleString()}`;
    }
</script>

<div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header Section -->
    <div class="mb-8">
        <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
            <!-- Title and Description -->
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">
                    Common Fund
                </h1>
                <p class="text-gray-600">
                    Collaborate and contribute to shared travel experiences 💰
                </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
                <button
                    on:click={handleCreateFund}
                    class="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                    <div class="w-4 h-4">
                        <FaPlus />
                    </div>
                    <span class="font-medium">Create Fund</span>
                </button>

                <button
                    class="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md"
                >
                    <div class="w-4 h-4">
                        <FaFilter />
                    </div>
                    <span class="font-medium">Filter</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 mb-1">Total Funds</p>
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
                    <p class="text-sm text-gray-600 mb-1">Contributors</p>
                    <p class="text-2xl font-bold text-purple-600">
                        {stats.totalContributors}
                    </p>
                </div>
                <div
                    class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"
                >
                    <div class="w-4 h-4 text-purple-600">
                        <IoMdPeople />
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 mb-1">Total Raised</p>
                    <p class="text-2xl font-bold text-teal-600">
                        {formatCurrency(stats.totalRaised)}
                    </p>
                </div>
                <div
                    class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center"
                >
                    <div class="w-4 h-4 text-teal-600">
                        <IoMdCash />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters and Search Section -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
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
                    placeholder="Search funds by title or description..."
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
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
            </select>

            <!-- Sort By -->
            <select
                bind:value={sortBy}
                class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
            >
                <option value="recent">Most Recent</option>
                <option value="amount">Highest Amount</option>
                <option value="progress">Best Progress</option>
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

    <!-- Recent Activity Section -->
    <div class="mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">
                Recent Activity
            </h3>
            <div class="text-center py-8">
                <div
                    class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <div class="w-8 h-8 text-gray-400">
                        <IoMdCash />
                    </div>
                </div>
                <p class="text-gray-600">Select a fund to view activity</p>
            </div>
        </div>
    </div>

    <!-- Funds Grid/List -->
    <div class="mb-8">
        {#if filteredFunds.length === 0}
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
                    No funds found
                </h3>
                <p class="text-gray-600 mb-6">
                    Try adjusting your search or filters to find what you're
                    looking for.
                </p>
                <button
                    on:click={handleCreateFund}
                    class="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors duration-300"
                >
                    Create Your First Fund
                </button>
            </div>
        {:else}
            <!-- Funds Grid -->
            <div
                class="grid grid-cols-1 {viewMode === 'grid'
                    ? 'md:grid-cols-2 lg:grid-cols-3'
                    : ''} gap-6"
            >
                {#each filteredFunds as fund, index}
                    <div
                        class="transform transition-all duration-300 hover:scale-102 {viewMode ===
                        'list'
                            ? 'max-w-none'
                            : ''}"
                    >
                        <FundCard
                            title={fund.title}
                            contributors={fund.contributors}
                            timeAgo={fund.timeAgo}
                            currentAmount={fund.currentAmount}
                            goalAmount={fund.goalAmount}
                            status={fund.status}
                            description={fund.description}
                            on:contribute={handleContribute}
                            on:addExpense={handleAddExpense}
                            on:viewDetail={handleViewFundDetail}
                        />
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Results Summary -->
    {#if filteredFunds.length > 0}
        <div class="text-center text-gray-600">
            <p>Showing {filteredFunds.length} of {funds.length} funds</p>
        </div>
    {/if}
</div>

<style>
    /* Custom styles for better animations */
    .hover\:scale-102:hover {
        transform: scale(1.02);
    }
</style>
