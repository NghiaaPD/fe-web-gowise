<script lang="ts">
  import { fade } from "svelte/transition";
  import FaCreditCard from "svelte-icons/fa/FaCreditCard.svelte";
  import FaTimes from "svelte-icons/fa/FaTimes.svelte";

  interface Props {
    onAdd?: (paymentMethod: any) => void;
    onClose?: () => void;
  }

  let { onAdd, onClose }: Props = $props();

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

  let cardNumber = $state("");
  let expiryDate = $state("");
  let cvv = $state("");
  let cardholderName = $state("");
  let cardType = $state("VISA");
  let isDefault = $state(false);
  let isLoading = $state(false);

  // Available card types that match backend enum
  const cardTypes = [
    { value: "VISA", label: "Visa" },
    { value: "MASTERCARD", label: "Mastercard" },
    { value: "AMEX", label: "American Express" },
    { value: "DISCOVER", label: "Discover" },
    { value: "OTHER", label: "Other" },
  ];

  function closeModal() {
    if (onClose) onClose();
  }

  function formatCardNumber(value: string) {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiryDate(value: string) {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.substring(0, 2) + "/" + digits.substring(2, 4);
    }
    return digits;
  }

  function handleCardNumberInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const formatted = formatCardNumber(target.value);
    cardNumber = formatted;
    target.value = formatted;

    // Auto-detect card type from card number
    const detectedType = getCardType(formatted);
    if (detectedType !== cardType) {
      cardType = detectedType;
    }
  }

  function handleExpiryInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const formatted = formatExpiryDate(target.value);
    expiryDate = formatted;
    target.value = formatted;
  }

  async function handleSubmit() {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      alert("Please fill in all fields");
      return;
    }

    // Validate card number length (13-19 digits as required by backend)
    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      alert("Card number must be 13-19 digits long");
      return;
    }

    // Validate expiry date format
    const [month, year] = expiryDate.split("/");
    if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
      alert("Please enter a valid expiry date (MM/YY)");
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      alert("User authentication required. Please login again.");
      return;
    }

    try {
      isLoading = true;

      // Parse expiry date
      const [month, year] = expiryDate.split("/");
      const expiryMonth = parseInt(month, 10);
      const expiryYear = 2000 + parseInt(year, 10);

      // Get access token for authorization
      const accessToken = getCookie("access_token") || getCookie("accessToken");

      // Prepare request body - ensure boolean value
      const requestBody = {
        cardNumber: cardNumber.replace(/\s/g, ""), // Remove spaces
        cardType: cardType, // Use uppercase as required by backend enum
        expiryMonth,
        expiryYear,
        setAsDefault: Boolean(isDefault), // Explicitly convert to boolean
        // Try different field names in case backend expects different naming
        isDefault: Boolean(isDefault),
        default: Boolean(isDefault),
      };

      console.log("🔍 Debug Values:");
      console.log("isDefault checkbox value:", isDefault);
      console.log("isDefault type:", typeof isDefault);
      console.log("setAsDefault in request:", requestBody.setAsDefault);
      console.log("setAsDefault type:", typeof requestBody.setAsDefault);
      console.log("Full request body:", JSON.stringify(requestBody, null, 2));
      console.log("API URL:", `/users/${userId}/credit-cards`);
      console.log("Selected cardType:", cardType);

      // Make API call using same base URL as other API calls
      const response = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/users/${userId}/credit-cards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        // Enhanced error logging
        console.group("🚨 API Error Details");
        console.error("Status:", response.status, response.statusText);
        console.error(
          "URL:",
          `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/users/${userId}/credit-cards`
        );
        console.error("Request Body:", requestBody);
        console.error("Response Text:", errorText);
        console.groupEnd();

        // Parse error response to show user-friendly message
        try {
          const errorObj = JSON.parse(errorText);
          console.log("📋 Parsed Error Object:", errorObj);

          // Handle Spring Boot validation errors
          if (
            errorObj.errors &&
            Array.isArray(errorObj.errors) &&
            errorObj.errors.length > 0
          ) {
            const fieldErrors = errorObj.errors
              .map((error: any) => {
                console.log("🔍 Field Error:", error);
                return `${error.field}: ${error.defaultMessage}`;
              })
              .join(", ");
            throw new Error(`Validation Error: ${fieldErrors}`);
          }
          // Handle JSON deserialization errors (enum issues)
          else if (
            errorObj.message &&
            errorObj.message.includes("JSON parse error")
          ) {
            console.error("🔍 JSON Parse Error Details:", errorObj.message);
            if (errorObj.message.includes("CardType")) {
              throw new Error(
                "Invalid card type selected. Please choose a valid card type."
              );
            } else {
              throw new Error("Data format error. Please check your input.");
            }
          }
          // Handle database/SQL errors
          else if (
            errorObj.message &&
            errorObj.message.includes("could not execute statement")
          ) {
            console.error("🗄️ Database Error:", errorObj.message);
            if (errorObj.message.includes("card_type")) {
              throw new Error(
                "Database configuration issue with card type. Please contact support."
              );
            } else {
              throw new Error(
                "Database error occurred. Please try again or contact support."
              );
            }
          }
          // Handle custom backend error messages
          else if (errorObj.message) {
            console.error("🛠️ Backend Error:", errorObj.message);
            throw new Error(`Server Error: ${errorObj.message}`);
          }
          // Handle generic error responses
          else if (errorObj.error) {
            console.error("❌ Generic Error:", errorObj.error);
            throw new Error(`Error: ${errorObj.error}`);
          }
          // Handle success: false responses
          else if (errorObj.success === false) {
            console.error("❌ Operation Failed:", errorObj);
            throw new Error(errorObj.message || "Operation failed");
          } else {
            throw new Error("Unknown server error");
          }
        } catch (parseError: any) {
          console.error("🔧 Error parsing response:", parseError);
          console.error("Raw response:", errorText);

          // If it's a thrown error from above, re-throw it
          if (
            parseError.message &&
            (parseError.message.startsWith("Validation Error") ||
              parseError.message.startsWith("Server Error") ||
              parseError.message.startsWith("Database") ||
              parseError.message.startsWith("Invalid card type") ||
              parseError.message.startsWith("Data format error"))
          ) {
            throw parseError;
          }

          // Otherwise, it's a JSON parsing error
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log("API Success Response:", result);

      // Create display object for the UI
      const newPaymentMethod = {
        id: result.id || Date.now(),
        type: cardTypes.find((ct) => ct.value === cardType)?.label || cardType,
        number: "**** " + cardNumber.slice(-4),
        expires: expiryDate,
        cardholderName,
        isDefault,
      };

      if (onAdd) onAdd(newPaymentMethod);
      closeModal();
    } catch (error: any) {
      console.error("Error adding payment method:", error);
      alert("Failed to add payment method: " + error.message);
    } finally {
      isLoading = false;
    }
  }

  function getCardType(number: string) {
    const digits = number.replace(/\D/g, "");
    // Match backend enum values: [OTHER, DISCOVER, MASTERCARD, AMEX, VISA]
    if (digits.startsWith("4")) return "VISA";
    if (digits.startsWith("5") || digits.startsWith("2")) return "MASTERCARD";
    if (digits.startsWith("34") || digits.startsWith("37")) return "AMEX";
    if (digits.startsWith("6")) return "DISCOVER";
    return "OTHER"; // Default to OTHER for unknown card types
  }
