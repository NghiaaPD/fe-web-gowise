<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import IoMdPin from "svelte-icons/io/IoMdPin.svelte";
    import IoMdCalendar from "svelte-icons/io/IoMdCalendar.svelte";
    import IoMdCash from "svelte-icons/io/IoMdCash.svelte";
    import IoMdCreate from "svelte-icons/io/IoMdCreate.svelte";
    import IoMdEye from "svelte-icons/io/IoMdEye.svelte";

    const dispatch = createEventDispatcher();

    export let title: string = "Tokyo Adventure";
    export let location: string = "Japan";
    export let duration: string = "7 days";
    export let budget: string = "$2000";
    export let created: string = "1/15/2024";
    export let status: "active" | "draft" | "completed" = "active";
    // export let backgroundImage: string = "";

    let isLoading = false;

    function getStatusColor(status: string) {
        switch (status) {
            case "active":
                return "bg-green-500 text-white shadow-green-200";
            case "draft":
                return "bg-yellow-500 text-white shadow-yellow-200";
            case "completed":
                return "bg-blue-500 text-white shadow-blue-200";
            default:
                return "bg-gray-500 text-white shadow-gray-200";
        }
    }

    function getStatusText(status: string) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function handleEdit() {
        console.log("Edit plan:", title);
    }

    function handleViewDetails() {
        isLoading = true;

        // Add a small delay to show the loading effect
        setTimeout(() => {
            dispatch("viewDetail", {
                title,
                location,
                duration,
                budget,
                created,
                status,
            });
            isLoading = false;
        }, 300);
    }
</script>

<div class="relative group">
    <!-- Main Card Container -->
    <div
        class="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
    >
        <!-- Background Pattern / Image -->
        <div class="absolute inset-0 opacity-5">
            <div
                class="w-full h-full bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600"
            ></div>
            <div
                class="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/50"
            ></div>
        </div>

        <!-- Status Badge -->
        <div class="absolute top-4 right-4 z-10">
            <span
                class="px-3 py-1 rounded-full text-xs font-semibold {getStatusColor(
                    status,
                )} shadow-lg"
            >
                {getStatusText(status)}
            </span>
        </div>

        <!-- Content Container -->
        <div class="relative p-6 space-y-4">
            <!-- Header Section -->
            <div class="flex items-start space-x-3">
                <div
                    class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                >
                    <div class="w-5 h-5 text-white">
                        <IoMdPin />
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <h3
                        class="text-lg font-bold text-gray-800 truncate group-hover:text-teal-600 transition-colors duration-300"
                    >
                        {title}
                    </h3>
                    <p class="text-sm text-gray-500 flex items-center mt-1">
                        <span class="w-4 h-4 mr-1 text-teal-500">
                            <IoMdPin />
                        </span>
                        {location}
                    </p>
                </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 gap-4">
                <!-- Duration -->
                <div
                    class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100"
                >
                    <div class="flex items-center space-x-2">
                        <div class="w-4 h-4 text-blue-500">
                            <IoMdCalendar />
                        </div>
                        <div>
                            <p class="text-xs text-blue-600 font-medium">
                                Duration:
                            </p>
                            <p class="text-sm font-semibold text-blue-800">
                                {duration}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Budget -->
                <div
                    class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100"
                >
                    <div class="flex items-center space-x-2">
                        <div class="w-4 h-4 text-green-500">
                            <IoMdCash />
                        </div>
                        <div>
                            <p class="text-xs text-green-600 font-medium">
                                Budget:
                            </p>
                            <p class="text-sm font-semibold text-green-800">
                                {budget}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Created Date -->
                <div
                    class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100 col-span-2"
                >
                    <div class="flex items-center space-x-2">
                        <div class="w-4 h-4 text-purple-500">
                            <IoMdCreate />
                        </div>
                        <div>
                            <p class="text-xs text-purple-600 font-medium">
                                Created:
                            </p>
                            <p class="text-sm font-semibold text-purple-800">
                                {created}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3 pt-2 relative z-20">
                <!-- Edit Button -->
                <button
                    on:click={handleEdit}
                    class="relative z-10 flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 hover:shadow-md group/edit"
                    style="pointer-events: auto;"
                >
                    <div
                        class="w-4 h-4 group-hover/edit:scale-110 transition-transform duration-200"
                    >
                        <IoMdCreate />
                    </div>
                    <span class="text-sm font-medium">Edit</span>
                </button>

                <!-- View Details Button -->
                <button
                    on:click={handleViewDetails}
                    disabled={isLoading}
                    class="relative z-10 flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg transition-all duration-300 hover:shadow-lg group/view disabled:opacity-50 disabled:cursor-not-allowed"
                    style="pointer-events: auto;"
                >
                    {#if isLoading}
                        <div class="w-4 h-4 animate-spin">
                            <svg
                                class="w-full h-full"
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
                        <span class="text-sm font-medium">Loading...</span>
                    {:else}
                        <div
                            class="w-4 h-4 group-hover/view:scale-110 transition-transform duration-200"
                        >
                            <IoMdEye />
                        </div>
                        <span class="text-sm font-medium">View Details</span>
                    {/if}
                </button>
            </div>
        </div>

        <!-- Hover Glow Effect - DISABLED -->
        <!-- <div
            class="absolute inset-0 bg-gradient-to-r from-teal-400/20 via-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        ></div> -->
    </div>
</div>

<style>
    /* Additional animations - DISABLED */
    /* .group:hover .group\/edit {
        transform: translateY(-1px);
    }

    .group:hover .group\/view {
        transform: translateY(-1px);
        box-shadow: 0 8px 25px rgba(20, 184, 166, 0.4);
    } */
</style>
