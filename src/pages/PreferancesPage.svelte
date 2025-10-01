<script lang="ts">
  import FaLanguage from "svelte-icons/fa/FaLanguage.svelte";
  import IoIosTime from "svelte-icons/io/IoIosTime.svelte";

  let preferences = {
    language: "English",
    timezone: "UTC-8 Pacific Time",
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

  function savePreferences() {
    console.log("Saving preferences:", preferences);
  }
</script>

<div class="max-w-5xl mx-auto">
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-800 m-0">General Preferences</h2>
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
