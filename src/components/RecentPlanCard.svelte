<script lang="ts">
    import IoMdPin from 'svelte-icons/io/IoMdPin.svelte';

    // Props để tái sử dụng component
    export let title: string = "European Explorer";
    export let location: string = "Europe";
    export let duration: string = "14 days";
    export let status: "draft" | "published" | "completed" = "draft";
    export let statusColor: string = getStatusColor(status);
    export let iconColor: string = "#10B981"; // emerald-500

    // Function để lấy màu status
    function getStatusColor(status: "draft" | "published" | "completed"): string {
        switch (status) {
            case "draft":
                return "#F59E0B"; // amber-500
            case "published":
                return "#10B981"; // emerald-500
            case "completed":
                return "#6366F1"; // indigo-500
            default:
                return "#F59E0B";
        }
    }

    // Update status color when status changes
    $: statusColor = getStatusColor(status);
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 cursor-pointer group">
    <!-- Header với icon và status -->
    <div class="flex items-start justify-between mb-3">
        <!-- Icon container -->
        <div class="flex-shrink-0">
            <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                style="background-color: {iconColor}20;"
            >
                <div class="w-6 h-6" style="color: {iconColor};">
                    <IoMdPin />
                </div>
            </div>
        </div>

        <!-- Status badge -->
        <div 
            class="px-3 py-1 rounded-full text-xs font-medium capitalize"
            style="background-color: {statusColor}20; color: {statusColor};"
        >
            {status}
        </div>
    </div>

    <!-- Content -->
    <div class="space-y-2">
        <!-- Title -->
        <h3 class="text-lg font-semibold text-gray-900 group-hover:text-teal-600 transition-colors duration-200">
            {title}
        </h3>

        <!-- Location và Duration -->
        <div class="flex items-center text-sm text-gray-500 space-x-2">
            <span>{location}</span>
            <span>•</span>
            <span>{duration}</span>
        </div>
    </div>

    <!-- Hover arrow indicator -->
    <div class="flex justify-end mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <svg class="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
    </div>
</div>