</script>

<div class="modal-overlay" transition:fade={{ duration: 200 }}>
  <div
    class="modal-content bg-white rounded-3xl p-8 w-full max-w-lg min-w-[448px] relative shadow-2xl transition-all duration-300 ease-out"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <div class="w-6 h-6 mr-3 text-teal-600">
          <FaCreditCard />
        </div>
        <h2 class="text-2xl font-bold text-gray-900">
          Thêm phương thức thanh toán
        </h2>
      </div>
      <button
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        onclick={closeModal}
        aria-label="Đóng cửa sổ"
      >
        <div class="w-5 h-5">
          <FaTimes />
        </div>
      </button>
    </div>

    <!-- Form -->
    <form
      onsubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      class="space-y-4"
    >
      <!-- Cardholder Name -->
      <div>
        <label
          for="cardholderName"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Tên chủ thẻ
        </label>
        <input
          id="cardholderName"
          type="text"
          bind:value={cardholderName}
          placeholder="Nguyễn Văn A"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          required
        />
      </div>

      <!-- Card Type -->
      <div>
        <label
          for="cardType"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Loại thẻ
        </label>
        <select
          id="cardType"
          bind:value={cardType}
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors bg-white"
          required
        >
          {#each cardTypes as type}
            <option value={type.value}>{type.label}</option>
          {/each}
        </select>
      </div>

      <!-- Card Number -->
      <div>
        <label
          for="cardNumber"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Số thẻ (13-19 chữ số)
        </label>
        <input
          id="cardNumber"
          type="text"
          bind:value={cardNumber}
          oninput={handleCardNumberInput}
          placeholder="4111 1111 1111 1111"
          maxlength="23"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          required
        />
        <p class="text-xs text-gray-500 mt-1">
          Nhập số thẻ tín dụng hợp lệ (13-19 chữ số). Loại thẻ sẽ được tự động
          phát hiện.
        </p>
      </div>

      <!-- Expiry Date and CVV -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label
            for="expiryDate"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Ngày hết hạn
          </label>
          <input
            id="expiryDate"
            type="text"
            bind:value={expiryDate}
            oninput={handleExpiryInput}
            placeholder="MM/YY"
            maxlength="5"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          />
        </div>
        <div>
          <label for="cvv" class="block text-sm font-medium text-gray-700 mb-2">
            CVV
          </label>
          <input
            id="cvv"
            type="text"
            bind:value={cvv}
            placeholder="123"
            maxlength="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          />
        </div>
      </div>

      <!-- Default Payment Method Checkbox -->
      <div class="flex items-center">
        <input
          id="isDefault"
          type="checkbox"
          bind:checked={isDefault}
          class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
        />
        <label for="isDefault" class="ml-2 text-sm text-gray-700">
          Đặt làm phương thức thanh toán mặc định
        </label>
      </div>

      <!-- Buttons -->
      <div class="flex space-x-3 pt-4">
        <button
          type="button"
          onclick={closeModal}
          class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200"
          disabled={isLoading}
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          class="flex-1 bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isLoading}
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
              Đang thêm...
            </div>
          {:else}
            Thêm phương thức thanh toán
          {/if}
        </button>
      </div>
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
