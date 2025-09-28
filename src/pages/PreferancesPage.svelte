<script lang="ts">
    import FaLanguage from "svelte-icons/fa/FaLanguage.svelte";
    import IoIosTime from "svelte-icons/io/IoIosTime.svelte";
    import IoMdSunny from "svelte-icons/io/IoMdSunny.svelte";
    import IoMdMoon from "svelte-icons/io/IoMdMoon.svelte";
    import IoMdPhonePortrait from "svelte-icons/io/IoMdPhonePortrait.svelte";

    let preferences = {
        language: "English",
        timezone: "UTC-8 Pacific Time",
        theme: "light",
    };

    const languages = [
        "English",
        "Spanish",
        "French",
        "German",
        "Japanese",
        "Chinese",
    ];

    const timezones = [
        "UTC-12 Baker Island",
        "UTC-8 Pacific Time",
        "UTC-5 Eastern Time",
        "UTC+0 Greenwich Mean Time",
        "UTC+1 Central European Time",
        "UTC+8 China Standard Time",
        "UTC+9 Japan Standard Time",
    ];

    function selectTheme(theme: string) {
        preferences.theme = theme;
        console.log("Theme changed to:", theme);
    }

    function savePreferences() {
        console.log("Saving preferences:", preferences);
    }
</script>

<div class="max-w-5xl mx-auto">
    <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-800 m-0">
            General Preferences
        </h2>
    </div>

    <div class="space-y-8">
        <!-- Language Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="mb-4">
                <label
                    for="language"
                    class="flex items-center text-sm font-medium text-gray-700 mb-2"
                >
                    <div class="w-4 h-4 mr-2 text-gray-600">
                        <FaLanguage />
                    </div>
                    Language
                </label>
                <select
                    id="language"
                    bind:value={preferences.language}
                    class="w-full p-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 transition-colors duration-200"
                >
                    {#each languages as language}
                        <option value={language}>{language}</option>
                    {/each}
                </select>
            </div>
        </div>

        <!-- Time Zone Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="mb-4">
                <label
                    for="timezone"
                    class="flex items-center text-sm font-medium text-gray-700 mb-2"
                >
                    <div class="w-4 h-4 mr-2 text-gray-600">
                        <IoIosTime />
                    </div>
                    Time Zone
                </label>
                <select
                    id="timezone"
                    bind:value={preferences.timezone}
                    class="w-full p-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 transition-colors duration-200"
                >
                    {#each timezones as timezone}
                        <option value={timezone}>{timezone}</option>
                    {/each}
                </select>
            </div>
        </div>

        <!-- Theme & Display Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">
                    Theme & Display
                </h3>

                <div class="mb-4">
                    <span
                        id="theme-label"
                        class="block text-sm font-medium text-gray-700 mb-3"
                    >
                        Theme
                    </span>

                    <div
                        class="grid grid-cols-3 gap-4"
                        role="group"
                        aria-labelledby="theme-label"
                    >
                        <!-- Light Theme -->
                        <button
                            class="flex flex-col items-center p-4 border-2 rounded-lg transition-all duration-200 {preferences.theme ===
                            'light'
                                ? 'border-teal-600 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'}"
                            on:click={() => selectTheme("light")}
                        >
                            <div
                                class="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-2"
                            >
                                <div class="w-6 h-6 text-yellow-500">
                                    <IoMdSunny />
                                </div>
                            </div>
                            <span class="text-sm font-medium text-gray-700"
                                >Light</span
                            >
                        </button>

                        <!-- Dark Theme -->
                        <button
                            class="flex flex-col items-center p-4 border-2 rounded-lg transition-all duration-200 {preferences.theme ===
                            'dark'
                                ? 'border-teal-600 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'}"
                            on:click={() => selectTheme("dark")}
                        >
                            <div
                                class="w-12 h-12 bg-gray-800 border border-gray-200 rounded-lg flex items-center justify-center mb-2"
                            >
                                <div class="w-6 h-6 text-gray-300">
                                    <IoMdMoon />
                                </div>
                            </div>
                            <span class="text-sm font-medium text-gray-700"
                                >Dark</span
                            >
                        </button>

                        <!-- Auto Theme -->
                        <button
                            class="flex flex-col items-center p-4 border-2 rounded-lg transition-all duration-200 {preferences.theme ===
                            'auto'
                                ? 'border-teal-600 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'}"
                            on:click={() => selectTheme("auto")}
                        >
                            <div
                                class="w-12 h-12 bg-gradient-to-r from-white to-gray-800 border border-gray-200 rounded-lg flex items-center justify-center mb-2"
                            >
                                <div class="w-6 h-6 text-gray-600">
                                    <IoMdPhonePortrait />
                                </div>
                            </div>
                            <span class="text-sm font-medium text-gray-700"
                                >Auto</span
                            >
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
            <button
                class="bg-teal-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 hover:bg-teal-700"
                on:click={savePreferences}
            >
                Save Preferences
            </button>
        </div>
    </div>
</div>
