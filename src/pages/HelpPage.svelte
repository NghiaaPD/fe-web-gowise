<script lang="ts">
    import IoIosBookmarks from "svelte-icons/io/IoIosBookmarks.svelte";
    import IoIosHelpCircleOutline from "svelte-icons/io/IoIosHelpCircleOutline.svelte";
    import IoMdChatbubbles from "svelte-icons/io/IoMdChatbubbles.svelte";
    import FaPlus from "svelte-icons/fa/FaPlus.svelte";

    const helpItems = [
        {
            id: 1,
            title: "Getting Started",
            description: "Learn the basics of using Timeline",
            icon: IoIosBookmarks,
            color: "teal",
        },
        {
            id: 2,
            title: "FAQs",
            description: "Find answers to common questions",
            icon: IoIosHelpCircleOutline,
            color: "teal",
        },
        {
            id: 3,
            title: "Contact Support",
            description: "Get help from our support team",
            icon: IoMdChatbubbles,
            color: "blue",
        },
        {
            id: 4,
            title: "Feature Requests",
            description: "Suggest new features",
            icon: FaPlus,
            color: "green",
        },
    ];

    function handleHelpItemClick(item: any) {
        console.log("Help item clicked:", item.title);
    }

    function getIconColor(color: string): string {
        const colors: Record<string, string> = {
            teal: "text-teal-600",
            blue: "text-blue-600",
            green: "text-green-600",
        };
        return colors[color] || "text-gray-600";
    }

    function getBgColor(color: string): string {
        const colors: Record<string, string> = {
            teal: "bg-teal-50",
            blue: "bg-blue-50",
            green: "bg-green-50",
        };
        return colors[color] || "bg-gray-50";
    }
</script>

<div class="max-w-5xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each helpItems as item}
            <button
                class="bg-white rounded-lg border border-gray-200 p-6 text-left hover:shadow-md transition-shadow duration-200 hover:border-gray-300"
                on:click={() => handleHelpItemClick(item)}
            >
                <div class="flex items-start">
                    <div
                        class="w-12 h-12 {getBgColor(
                            item.color,
                        )} rounded-lg flex items-center justify-center mr-4 flex-shrink-0"
                    >
                        <div class="w-6 h-6 {getIconColor(item.color)}">
                            <svelte:component this={item.icon} />
                        </div>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-base font-medium text-gray-900 mb-2">
                            {item.title}
                        </h3>
                        <p class="text-sm text-gray-600 leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                </div>
            </button>
        {/each}
    </div>

    <!-- Additional Help Resources -->
    <div class="mt-12 bg-white rounded-lg border border-gray-200 p-8">
        <div class="text-center">
            <div
                class="w-16 h-16 bg-teal-50 rounded-lg flex items-center justify-center mx-auto mb-4"
            >
                <div class="w-8 h-8 text-teal-600">
                    <IoMdChatbubbles />
                </div>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">
                Need More Help?
            </h3>
            <p class="text-gray-600 mb-6 max-w-md mx-auto">
                Can't find what you're looking for? Our support team is here to
                help you with any questions or issues.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    class="bg-teal-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 hover:bg-teal-700"
                    on:click={() => console.log("Contact support clicked")}
                >
                    Contact Support
                </button>
                <button
                    class="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors duration-200 hover:bg-gray-50"
                    on:click={() => console.log("Browse documentation clicked")}
                >
                    Browse Documentation
                </button>
            </div>
        </div>
    </div>

    <!-- Popular Articles Section -->
    <div class="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Popular Articles</h3>
        <div class="space-y-3">
            {#each ["How to set up your first project", "Managing team permissions", "Understanding billing cycles", "Troubleshooting common issues"] as article}
                <button
                    class="block w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    on:click={() => console.log("Article clicked:", article)}
                >
                    <span class="text-sm text-gray-700 hover:text-teal-600">
                        {article}
                    </span>
                </button>
            {/each}
        </div>
    </div>
</div>
