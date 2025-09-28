<script lang="ts">
  /// <reference types="vite/client" />
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import FaUser from "svelte-icons/fa/FaUser.svelte";
  import FaGlobe from "svelte-icons/fa/FaGlobe.svelte";
  import { showNotification } from "$lib/index";

  type Country = { id: string; name: string };
  type City = { name: string };

  const dispatch = createEventDispatcher();

  let firstName = $state("");
  let lastName = $state("");
  let country = $state("");
  let city = $state("");
  let loading = $state(false);
  let countries = $state<Country[]>([]);
  let cities = $state<City[]>([]);
  let selectedCountryId = $state("");

  // Function to decode JWT token and extract user_id
  function decodeJWT(token: string) {
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }

  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts[1]?.split(";").shift();
  }

  onMount(async () => {
    try {
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
    }
  });

  async function loadCities(countryId: string) {
    if (!countryId) {
      cities = [];
      return;
    }
    try {
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
    }
  }

  $effect(() => {
    if (selectedCountryId) {
      loadCities(selectedCountryId);
    }
  });

  async function handleSubmit() {
    loading = true;
    try {
      const token = getCookie("accessToken");
      if (!token) {
        alert("Token not found");
        return;
      }
      const payload = decodeJWT(token);
      if (!payload) {
        alert("Invalid token");
        return;
      }
      const userId = payload?.user_id || payload?.id || payload?.sub;
      if (!userId) {
        alert("User ID not found");
        return;
      }
      const res = await fetch(`http://nghiapd.ddns.net:8081/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          country,
          city,
          language: "en",
          isPremium: false,
          isAddCreditCard: false,
        }),
      });
      if (res.ok) {
        dispatch("close");
        dispatch("updated", { userId });
        setTimeout(() => {
          showNotification({ message: "Update successful" }, "success");
        }, 200);
      } else {
        showNotification({ message: "Update failed" }, "error");
        alert("Update failed");
      }
    } catch (err: any) {
      alert("Error: " + (err?.message || "Unknown error"));
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal-overlay" transition:fade={{ duration: 200 }}>
  <div
    class="modal-content bg-white rounded-3xl p-8 w-full max-w-lg min-w-[448px] relative shadow-2xl transition-all duration-300 ease-out"
  >
    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="flex items-center justify-center mx-auto mb-2">
        <img src="/logo.png" alt="GoWise Logo" class="w-16 h-16" />
      </div>
      <h2
        class="text-3xl font-bold text-gray-900 mb-2 transition-all duration-300"
      >
        Update Personal Information
      </h2>
      <p class="text-gray-600 transition-all duration-300">
        Please fill in all information to continue
      </p>
    </div>

    <!-- Form -->
    <form
      onsubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      class="space-y-3"
    >
      <!-- First Name Field -->
      <div>
        <label
          for="firstName"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          First Name
        </label>
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <div class="h-5 w-5 text-gray-400">
              <FaUser />
            </div>
          </div>
          <input
            id="firstName"
            type="text"
            bind:value={firstName}
            placeholder="Enter your first name"
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          />
        </div>
      </div>

      <!-- Last Name Field -->
      <div>
        <label
          for="lastName"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Last Name
        </label>
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <div class="h-5 w-5 text-gray-400">
              <FaUser />
            </div>
          </div>
          <input
            id="lastName"
            type="text"
            bind:value={lastName}
            placeholder="Enter your last name"
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          />
        </div>
      </div>

      <!-- Country Field -->
      <div>
        <label
          for="country"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Country
        </label>
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <div class="h-5 w-5 text-gray-400">
              <FaGlobe />
            </div>
          </div>
          <select
            id="country"
            bind:value={selectedCountryId}
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          >
            <option value="" disabled selected>Select your country</option>
            {#each countries as c}
              <option value={c.id}>{c.name}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- City Field -->
      <div>
        <label for="city" class="block text-sm font-medium text-gray-700 mb-2">
          City
        </label>
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <div class="h-5 w-5 text-gray-400">
              <FaGlobe />
            </div>
          </div>
          <select
            id="city"
            bind:value={city}
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
            disabled={!selectedCountryId}
          >
            <option value="" disabled selected>Select your city</option>
            {#each cities as c}
              <option value={c.name}>{c.name}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        disabled={loading}
        class="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if loading}
          <div class="flex items-center justify-center">
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
          Update Information
        {/if}
      </button>
    </form>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
</style>
