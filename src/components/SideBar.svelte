<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import FaThLarge from "svelte-icons/fa/FaThLarge.svelte";
    import FaRegCalendar from "svelte-icons/fa/FaRegCalendar.svelte";
    import FaBookOpen from "svelte-icons/fa/FaBookOpen.svelte";
    import FaWallet from "svelte-icons/fa/FaWallet.svelte";
    import FaRobot from "svelte-icons/fa/FaRobot.svelte";
    import FaSignOutAlt from "svelte-icons/fa/FaSignOutAlt.svelte";
    import IoIosSettings from "svelte-icons/io/IoIosSettings.svelte";

    const dispatch = createEventDispatcher();

    let activeItem = "dashboard";

    function setActive(item: string) {
        activeItem = item;
        dispatch("navigate", { page: item });
    }

    function handleSignOut() {
        if (typeof window !== "undefined") {
            // Clear accessToken cookie
            document.cookie =
                "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            // Navigate to home page
            window.location.href = "/";
        }
    }
</script>

<div
    class="min-w-[128px] max-w-[256px] h-full bg-white border border-gray-200 shadow-xl flex flex-col"
    style="box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 2px 0 8px rgba(0, 0, 0, 0.06);"
>
    <!-- Header Section -->
    <div class="flex items-center justify-center p-4 border-b border-gray-200">
        <div class="flex items-center space-x-3">
            <img
                src="/logo.png"
                alt="GoWise Logo"
                class="w-16 h-16 object-contain"
            />
            <h1 class="text-2xl font-bold text-gray-800 tracking-wide">
                GoWise
            </h1>
        </div>
    </div>

    <!-- Navigation Content -->
    <div class="flex-1 p-4">
        <nav class="space-y-2 relative">
            <!-- Sliding indicator -->
            <div
                class="absolute left-0 w-full h-12 bg-[#F0FDFA] rounded-lg transition-all duration-500 ease-in-out transform will-change-transform {activeItem ===
                    'settings' || activeItem === 'signout'
                    ? 'opacity-0'
                    : 'opacity-100'}"
                style="transform: translateY({activeItem === 'dashboard'
                    ? '0'
                    : activeItem === 'plans'
                      ? '56px'
                      : activeItem === 'blog'
                        ? '112px'
                        : activeItem === 'fund'
                          ? '168px'
                          : activeItem === 'chat'
                            ? '224px'
                            : '0'}); box-shadow: 0 2px 8px rgba(13, 148, 136, 0.15);"
            ></div>

            <!-- Dashboard -->
            <button
                class="relative flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ease-in-out group hover:bg-[#F0FDFA] cursor-pointer {activeItem ===
                'dashboard'
                    ? 'bg-[#F0FDFA]'
                    : ''} w-full text-left"
                on:click={() => setActive("dashboard")}
            >
                <div
                    class="w-5 h-5 transition-all duration-300 ease-in-out {activeItem ===
                    'dashboard'
                        ? 'text-[#0D9488] transform scale-110'
                        : 'text-[#374151] group-hover:text-[#0D9488] group-hover:scale-105'}"
                >
                    <FaThLarge />
                </div>
                <span
                    class="font-medium transition-all duration-300 ease-in-out {activeItem ===
                    'dashboard'
                        ? 'text-[#0D9488] font-semibold'
                        : 'text-[#374151] group-hover:text-[#0D9488]'}"
                    >Dashboard</span
                >
            </button>

            <!-- Manage Plans -->
            <button
                class="relative flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ease-in-out group hover:bg-[#F0FDFA] cursor-pointer {activeItem ===
                'plans'
                    ? 'bg-[#F0FDFA]'
                    : ''} w-full text-left"
                on:click={() => setActive("plans")}
            >
                <div
                    class="w-5 h-5 transition-all duration-300 ease-in-out {activeItem ===
                    'plans'
                        ? 'text-[#0D9488] transform scale-110'
                        : 'text-[#374151] group-hover:text-[#0D9488] group-hover:scale-105'}"
                >
                    <FaRegCalendar />
                </div>
                <span
                    class="font-medium transition-all duration-300 ease-in-out {activeItem ===
                    'plans'
                        ? 'text-[#0D9488] font-semibold'
                        : 'text-[#374151] group-hover:text-[#0D9488]'}"
                    >Manage Plans</span
                >
            </button>

            <!-- Blog -->
            <button
                class="relative flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ease-in-out group hover:bg-[#F0FDFA] cursor-pointer {activeItem ===
                'blog'
                    ? 'bg-[#F0FDFA]'
                    : ''} w-full text-left"
                on:click={() => setActive("blog")}
            >
                <div
                    class="w-5 h-5 transition-all duration-300 ease-in-out {activeItem ===
                    'blog'
                        ? 'text-[#0D9488] transform scale-110'
                        : 'text-[#374151] group-hover:text-[#0D9488] group-hover:scale-105'}"
                >
                    <FaBookOpen />
                </div>
                <span
                    class="font-medium transition-all duration-300 ease-in-out {activeItem ===
                    'blog'
                        ? 'text-[#0D9488] font-semibold'
                        : 'text-[#374151] group-hover:text-[#0D9488]'}"
                    >Blog</span
                >
            </button>

            <!-- Common Fund -->
            <button
                class="relative flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ease-in-out group hover:bg-[#F0FDFA] cursor-pointer {activeItem ===
                'fund'
                    ? 'bg-[#F0FDFA]'
                    : ''} w-full text-left"
                on:click={() => setActive("fund")}
            >
                <div
                    class="w-5 h-5 transition-all duration-300 ease-in-out {activeItem ===
                    'fund'
                        ? 'text-[#0D9488] transform scale-110'
                        : 'text-[#374151] group-hover:text-[#0D9488] group-hover:scale-105'}"
                >
                    <FaWallet />
                </div>
                <span
                    class="font-medium transition-all duration-300 ease-in-out {activeItem ===
                    'fund'
                        ? 'text-[#0D9488] font-semibold'
                        : 'text-[#374151] group-hover:text-[#0D9488]'}"
                    >Common Fund</span
                >
            </button>

            <!-- Chat Bot -->
            <button
                class="relative flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ease-in-out group hover:bg-[#F0FDFA] cursor-pointer {activeItem ===
                'chat'
                    ? 'bg-[#F0FDFA]'
                    : ''} w-full text-left"
                on:click={() => setActive("chat")}
            >
                <div
                    class="w-5 h-5 transition-all duration-300 ease-in-out {activeItem ===
                    'chat'
                        ? 'text-[#0D9488] transform scale-110'
                        : 'text-[#374151] group-hover:text-[#0D9488] group-hover:scale-105'}"
                >
                    <FaRobot />
                </div>
                <span
                    class="font-medium transition-all duration-300 ease-in-out {activeItem ===
                    'chat'
                        ? 'text-[#0D9488] font-semibold'
                        : 'text-[#374151] group-hover:text-[#0D9488]'}"
                    >Chat Bot</span
                >
            </button>
        </nav>
    </div>

    <!-- Footer Section -->
    <div class="p-4 border-t border-gray-200">
        <div class="space-y-2">
            <!-- Settings -->
            <button
                class="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ease-in-out group hover:bg-[#F0FDFA] cursor-pointer {activeItem ===
                'settings'
                    ? 'bg-[#F0FDFA]'
                    : ''} w-full text-left"
                on:click={() => setActive("settings")}
            >
                <div
                    class="w-5 h-5 transition-all duration-300 ease-in-out {activeItem ===
                    'settings'
                        ? 'text-[#0D9488] transform scale-110'
                        : 'text-[#374151] group-hover:text-[#0D9488] group-hover:scale-105'}"
                >
                    <IoIosSettings />
                </div>
                <span
                    class="font-medium transition-all duration-300 ease-in-out {activeItem ===
                    'settings'
                        ? 'text-[#0D9488] font-semibold'
                        : 'text-[#374151] group-hover:text-[#0D9488]'}"
                >
                    Settings
                </span>
            </button>

            <!-- Sign Out -->
            <button
                class="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ease-in-out group hover:bg-red-50 cursor-pointer w-full text-left"
                on:click={handleSignOut}
            >
                <div
                    class="w-5 h-5 transition-all duration-300 ease-in-out text-[#374151] group-hover:text-red-500 group-hover:scale-105"
                >
                    <FaSignOutAlt />
                </div>
                <span
                    class="font-medium transition-all duration-300 ease-in-out text-[#374151] group-hover:text-red-500"
                >
                    Sign Out
                </span>
            </button>
        </div>
    </div>
</div>
