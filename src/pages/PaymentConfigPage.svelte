<script lang="ts">
  import FaCreditCard from "svelte-icons/fa/FaCreditCard.svelte";
  import FaEdit from "svelte-icons/fa/FaEdit.svelte";
  import FaRegTrashAlt from "svelte-icons/fa/FaRegTrashAlt.svelte";
  import FaPlus from "svelte-icons/fa/FaPlus.svelte";
  import AddPaymentMethods from "../components/addPaymentMethods.svelte";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  interface PaymentMethod {
    id: string | number;
    type: string;
    number: string;
    expires: string;
    cardholderName: string;
    isDefault: boolean;
  }

  let paymentMethods = $state<PaymentMethod[]>([]);
  let showAddModal = $state(false);
  let showSetDefaultModal = $state(false);
  let showDeleteModal = $state(false);
  let selectedCard = $state<PaymentMethod | null>(null);
  let cardToDelete = $state<PaymentMethod | null>(null);
  let isLoading = $state(true);
  let isSettingDefault = $state(false);
  let isDeletingCard = $state<string | number | null>(null);
  let error = $state<string | null>(null);

  // Function to get cookie value
  function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }

  // Function to decode JWT token
  function decodeJWT(token: string): any {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }

  // Get userId from access token in cookie
  function getUserIdFromToken(): string | null {
    const accessToken = getCookie("access_token") || getCookie("accessToken");
    if (!accessToken) return null;

    const decoded = decodeJWT(accessToken);
    return decoded?.userId || decoded?.sub || decoded?.id || null;
  }

  // Format card type for display
  function formatCardType(cardType: string): string {
    const typeMapping: Record<string, string> = {
      VISA: "Visa",
      MASTERCARD: "Mastercard",
      AMEX: "American Express",
      DISCOVER: "Discover",
      OTHER: "Other",
    };
    return typeMapping[cardType] || cardType;
  }

  // Load payment methods from API
  async function loadPaymentMethods() {
    const userId = getUserIdFromToken();
    if (!userId) {
      error = "User authentication required. Please login again.";
      isLoading = false;
      return;
    }

    try {
      isLoading = true;
      error = null;

      const accessToken = getCookie("access_token") || getCookie("accessToken");

      console.log("🔍 Loading payment methods for user:", userId);

      const response = await fetch(
        `http://nghiapd.ddns.net:8081/users/${userId}/credit-cards`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);

        try {
          const errorObj = JSON.parse(errorText);
          throw new Error(
            errorObj.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log("💳 Payment methods loaded:", result);

      // Transform API response to match UI format
      if (Array.isArray(result)) {
        console.log("📋 Processing direct array response");
        paymentMethods = result.map((card: any): PaymentMethod => {
          console.log(
            `  Card: ${card.cardId} - ${card.cardType} - ${card.lastFourDigits}`
          );
          return {
            id: card.cardId, // API uses cardId field
            type: formatCardType(card.cardType),
            number: `**** ${card.lastFourDigits}`,
            expires: `${String(card.expiryMonth).padStart(2, "0")}/${String(card.expiryYear).slice(-2)}`,
            cardholderName: card.cardholderName || "N/A",
            isDefault: card.isDefault || false,
          };
        });
      } else if (result.data && Array.isArray(result.data)) {
        console.log("📋 Processing nested data array response");
        paymentMethods = result.data.map((card: any): PaymentMethod => {
          console.log(
            `  Card: ${card.cardId} - ${card.cardType} - ${card.lastFourDigits}`
          );
          return {
            id: card.cardId, // API uses cardId field
            type: formatCardType(card.cardType),
            number: `**** ${card.lastFourDigits}`,
            expires: `${String(card.expiryMonth).padStart(2, "0")}/${String(card.expiryYear).slice(-2)}`,
            cardholderName: card.cardholderName || "N/A",
            isDefault: card.isDefault || false,
          };
        });
      } else {
        paymentMethods = [];
      }

      console.log(
        "💳 Final payment methods with IDs:",
        paymentMethods.map((pm) => ({
          id: pm.id,
          type: pm.type,
          number: pm.number,
        }))
      );
    } catch (err: any) {
      console.error("Error loading payment methods:", err);
      error = err.message || "Failed to load payment methods";
      paymentMethods = [];
    } finally {
      isLoading = false;
    }
  }

  // Load payment methods when component mounts
  onMount(() => {
    loadPaymentMethods();
  });

  function addPaymentMethod() {
    showAddModal = true;
  }

  function handleAddPaymentMethod(newMethod: PaymentMethod) {
    // Close modal first
    showAddModal = false;

    // Always reload from server to get the latest data instead of manual state manipulation
    console.log("💳 New payment method added, reloading data from server...");
    loadPaymentMethods();
  }

  function closeAddModal() {
    showAddModal = false;
  }

  function editPaymentMethod(id: string | number) {
    const card = paymentMethods.find((method) => method.id === id);
    if (card) {
      selectedCard = card;
      showSetDefaultModal = true;
    }
  }

  // Set card as default
  async function setCardAsDefault() {
    if (!selectedCard) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      alert("User authentication required. Please login again.");
      return;
    }

    try {
      isSettingDefault = true;

      const accessToken = getCookie("access_token") || getCookie("accessToken");

      console.log(
        `🔄 Setting card ${selectedCard.id} as default for user ${userId}`
      );

      const response = await fetch(
        `http://nghiapd.ddns.net:8081/users/${userId}/credit-cards/${selectedCard.id}/default`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);

        try {
          const errorObj = JSON.parse(errorText);
          throw new Error(
            errorObj.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log("✅ Card set as default successfully:", result);

      // Close modal and reload payment methods
      showSetDefaultModal = false;
      selectedCard = null;
      await loadPaymentMethods();
    } catch (err: any) {
      console.error("Error setting card as default:", err);
      alert(`Failed to set card as default: ${err.message}`);
    } finally {
      isSettingDefault = false;
    }
  }

  function closeSetDefaultModal() {
    showSetDefaultModal = false;
    selectedCard = null;
  }

  function deletePaymentMethod(id: string | number) {
    console.log("🔍 Delete payment method called with ID:", id, typeof id);

    const card = paymentMethods.find((method) => method.id === id);
    if (!card) {
      console.error("❌ Card not found with ID:", id);
      console.log(
        "Available cards:",
        paymentMethods.map((m) => ({ id: m.id, type: typeof m.id }))
      );
      return;
    }

    console.log("🔍 Found card to delete:", card);

    // Validate ID is not undefined/null
    if (id === undefined || id === null || id === "") {
      console.error("❌ Invalid card ID:", id);
      alert("Invalid card ID. Cannot delete card.");
      return;
    }

    // Show delete confirmation modal
    cardToDelete = card;
    showDeleteModal = true;
  }

  async function confirmDeletePaymentMethod() {
    if (!cardToDelete) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      alert("User authentication required. Please login again.");
      return;
    }

    try {
      isDeletingCard = cardToDelete.id;

      const accessToken = getCookie("access_token") || getCookie("accessToken");

      // Debug all request information
      console.log("🔍 DELETE Request Details:");
      console.log(
        "  URL:",
        `http://nghiapd.ddns.net:8081/users/${userId}/credit-cards/${cardToDelete.id}`
      );
      console.log("  User ID:", userId);
      console.log("  Card ID:", cardToDelete.id);
      console.log("  Card ID type:", typeof cardToDelete.id);
      console.log("  Access Token exists:", !!accessToken);
      console.log("  Full card object:", cardToDelete);

      // Make sure we're using the exact same base URL as other working endpoints
      const baseUrl = "http://nghiapd.ddns.net:8081";
      const deleteUrl = `${baseUrl}/users/${userId}/credit-cards/${cardToDelete.id}`;
      console.log("  Final URL:", deleteUrl);

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);

        try {
          const errorObj = JSON.parse(errorText);
          throw new Error(
            errorObj.message ||
              `HTTP ${response.status}: ${response.statusText}`
          );
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      console.log("✅ Card deleted successfully");

      // Close modal and reload payment methods
      showDeleteModal = false;
      cardToDelete = null;
      await loadPaymentMethods();
    } catch (err: any) {
      console.error("Error deleting payment method:", err);
      alert(`Failed to delete payment method: ${err.message}`);
    } finally {
      isDeletingCard = null;
    }
  }

  function closeDeleteModal() {
    showDeleteModal = false;
    cardToDelete = null;
  }
</script>

<div class="max-w-5xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-xl font-semibold text-gray-800 m-0">Payment Methods</h2>
    <button
      class="flex items-center bg-teal-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={addPaymentMethod}
      disabled={isLoading}
    >
      <div class="w-4 h-4 mr-2">
        <FaPlus />
      </div>
      Add Method
    </button>
  </div>

  <!-- Loading State -->
  {#if isLoading}
    <div class="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div
        class="animate-spin w-8 h-8 mx-auto mb-4 border-4 border-teal-600 border-t-transparent rounded-full"
      ></div>
      <p class="text-gray-600">Loading payment methods...</p>
    </div>
  {/if}

  <!-- Error State -->
  {#if error && !isLoading}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <div class="text-red-600 mr-3">⚠️</div>
        <div>
          <h3 class="text-red-800 font-medium">
            Error loading payment methods
          </h3>
          <p class="text-red-600 text-sm">{error}</p>
        </div>
        <button
          class="ml-auto bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          onclick={loadPaymentMethods}
        >
          Retry
        </button>
      </div>
    </div>
  {/if}

  <!-- Payment Methods List -->
  {#if !isLoading && !error}
    <div class="space-y-4">
      {#each paymentMethods as method}
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-8 h-8 mr-4 text-gray-600">
                <FaCreditCard />
              </div>
              <div>
                <div class="flex items-center">
                  <span class="text-base font-medium text-gray-900 mr-2">
                    {method.type}
                    {method.number}
                  </span>
                  {#if method.isDefault}
                    <span
                      class="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded"
                    >
                      Default
                    </span>
                  {/if}
                </div>
                <p class="text-sm text-gray-600 mt-1">
                  Expires {method.expires}
                </p>
                {#if method.cardholderName && method.cardholderName !== "N/A"}
                  <p class="text-sm text-gray-500">
                    {method.cardholderName}
                  </p>
                {/if}
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <button
                class="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onclick={() => editPaymentMethod(method.id)}
                title="Set as default payment method"
                aria-label="Set as default payment method"
                disabled={isDeletingCard === method.id || isLoading}
              >
                <div class="w-4 h-4">
                  <FaEdit />
                </div>
              </button>
              <button
                class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onclick={() => deletePaymentMethod(method.id)}
                title="Delete payment method"
                aria-label="Delete payment method"
                disabled={isDeletingCard === method.id || isLoading}
              >
                {#if isDeletingCard === method.id}
                  <div
                    class="w-4 h-4 animate-spin border-2 border-red-600 border-t-transparent rounded-full"
                  ></div>
                {:else}
                  <div class="w-4 h-4">
                    <FaRegTrashAlt />
                  </div>
                {/if}
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Empty State -->
  {#if !isLoading && !error && paymentMethods.length === 0}
    <div class="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div class="w-16 h-16 mx-auto mb-4 text-gray-400">
        <FaCreditCard />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
      <p class="text-gray-600 mb-6">
        Add a payment method to get started with transactions.
      </p>
      <button
        class="bg-teal-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 hover:bg-teal-700"
        onclick={addPaymentMethod}
      >
        Add Your First Payment Method
      </button>
    </div>
  {/if}
</div>

{#if showAddModal}
  <AddPaymentMethods onAdd={handleAddPaymentMethod} onClose={closeAddModal} />
{/if}

<!-- Set Default Card Modal -->
{#if showSetDefaultModal && selectedCard}
  <div class="modal-overlay" transition:fade={{ duration: 200 }}>
    <!-- Modal content -->
    <div
      class="modal-content bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
      transition:fade={{ duration: 200, delay: 50 }}
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Set Default Payment Method
        </h3>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          onclick={closeSetDefaultModal}
          disabled={isSettingDefault}
          aria-label="Close dialog"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="mb-6">
        <div class="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="w-8 h-8 mr-3 text-gray-600">
            <FaCreditCard />
          </div>
          <div>
            <p class="font-medium text-gray-900">
              {selectedCard.type}
              {selectedCard.number}
            </p>
            <p class="text-sm text-gray-600">
              Expires {selectedCard.expires}
            </p>
          </div>
        </div>

        <p class="text-gray-700">
          Do you want to set this card as your default payment method?
        </p>

        {#if selectedCard.isDefault}
          <div class="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <p class="text-teal-800 text-sm">
              ℹ️ This card is already your default payment method.
            </p>
          </div>
        {/if}
      </div>

      <!-- Actions -->
      <div class="flex space-x-3">
        <button
          class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onclick={closeSetDefaultModal}
          disabled={isSettingDefault}
        >
          Cancel
        </button>
        <button
          class="flex-1 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onclick={setCardAsDefault}
          disabled={isSettingDefault || selectedCard.isDefault}
        >
          {#if isSettingDefault}
            <div class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Setting...
            </div>
          {:else}
            Set as Default
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && cardToDelete}
  <div class="modal-overlay" transition:fade={{ duration: 200 }}>
    <!-- Modal content -->
    <div
      class="modal-content bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
      transition:fade={{ duration: 200, delay: 50 }}
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Delete Payment Method
        </h3>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors"
          onclick={closeDeleteModal}
          disabled={isDeletingCard === cardToDelete.id}
          aria-label="Close dialog"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="mb-6">
        <div class="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="w-8 h-8 mr-3 text-gray-600">
            <FaCreditCard />
          </div>
          <div>
            <p class="font-medium text-gray-900">
              {cardToDelete.type}
              {cardToDelete.number}
            </p>
            <p class="text-sm text-gray-600">
              Expires {cardToDelete.expires}
            </p>
          </div>
        </div>

        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800 text-sm">⚠️ This action cannot be undone.</p>
        </div>

        <p class="text-gray-700">
          Are you sure you want to delete this payment method?
        </p>
      </div>

      <!-- Actions -->
      <div class="flex space-x-3">
        <button
          class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onclick={closeDeleteModal}
          disabled={isDeletingCard === cardToDelete.id}
        >
          Cancel
        </button>
        <button
          class="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onclick={confirmDeletePaymentMethod}
          disabled={isDeletingCard === cardToDelete.id}
        >
          {#if isDeletingCard === cardToDelete.id}
            <div class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Deleting...
            </div>
          {:else}
            Delete Card
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

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
