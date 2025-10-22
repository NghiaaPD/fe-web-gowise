<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { showNotification } from "$lib/index";

  const dispatch = createEventDispatcher();
  let isEditing = false;
  let isLoading = false;
  let userId = ""; // User data
  let userData = {
    firstName: "",
    lastName: "",
    bio: "",
    isPremium: false,
    createdAt: "",
  };

  // Original data for comparison
  let originalData = { ...userData };

  function toggleEdit() {
    if (isEditing) {
      // Cancel editing - restore original data
      userData = { ...originalData };
    }
    isEditing = !isEditing;
  }

  async function saveChanges() {
    if (!userId) return;

    isLoading = true;

    try {
      // Get token from cookie
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("accessToken=")
      );

      if (!tokenCookie) {
        console.error("No access token found");
        return;
      }

      const token = tokenCookie.split("=")[1];

      // Update first name if changed
      if (userData.firstName !== originalData.firstName) {
        await fetch(
          `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/users/${userId}/first_name`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ firstName: userData.firstName }),
          }
        );
      }

      // Update last name if changed
      if (userData.lastName !== originalData.lastName) {
        await fetch(
          `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/users/${userId}/last_name`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ lastName: userData.lastName }),
          }
        );
      }

      // Update original data with new values
      originalData = { ...userData };
      isEditing = false;

      // Show success notification
      showNotification(
        {
          title: "Profile Updated",
          message: "Your profile information has been successfully updated.",
        },
        "success"
      );

      // Dispatch event to parent to refresh user data
      dispatch("profileUpdated");
    } catch (error) {
      console.error("Error updating profile:", error);
      // Restore original data on error
      userData = { ...originalData };

      // Show error notification
      showNotification(
        {
          title: "Update Failed",
          message: "Failed to update your profile. Please try again.",
        },
        "error"
      );
    } finally {
      isLoading = false;
    }
  }

  async function fetchUserData() {
    if (!userId) return;

    try {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("accessToken=")
      );

      if (!tokenCookie) return;

      const token = tokenCookie.split("=")[1];

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
        userData = {
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          bio: response.data.bio || "",
          isPremium: response.data.isPremium || false,
          createdAt: response.data.createdAt || "",
        };
        originalData = { ...userData };
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  onMount(() => {
    // Extract userId from URL
    const pathSegments = window.location.pathname.split("/");
    userId = pathSegments[1];

    fetchUserData();
  });
</script>

<div class="max-w-5xl mx-auto">
  <div class="mb-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800 m-0">
        Profile Information
      </h2>
      <button
        class="bg-transparent border border-teal-600 text-teal-600 px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-teal-600 hover:text-white"
        on:click={toggleEdit}
      >
        {isEditing ? "Cancel" : "Edit"}
      </button>
    </div>
  </div>

  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div class="flex items-center p-8 bg-gray-50 border-b border-gray-200">
      <div
        class="w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-400 rounded-full flex items-center justify-center mr-5 flex-shrink-0"
      >
        <span class="text-white text-2xl font-semibold">
          {(userData.firstName?.charAt(0) || "") +
            (userData.lastName?.charAt(0) || "")}
        </span>
      </div>
      <div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-1">
          {userData.firstName}
          {userData.lastName}
        </h3>
        <p class="text-teal-600 font-medium text-sm mb-1">
          {userData.isPremium ? "Premium Member" : "Free Member"}
        </p>
        <p class="text-gray-500 text-sm m-0">
          Member since {userData.createdAt
            ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })
            : "Unknown"}
        </p>
      </div>
    </div>

    <div class="p-8">
      <div class="grid grid-cols-2 gap-8 mb-6">
        <div class="flex flex-col">
          <label for="firstName" class="mb-2 font-medium text-gray-700 text-sm"
            >First Name</label
          >
          <input
            type="text"
            id="firstName"
            bind:value={userData.firstName}
            disabled={!isEditing}
            class="p-3 border border-gray-300 rounded-md text-sm transition-colors duration-200 {!isEditing
              ? 'bg-gray-50 cursor-not-allowed'
              : 'bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100'}"
          />
        </div>
        <div class="flex flex-col">
          <label for="lastName" class="mb-2 font-medium text-gray-700 text-sm"
            >Last Name</label
          >
          <input
            type="text"
            id="lastName"
            bind:value={userData.lastName}
            disabled={!isEditing}
            class="p-3 border border-gray-300 rounded-md text-sm transition-colors duration-200 {!isEditing
              ? 'bg-gray-50 cursor-not-allowed'
              : 'bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100'}"
          />
        </div>
      </div>

      <div class="flex flex-col mb-6">
        <label for="bio" class="mb-2 font-medium text-gray-700 text-sm"
          >Bio</label
        >
        <textarea
          id="bio"
          bind:value={userData.bio}
          disabled={!isEditing}
          class="p-3 border border-gray-300 rounded-md text-sm transition-colors duration-200 resize-y min-h-[100px] {!isEditing
            ? 'bg-gray-50 cursor-not-allowed'
            : 'bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100'}"
          rows="4"
        ></textarea>
      </div>

      {#if isEditing}
        <div class="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            class="bg-teal-600 text-white border-0 px-6 py-3 rounded-md cursor-pointer font-medium transition-colors duration-200 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={saveChanges}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          <button
            class="bg-transparent border border-gray-300 text-gray-500 px-6 py-3 rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={toggleEdit}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  @media (max-width: 640px) {
    .grid-cols-2 {
      grid-template-columns: 1fr;
    }

    .flex.items-center.p-8 {
      flex-direction: column;
      text-align: center;
    }

    .w-20.h-20 {
      margin-right: 0;
      margin-bottom: 1rem;
    }
  }
</style>
