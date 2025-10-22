<script lang="ts">
  import FaLanguage from "svelte-icons/fa/FaLanguage.svelte";
  import FaGlobeAmericas from "svelte-icons/fa/FaGlobeAmericas.svelte";
  import FaMapMarkerAlt from "svelte-icons/fa/FaMapMarkerAlt.svelte";
  import { onMount } from "svelte";
  import { showNotification } from "$lib/index";

  interface UserData {
    id: string;
    firstName?: string;
    lastName?: string;
    language?: string;
    region?: string;
    city?: string;
    isPremium?: boolean;
    isAddCreditCard?: boolean;
  }

  type Country = { id: string; name: string };
  type City = { name: string };

  let userData = $state<UserData | null>(null);
  let userId = $state("");
  let isLoading = $state(false);
  let countries = $state<Country[]>([]);
  let cities = $state<City[]>([]);
  let loadingCountries = $state(false);
  let loadingCities = $state(false);
  let selectedCountryId = $state("");
  let hasChanges = $state(false);

  let preferences = $state({
    language: "",
    region: "",
    city: "",
  });

  let originalPreferences = $state({
    language: "",
    region: "",
    city: "",
  });

  const languages = [
    { value: "en", label: "English" },
    { value: "vi", label: "Vietnamese" },
  ];

  // Get user token
  function getAuthToken() {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }

  // Load countries from API
  async function loadCountries() {
    try {
      loadingCountries = true;
      const res = await fetch(
        `https://data-api.oxilor.com/rest/countries?key=${import.meta.env.VITE_OXILOR_API_KEY}`
      );
      if (res.ok) {
        const data = await res.json();
        countries = data;
      } else {
        console.error("Failed to load countries");
      }
    } catch (err) {
      console.error("Error loading countries:", err);
    } finally {
      loadingCountries = false;
    }
  }

  // Load cities based on country
  async function loadCities(countryId: string) {
    if (!countryId) {
      cities = [];
      return;
    }
    try {
      loadingCities = true;
      const res = await fetch(
        `https://data-api.oxilor.com/rest/child-regions?key=${import.meta.env.VITE_OXILOR_API_KEY}&parentId=${countryId}`
      );
      if (res.ok) {
        const data = await res.json();
        cities = data.edges.map((edge: any) => ({ name: edge.node.name }));
      } else {
        console.error("Failed to load cities");
      }
    } catch (err) {
      console.error("Error loading cities:", err);
    } finally {
      loadingCities = false;
    }
  }

  // Check if preferences have changed
  function checkForChanges() {
    hasChanges =
      preferences.language !== originalPreferences.language ||
      preferences.region !== originalPreferences.region ||
      preferences.city !== originalPreferences.city;
  }

  // Watch for changes in selectedCountryId to load cities
  $effect(() => {
    if (selectedCountryId) {
      loadCities(selectedCountryId);
    }
  });

  // Watch for changes in preferences
  $effect(() => {
    checkForChanges();
  });

  // Load user data
  async function loadUserData() {
    if (!userId) return;

    try {
      const token = getAuthToken();
      if (!token) {
        window.location.href = "/";
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const response = await res.json();
        userData = response.data as UserData;
        preferences.language = userData?.language || "en";
        preferences.region = userData?.region || "";
        preferences.city = userData?.city || "";

        // Store original values
        originalPreferences.language = preferences.language;
        originalPreferences.region = preferences.region;
        originalPreferences.city = preferences.city;

        // Find and set selected country ID for city loading
        if (preferences.region) {
          const country = countries.find((c) => c.name === preferences.region);
          if (country) {
            selectedCountryId = country.id;
          }
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }

  // Update language
  async function updateLanguage(newLanguage: string) {
    if (!userId) return;

    try {
      isLoading = true;
      const token = getAuthToken();
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/users/${userId}/language`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ language: newLanguage }),
        }
      );

      if (res.ok) {
        preferences.language = newLanguage;
        showNotification(
          { message: "Language updated successfully!" },
          "success"
        );
      } else {
        showNotification({ message: "Failed to update language" }, "error");
      }
    } catch (error) {
      console.error("Error updating language:", error);
      showNotification({ message: "Error updating language" }, "error");
    } finally {
      isLoading = false;
    }
  }

  // Update region
  async function updateRegion(newRegion: string) {
    if (!userId) return;

    try {
      isLoading = true;
      const token = getAuthToken();
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/users/${userId}/region`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ region: newRegion }),
        }
      );

      if (res.ok) {
        preferences.region = newRegion;
        showNotification(
          { message: "Region updated successfully!" },
          "success"
        );
      } else {
        showNotification({ message: "Failed to update region" }, "error");
      }
    } catch (error) {
      console.error("Error updating region:", error);
      showNotification({ message: "Error updating region" }, "error");
    } finally {
      isLoading = false;
    }
  }

  // Update city
  async function updateCity(newCity: string) {
    if (!userId) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/users/${userId}/city`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ city: newCity }),
        }
      );

      if (res.ok) {
        preferences.city = newCity;
        originalPreferences.city = newCity;
        showNotification({ message: "City updated successfully!" }, "success");
      } else {
        showNotification({ message: "Failed to update city" }, "error");
      }
    } catch (error) {
      console.error("Error updating city:", error);
      showNotification({ message: "Error updating city" }, "error");
    }
  }

  // Handle preference changes (just update local state, don't call API immediately)
  function handleLanguageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    preferences.language = target.value;
  }

  function handleRegionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    preferences.region = target.value;

    // Find country ID and load cities
    const country = countries.find((c) => c.name === target.value);
    if (country) {
      selectedCountryId = country.id;
      preferences.city = ""; // Reset city when region changes
    }
  }

  function handleCityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    preferences.city = target.value;
  }

  // Save all changes
  async function saveAllChanges() {
    if (!hasChanges) return;

    try {
      isLoading = true;

      // Update language if changed
      if (preferences.language !== originalPreferences.language) {
        await updateLanguage(preferences.language);
      }

      // Update region if changed
      if (preferences.region !== originalPreferences.region) {
        await updateRegion(preferences.region);
      }

      // Update city if changed
      if (preferences.city !== originalPreferences.city) {
        await updateCity(preferences.city);
      }

      // Update original values after successful save
      originalPreferences.language = preferences.language;
      originalPreferences.region = preferences.region;
      originalPreferences.city = preferences.city;

      hasChanges = false;
      showNotification(
        { message: "All preferences updated successfully!" },
        "success"
      );
    } catch (error) {
      console.error("Error saving changes:", error);
      showNotification({ message: "Error saving preferences" }, "error");
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    // Extract userId from URL
    const pathSegments = window.location.pathname.split("/");
    userId = pathSegments[1];

    // Load countries first
    loadCountries();

    if (userId) {
      loadUserData();
    }
  });
</script>

<div class="max-w-5xl mx-auto">
  <div class="mb-6">
    <h2 class="text-xl font-semibold text-gray-800 m-0">General Preferences</h2>
  </div>

  <!-- Loading state -->
  {#if isLoading}
    <div class="flex justify-center items-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"
      ></div>
      <span class="ml-2 text-gray-600">Updating...</span>
    </div>
  {/if}

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
          value={preferences.language}
          onchange={handleLanguageChange}
          disabled={isLoading}
          class="w-full p-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#each languages as language}
            <option value={language.value}>{language.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Region/Country Section -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="mb-4">
        <label
          for="region"
          class="flex items-center text-sm font-medium text-gray-700 mb-2"
        >
          <div class="w-4 h-4 mr-2 text-gray-600">
            <FaGlobeAmericas />
          </div>
          Region/Country
        </label>
        <select
          id="region"
          value={preferences.region}
          onchange={handleRegionChange}
          disabled={isLoading || loadingCountries}
          class="w-full p-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            {loadingCountries ? "Loading countries..." : "Select your country"}
          </option>
          {#each countries as country}
            <option value={country.name}>{country.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- City/State Section -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <div class="mb-4">
        <label
          for="city"
          class="flex items-center text-sm font-medium text-gray-700 mb-2"
        >
          <div class="w-4 h-4 mr-2 text-gray-600">
            <FaMapMarkerAlt />
          </div>
          City/State
        </label>
        <select
          id="city"
          value={preferences.city}
          onchange={handleCityChange}
          disabled={isLoading || loadingCities || !selectedCountryId}
          class="w-full p-3 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            {loadingCities
              ? "Loading cities..."
              : !selectedCountryId
                ? "Select a country first"
                : "Select your city"}
          </option>
          {#each cities as city}
            <option value={city.name}>{city.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Update Button (only show when there are changes) -->
    {#if hasChanges}
      <div class="flex justify-end">
        <button
          onclick={saveAllChanges}
          disabled={isLoading}
          class="bg-teal-600 text-white px-6 py-3 rounded-md font-medium transition-all duration-200 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {#if isLoading}
            <div class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Updating...
            </div>
          {:else}
            Update Preferences
          {/if}
        </button>
      </div>
    {/if}

    <!-- Info Section -->
    <div class="bg-teal-50 border border-teal-200 rounded-lg p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-teal-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-teal-700">
            These preferences will affect your experience across the
            application.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
