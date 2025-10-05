<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade, fly, slide, scale } from "svelte/transition";
  import { quintOut, cubicOut } from "svelte/easing";
  import FaPlane from "svelte-icons/fa/FaPlane.svelte";
  import FaMapMarkerAlt from "svelte-icons/fa/FaMapMarkerAlt.svelte";
  import FaCalendarAlt from "svelte-icons/fa/FaCalendarAlt.svelte";
  import FaMoneyBillWave from "svelte-icons/fa/FaMoneyBillWave.svelte";
  import FaRocket from "svelte-icons/fa/FaRocket.svelte";
  import FaMap from "svelte-icons/fa/FaMap.svelte";
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";
  import FaHandPaper from "svelte-icons/fa/FaHandPaper.svelte";
  import FaStar from "svelte-icons/fa/FaStar.svelte";
  import FaBullseye from "svelte-icons/fa/FaBullseye.svelte";
  import FaArrowLeft from "svelte-icons/fa/FaArrowLeft.svelte";

  const dispatch = createEventDispatcher();

  let selectedAnswer = $state<boolean | null>(null);
  let isAnimating = $state(false);
  let showContent = $state(false);
  let currentStep = $state(1); // 1: first question, 2: domestic/international, 3: travel details form
  let showSuccessOverlay = $state(false); // Control success overlay separately
  let travelType = $state<"domestic" | "international" | null>(null);
  let travelDetails = $state({
    destination: "",
    startDate: "",
    endDate: "",
    participants: "",
    budget: "",
  });

  // Animation timing
  setTimeout(() => {
    showContent = true;
  }, 300);

  function handleAnswer(answer: boolean) {
    if (isAnimating) return;

    selectedAnswer = answer;
    isAnimating = true;

    // If user says "Yes", go directly to travel details form (step 3)
    if (answer) {
      setTimeout(() => {
        currentStep = 3;
        isAnimating = false;
        // Keep selectedAnswer = true to show destination field
      }, 300);
    } else {
      // If user says "Not yet", go to domestic/international question (step 2)
      setTimeout(() => {
        currentStep = 2;
        isAnimating = false;
        // Keep selectedAnswer = false for proper flow tracking
      }, 300);
    }
  }

  function handleTravelTypeAnswer(type: "domestic" | "international") {
    if (isAnimating) return;

    travelType = type;
    isAnimating = true;

    // Go to travel details form (step 3)
    setTimeout(() => {
      currentStep = 3;
      isAnimating = false;
    }, 300);
  }

  function goBack() {
    if (isAnimating) return;

    isAnimating = true;

    if (currentStep === 3) {
      // From step 3, go back based on how we got here
      if (selectedAnswer === true) {
        // "Yes I do" users go back to step 1
        currentStep = 1;
        selectedAnswer = null;
      } else {
        // "Not yet" users go back to step 2
        currentStep = 2;
      }
    } else if (currentStep === 2) {
      // From step 2, go back to step 1
      currentStep = 1;
      selectedAnswer = null;
      travelType = null;
    }

    setTimeout(() => {
      isAnimating = false;
    }, 300);
  }

  async function getUserLocation(): Promise<{
    lat: number;
    lon: number;
  } | null> {
    return new Promise((resolve) => {
      console.log("🌍 Getting user location...");

      if (!navigator.geolocation) {
        console.warn("❌ Geolocation not supported");
        // Default to Ho Chi Minh City coordinates
        const defaultLocation = { lat: 10.7769, lon: 106.7009 };
        console.log("📍 Using default location:", defaultLocation);
        resolve(defaultLocation);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          console.log("✅ User location obtained:", userLocation);
          resolve(userLocation);
        },
        (error) => {
          console.warn("⚠️ Error getting location:", error);
          // Default to Ho Chi Minh City coordinates
          const defaultLocation = { lat: 10.7769, lon: 106.7009 };
          console.log(
            "📍 Using default location after error:",
            defaultLocation
          );
          resolve(defaultLocation);
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
        }
      );
    });
  }

  async function fetchFlightData(
    location: { lat: number; lon: number },
    destination: string,
    startDate: string,
    endDate: string
  ) {
    const requestData = {
      departure_lat: location.lat,
      departure_lon: location.lon,
      arrival_city: destination,
      outbound_date: startDate,
      return_date: endDate,
      sort_criteria: "score",
      limit: 3,
    };

    console.log("✈️ Fetching flight data...");
    console.log("📋 Flight request data:", requestData);

    try {
      const response = await fetch(
        "http://nghiapd.ddns.net:8081/flights/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log("📡 Flight API response status:", response.status);

      // Handle both success and 400 (no flights found) responses
      if (response.ok || response.status === 400) {
        const data = await response.json();
        console.log("✅ Flight data received:", data);

        // Check if no flights found (HTTP 400 or message contains "no flights")
        if (
          response.status === 400 ||
          (data.message &&
            (data.message.includes("No flights found") ||
              data.message.includes("Found 0 flights")))
        ) {
          console.log("⚠️ No flights found for this route");
          return {
            success: false,
            message:
              data.message ||
              "No flights found for the specified route and date",
            no_flights_found: true,
            destination: requestData.arrival_city,
          };
        }

        return data;
      } else {
        const errorText = await response.text();
        console.error("❌ Flight API error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }
    } catch (error) {
      console.error("❌ Error fetching flight data:", error);
      return null;
    }
  }

  async function fetchHotelData(
    destination: string,
    startDate: string,
    endDate: string,
    participants: string
  ) {
    const requestData = {
      location: destination,
      check_in_date: startDate,
      check_out_date: endDate,
      adults: parseInt(participants) || 2,
      limit: 5,
    };

    try {
      const response = await fetch(
        "http://nghiapd.ddns.net:8081/hotels/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log("📡 Hotel API response status:", response.status);

      // Handle both success and 400 (no hotels found) responses
      if (response.ok || response.status === 400) {
        const data = await response.json();
        console.log("✅ Hotel data received:", data);

        // Check if no hotels found (HTTP 400 or message contains "no hotels")
        if (
          response.status === 400 ||
          (data.message &&
            (data.message.includes("No hotels found") ||
              data.message.includes("Found 0 hotels")))
        ) {
          console.log("⚠️ No hotels found for this location");
          return {
            success: false,
            message:
              data.message ||
              "No hotels found for the specified location and dates",
            no_hotels_found: true,
            destination: requestData.location,
          };
        }

        return data;
      } else {
        const errorText = await response.text();
        console.error("❌ Hotel API error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }
    } catch (error) {
      console.error("❌ Error fetching hotel data:", error);
      return null;
    }
  }

  function getRandomDestination(userLocation: {
    lat: number;
    lon: number;
  }): string {
    console.log("🎲 Getting random destination for travel type:", travelType);

    // Vietnam coordinates check
    const isInVietnam =
      userLocation.lat >= 8.2 &&
      userLocation.lat <= 23.4 &&
      userLocation.lon >= 102.1 &&
      userLocation.lon <= 109.5;

    const domesticDestinations = [
      "Ho Chi Minh City",
      "Da Nang",
      "Nha Trang",
      "Hoi An",
      "Ha Long",
      "Phu Quoc",
      "Da Lat",
      "Can Tho",
      "Hue",
      "Sapa",
    ];

    const internationalDestinations = [
      "Bangkok",
      "Singapore",
      "Kuala Lumpur",
      "Jakarta",
      "Manila",
      "Seoul",
      "Tokyo",
      "Taipei",
      "Hong Kong",
      "Phnom Penh",
    ];

    let destinations: string[];

    // Respect user's travel type choice
    if (travelType === "domestic") {
      destinations = isInVietnam
        ? domesticDestinations
        : ["Ho Chi Minh City", "Hanoi"]; // Default domestic for non-Vietnam users
      console.log("🏠 Using domestic destinations:", destinations);
    } else if (travelType === "international") {
      destinations = internationalDestinations;
      console.log("🌍 Using international destinations:", destinations);
    } else {
      // Fallback to mixed (shouldn't happen normally)
      destinations = isInVietnam
        ? [...domesticDestinations, ...internationalDestinations]
        : internationalDestinations;
      console.log("🎯 Using mixed destinations:", destinations);
    }

    const selectedDestination =
      destinations[Math.floor(Math.random() * destinations.length)];
    console.log("✅ Selected destination:", selectedDestination);
    return selectedDestination;
  }

  async function handleTravelDetailsSubmit() {
    // Validation based on flow
    const isValidForExistingPlan =
      selectedAnswer === true &&
      travelDetails.destination &&
      travelDetails.startDate &&
      travelDetails.endDate &&
      travelDetails.participants &&
      travelDetails.budget;
    const isValidForNewPlan =
      selectedAnswer !== true &&
      travelDetails.startDate &&
      travelDetails.endDate &&
      travelDetails.participants &&
      travelDetails.budget;

    console.log("🔍 Validation - Existing plan valid:", isValidForExistingPlan);
    console.log("🔍 Validation - New plan valid:", isValidForNewPlan);

    if (!isValidForExistingPlan && !isValidForNewPlan) {
      console.log("❌ Validation failed - missing required fields");
      return; // Don't submit if required fields are empty
    }

    isAnimating = true;
    showSuccessOverlay = true; // Show success overlay when form is submitted

    try {
      console.log("⏳ Starting API calls...");

      // Get user location
      const userLocation = await getUserLocation();

      if (!userLocation) {
        throw new Error("Could not get user location");
      }

      // Determine destination
      const destination =
        selectedAnswer === true
          ? travelDetails.destination
          : getRandomDestination(userLocation);

      console.log("🎯 Final destination:", destination);
      console.log("🔄 Travel type:", travelType);
      console.log("👤 Has existing plan:", selectedAnswer);

      // Fetch flight and hotel data concurrently
      console.log("📡 Making concurrent API calls...");
      const [flightData, hotelData] = await Promise.all([
        fetchFlightData(
          userLocation,
          destination,
          travelDetails.startDate,
          travelDetails.endDate
        ),
        fetchHotelData(
          destination,
          travelDetails.startDate,
          travelDetails.endDate,
          travelDetails.participants
        ),
      ]);

      console.log("📊 API Results:");
      console.log("✈️ Flight data:", flightData);
      console.log("🏨 Hotel data:", hotelData);

      // Check if we have at least some data to proceed
      const hasValidData = flightData || hotelData;
      const hasFlightSuccess = flightData && flightData.success;
      const hasHotelSuccess = hotelData && hotelData.success;

      console.log("🔍 Data validation:");
      console.log("- Has any data:", hasValidData);
      console.log("- Flight successful:", hasFlightSuccess);
      console.log("- Hotel successful:", hasHotelSuccess);

      if (!hasValidData) {
        console.log("⚠️ No data received from APIs, staying on current page");
        alert(
          "Unable to fetch travel data. Please check your connection and try again."
        );
        showSuccessOverlay = false;
        isAnimating = false;
        return;
      }

      // Proceed with data even if only one API succeeded
      setTimeout(() => {
        const dataToSend = {
          hasExistingPlan: selectedAnswer === true,
          travelType: travelType,
          destination: destination,
          startDate: travelDetails.startDate,
          endDate: travelDetails.endDate,
          participants: travelDetails.participants,
          budget: travelDetails.budget,
          flightData: flightData,
          hotelData: hotelData,
          userLocation: userLocation,
        };

        console.log("💾 Storing data to localStorage:", dataToSend);
        dispatch("travelDetails", dataToSend);

        // Navigate to plan results
        setTimeout(() => {
          // Store travel details in localStorage for planResults page
          localStorage.setItem("travelPlanData", JSON.stringify(dataToSend));
          console.log("🔄 Navigating to plan results...");

          // Navigate to plan results page
          window.location.href = "/planResults";
        }, 2000);
      }, 1000);
    } catch (error) {
      console.error("❌ Error creating travel plan:", error);
      // Show error message to user
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Error creating travel plan: ${errorMessage}. Please try again.`);
      showSuccessOverlay = false;
      isAnimating = false;
    }
  }

  function getUserIdFromToken() {
    try {
      const token = document.cookie
        .split("; ")
        .find(
          (row) =>
            row.startsWith("access_token=") || row.startsWith("accessToken=")
        )
        ?.split("=")[1];

      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.userId || payload.id;
      }
    } catch (error) {
      console.error("Error parsing token:", error);
    }
    return null;
  }

  interface Props {
    onAnswer?: (hasTravel: boolean) => void;
  }

  let { onAnswer = () => {} }: Props = $props();

  $effect(() => {
    if (selectedAnswer !== null) {
      onAnswer(selectedAnswer);
    }
  });
</script>

<div class="instruct-screen" class:answered={selectedAnswer !== null}>
  <!-- Animated Background -->
  <div class="animated-background">
    <div class="gradient-orb orb-1"></div>
    <div class="gradient-orb orb-2"></div>
    <div class="gradient-orb orb-3"></div>
  </div>

  <!-- Floating Particles -->
  <div class="floating-particles">
    {#each Array(20) as _, i}
      <div
        class="particle"
        style="
          animation-delay: {i * 200}ms;
          left: {Math.random() * 100}%;
          animation-duration: {3 + Math.random() * 4}s;
        "
      ></div>
    {/each}
  </div>

  <!-- Main Content -->
  {#if showContent}
    <div class="content-container" transition:fade={{ duration: 800 }}>
      <!-- Back Button (conditional) - Positioned at top -->
      {#if currentStep > 1}
        <div class="back-btn-container top">
          <button class="back-btn" onclick={goBack}>
            <span class="back-icon"><FaArrowLeft /></span>
            Back
          </button>
        </div>
      {/if}

      <!-- Header Section -->
      <div class="header-section">
        <div class="logo-container">
          <img src="/logo.png" alt="GoWise Logo" class="logo" />
          <div class="logo-glow"></div>
        </div>

        <div class="brand-name">
          <span class="brand-text">GoWise</span>
        </div>

        <div class="tagline">
          <span class="tagline-text">Your Travel Planning Assistant</span>
        </div>
      </div>

      <!-- Steps Container with fixed height -->
      <div class="steps-container">
        <!-- Step 1: Travel Plan Question -->
        <div
          class="step-wrapper"
          class:active={currentStep === 1}
          class:hidden={currentStep !== 1}
        >
          <div class="question-container">
            <h1 class="question-title">
              <span class="question-icon"><FaPlane /></span>
              Are you have a travel plan?
            </h1>
            <p class="question-subtitle">
              Let us know if you're planning a trip so we can personalize your
              experience
            </p>
          </div>

          <div class="answer-buttons">
            <button
              class="answer-btn yes-btn"
              class:selected={selectedAnswer === true}
              class:disabled={isAnimating}
              onclick={() => handleAnswer(true)}
            >
              <div class="btn-content">
                <span class="btn-icon"><FaBullseye /></span>
                <span class="btn-text">Yes, I do!</span>
                <span class="btn-subtitle">Help me plan</span>
              </div>
              <div class="btn-glow"></div>
            </button>

            <button
              class="answer-btn no-btn"
              class:selected={selectedAnswer === false}
              class:disabled={isAnimating}
              onclick={() => handleAnswer(false)}
            >
              <div class="btn-content">
                <span class="btn-icon"><FaStar /></span>
                <span class="btn-text">Not yet</span>
                <span class="btn-subtitle">Just exploring</span>
              </div>
              <div class="btn-glow"></div>
            </button>
          </div>
        </div>

        <!-- Step 2: Travel Type Question -->
        <div
          class="step-wrapper"
          class:active={currentStep === 2}
          class:hidden={currentStep !== 2}
        >
          <div class="question-container">
            <h1 class="question-title">
              <span class="question-icon"><FaMap /></span>
              Would you like to travel domestically or internationally?
            </h1>
            <p class="question-subtitle">
              Let us know your preference so we can suggest the best options
            </p>
          </div>

          <div class="answer-buttons">
            <button
              class="answer-btn domestic-btn"
              class:selected={travelType === "domestic"}
              class:disabled={isAnimating}
              onclick={() => handleTravelTypeAnswer("domestic")}
            >
              <div class="btn-content">
                <span class="btn-icon"><FaMapMarkerAlt /></span>
                <span class="btn-text">Domestic</span>
                <span class="btn-subtitle">Explore locally</span>
              </div>
              <div class="btn-glow"></div>
            </button>

            <button
              class="answer-btn international-btn"
              class:selected={travelType === "international"}
              class:disabled={isAnimating}
              onclick={() => handleTravelTypeAnswer("international")}
            >
              <div class="btn-content">
                <span class="btn-icon"><FaPlane /></span>
                <span class="btn-text">International</span>
                <span class="btn-subtitle">Go abroad</span>
              </div>
              <div class="btn-glow"></div>
            </button>
          </div>
        </div>

        <!-- Step 3: Travel Details Form -->
        <div
          class="step-wrapper form-step"
          class:active={currentStep === 3}
          class:hidden={currentStep !== 3}
        >
          <div class="question-container">
            <h1 class="question-title">
              <span class="question-icon"><FaRocket /></span>
              Tell us about your {selectedAnswer === true
                ? "travel plan"
                : travelType === "domestic"
                  ? "domestic trip"
                  : "international adventure"}
            </h1>
            <p class="question-subtitle">
              {selectedAnswer === true
                ? "Fill in the details so we can create the perfect plan for you"
                : "Just a few more details to get you started"}
            </p>
          </div>

          <div class="travel-form">
            {#if selectedAnswer === true}
              <div class="form-group">
                <label for="destination" class="form-label">
                  <span class="label-icon"><FaMapMarkerAlt /></span>
                  Destination
                </label>
                <input
                  id="destination"
                  type="text"
                  bind:value={travelDetails.destination}
                  placeholder="e.g., Tokyo, Japan"
                  class="form-input"
                />
              </div>
            {/if}

            <div class="form-row">
              <div class="form-group">
                <label for="startDate" class="form-label">
                  <span class="label-icon"><FaCalendarAlt /></span>
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  bind:value={travelDetails.startDate}
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="endDate" class="form-label">
                  <span class="label-icon"><FaCalendarAlt /></span>
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  bind:value={travelDetails.endDate}
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="participants" class="form-label">
                  <span class="label-icon"><FaMapMarkerAlt /></span>
                  Participants
                </label>
                <input
                  id="participants"
                  type="text"
                  bind:value={travelDetails.participants}
                  placeholder="2"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="budget" class="form-label">
                  <span class="label-icon"><FaMoneyBillWave /></span>
                  Budget (USD)
                </label>
                <input
                  id="budget"
                  type="text"
                  bind:value={travelDetails.budget}
                  placeholder={travelType === "domestic" ? "500" : "2,000"}
                  class="form-input"
                />
              </div>
            </div>

            <button
              class="submit-btn"
              class:disabled={(selectedAnswer === true &&
                !travelDetails.destination) ||
                !travelDetails.startDate ||
                !travelDetails.endDate ||
                !travelDetails.participants ||
                !travelDetails.budget ||
                isAnimating}
              onclick={handleTravelDetailsSubmit}
            >
              <span class="btn-icon"><FaRocket /></span>
              <span class="btn-text">
                {selectedAnswer === true
                  ? "Create Travel Plan"
                  : "Get Recommendations"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div
        class="progress-section"
        in:fly={{
          y: 20,
          duration: 700,
          delay: currentStep === 1 ? 1000 : 1200,
          easing: cubicOut,
        }}
        out:fade={{ duration: 300 }}
      >
        <div class="progress-dots">
          <div class="dot" class:active={currentStep >= 1}></div>
          <div class="dot" class:active={currentStep >= 2}></div>
          <div class="dot" class:active={currentStep >= 3}></div>
        </div>
        <p class="progress-text">Step {currentStep} of 3</p>
      </div>
    </div>
  {/if}

  <!-- Success Animation -->
  {#if showSuccessOverlay}
    <div class="success-overlay" transition:fade={{ duration: 500 }}>
      <div class="success-content">
        <div class="success-icon">
          {#if currentStep === 2}
            <FaCheckCircle />
          {:else if selectedAnswer === false}
            <FaHandPaper />
          {:else}
            <FaBullseye />
          {/if}
        </div>
        <div class="success-text">
          {currentStep === 3
            ? selectedAnswer === true
              ? "Perfect! We'll create your detailed travel plan!"
              : `Great! We'll find amazing ${travelType} destinations for you!`
            : "Let's get started on your journey!"}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .instruct-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.8s ease-out;
    z-index: 9999;
  }

  .instruct-screen.answered {
    transform: scale(1.05);
  }

  /* Animated Background */
  .animated-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      135deg,
      #0f172a 0%,
      #1e293b 25%,
      #334155 50%,
      #1e293b 75%,
      #0f172a 100%
    );
    background-size: 400% 400%;
    animation: gradientFlow 12s ease-in-out infinite;
  }

  @keyframes gradientFlow {
    0%,
    100% {
      background-position: 0% 50%;
    }
    25% {
      background-position: 100% 50%;
    }
    50% {
      background-position: 100% 100%;
    }
    75% {
      background-position: 0% 100%;
    }
  }

  .gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.4;
    animation: orbFloat 8s ease-in-out infinite;
  }

  .orb-1 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, #14b8a6, transparent 70%);
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }

  .orb-2 {
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, #06b6d4, transparent 70%);
    top: 60%;
    right: 15%;
    animation-delay: 3s;
  }

  .orb-3 {
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, #3b82f6, transparent 70%);
    bottom: 20%;
    left: 60%;
    animation-delay: 6s;
  }

  @keyframes orbFloat {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -30px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
  }

  /* Floating Particles */
  .floating-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .particle {
    position: absolute;
    width: 3px;
    height: 3px;
    background: rgba(20, 184, 166, 0.6);
    border-radius: 50%;
    animation: particleDrift linear infinite;
  }

  @keyframes particleDrift {
    0% {
      opacity: 0;
      transform: translateY(100vh) translateX(0) scale(0);
    }
    10% {
      opacity: 1;
      transform: translateY(90vh) translateX(10px) scale(1);
    }
    90% {
      opacity: 1;
      transform: translateY(10vh) translateX(-10px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(0vh) translateX(0) scale(0);
    }
  }

  /* Content Container */
  .content-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    max-width: 800px;
    width: 100%;
    padding: 1.5rem;
    padding-bottom: 2rem;
    position: relative;
    z-index: 10;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Header Section */
  .header-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
  }

  .logo-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo {
    width: 60px;
    height: 60px;
    filter: drop-shadow(0 0 20px rgba(20, 184, 166, 0.7));
    animation: logoSpin 8s linear infinite;
  }

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: radial-gradient(
      circle,
      rgba(20, 184, 166, 0.4) 0%,
      transparent 70%
    );
    border-radius: 50%;
    animation: glowPulse 3s ease-in-out infinite;
  }

  @keyframes logoSpin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes glowPulse {
    0%,
    100% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }

  .brand-text {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #14b8a6, #06b6d4, #3b82f6, #8b5cf6);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 400% 400%;
    animation: textShimmer 6s ease-in-out infinite;
    letter-spacing: -0.02em;
  }

  @keyframes textShimmer {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  .tagline-text {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
    letter-spacing: 0.05em;
    animation: fadeGlow 4s ease-in-out infinite;
  }

  @keyframes fadeGlow {
    0%,
    100% {
      opacity: 0.7;
    }
    50% {
      opacity: 1;
      text-shadow: 0 0 10px rgba(20, 184, 166, 0.3);
    }
  }

  /* Steps Container */
  .steps-container {
    position: relative;
    width: 100%;
    min-height: 550px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
  }

  .step-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateX(100px) scale(0.95);
    width: 100%;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
    padding: 0.5rem;
  }

  .step-wrapper.active {
    opacity: 1;
    transform: translate(-50%, -50%) translateX(0) scale(1);
    pointer-events: auto;
  }

  .step-wrapper.form-step.active {
    transform: translate(-50%, -55%) translateX(0) scale(1);
  }

  .step-wrapper.active .question-container {
    animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
  }

  .step-wrapper.active .answer-buttons {
    animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
  }

  .step-wrapper.active .travel-form {
    animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
  }

  .step-wrapper.hidden {
    opacity: 0;
    transform: translate(-50%, -50%) translateX(-100px) scale(0.95);
  }

  @keyframes slideInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    0% {
      opacity: 0;
      transform: translateX(-20px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .step-wrapper.form-step {
    padding: 1rem;
    transform: translate(-50%, -55%);
    max-height: none;
    overflow: visible;
  }

  .question-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .question-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    animation: titleGlow 3s ease-in-out infinite;
    line-height: 1.3;
  }

  .question-icon {
    width: 2rem;
    height: 2rem;
    animation: iconBounce 2s ease-in-out infinite;
    color: #14b8a6;
  }

  @keyframes titleGlow {
    0%,
    100% {
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    }
    50% {
      text-shadow: 0 0 30px rgba(20, 184, 166, 0.5);
    }
  }

  @keyframes iconBounce {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-5px) rotate(5deg);
    }
  }

  .question-subtitle {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 10px 0;
    line-height: 1.5;
  }

  /* Answer Buttons */
  .answer-buttons {
    display: flex;
    gap: 2rem;
    flex-wrap: nowrap;
    justify-content: center;
    width: 100%;
  }

  .answer-btn {
    position: relative;
    padding: 1.25rem 1.5rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 180px;
    flex: 1;
    max-width: 250px;
    overflow: hidden;
  }

  .answer-btn:hover:not(.disabled) {
    transform: translateY(-5px) scale(1.05);
    border-color: rgba(20, 184, 166, 0.5);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(20, 184, 166, 0.2);
  }

  .answer-btn.selected {
    border-color: #14b8a6;
    background: rgba(20, 184, 166, 0.2);
    transform: scale(1.1);
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.4),
      0 0 40px rgba(20, 184, 166, 0.4);
  }

  .answer-btn.disabled {
    pointer-events: none;
    opacity: 0.6;
  }

  .btn-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    position: relative;
    z-index: 2;
  }

  .btn-icon {
    width: 1.5rem;
    height: 1.5rem;
    animation: iconFloat 3s ease-in-out infinite;
    color: #14b8a6;
  }

  .yes-btn .btn-icon {
    animation-delay: 0s;
  }

  .no-btn .btn-icon {
    animation-delay: 1.5s;
  }

  @keyframes iconFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }

  .btn-text {
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin: 0;
  }

  .btn-subtitle {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  .btn-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(20, 184, 166, 0.1),
      transparent
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .answer-btn:hover .btn-glow {
    opacity: 1;
    animation: shimmer 2s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .travel-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 500px;
    margin-top: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
    min-height: 85px;
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin-bottom: 0.25rem;
  }

  .label-icon {
    width: 1.2rem;
    height: 1.2rem;
    color: #14b8a6;
  }

  .form-input {
    padding: 0.875rem 1rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    color: white;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    outline: none;
    color-scheme: dark;
  }

  .form-input[type="date"] {
    color-scheme: dark;
  }

  .form-input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.8;
    cursor: pointer;
  }

  .form-input[type="date"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }

  .form-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .form-input:focus {
    border-color: #14b8a6;
    box-shadow: 0 0 20px rgba(20, 184, 166, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    border: 2px solid #14b8a6;
    border-radius: 14px;
    background: linear-gradient(135deg, #14b8a6, #06b6d4);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    margin-top: 0.5rem;
    position: relative;
    overflow: hidden;
  }

  .submit-btn:hover:not(.disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(20, 184, 166, 0.4);
    background: linear-gradient(135deg, #0f9488, #0891b2);
  }

  .submit-btn.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .submit-btn .btn-icon {
    width: 1.1rem;
    height: 1.1rem;
    animation: rocketFloat 2s ease-in-out infinite;
    color: white;
  }

  @keyframes rocketFloat {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-2px);
    }
  }

  /* Back Button */
  .back-btn-container {
    align-self: flex-start;
    margin-bottom: 1rem;
  }

  .back-btn-container.top {
    position: absolute;
    top: 1.5rem;
    left: 1.5rem;
    margin-bottom: 0;
    z-index: 15;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(20, 184, 166, 0.5);
    transform: translateX(-3px);
  }

  .back-icon {
    width: 1rem;
    height: 1rem;
    color: #14b8a6;
  }

  /* Progress Section */
  .progress-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .progress-dots {
    display: flex;
    gap: 1rem;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }

  .dot.active {
    background: #14b8a6;
    box-shadow: 0 0 10px rgba(20, 184, 166, 0.5);
    animation: dotPulse 2s ease-in-out infinite;
  }

  @keyframes dotPulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  .progress-text {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* Success Overlay */
  .success-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
  }

  .success-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
  }

  .success-icon {
    width: 4rem;
    height: 4rem;
    animation: successBounce 0.6s ease-out;
    color: #14b8a6;
  }

  .success-text {
    font-size: 1.5rem;
    font-weight: 600;
    color: white;
    text-shadow: 0 0 20px rgba(20, 184, 166, 0.5);
  }

  @keyframes successBounce {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .content-container {
      gap: 1rem;
      padding: 1rem;
      max-width: 100%;
    }

    .back-btn-container.top {
      top: 1rem;
      left: 1rem;
    }

    .header-section {
      gap: 0.5rem;
    }

    .brand-text {
      font-size: 1.5rem;
    }

    .question-title {
      font-size: 1.5rem;
      flex-direction: column;
      gap: 0.5rem;
    }

    .answer-buttons {
      flex-direction: column;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .answer-btn {
      min-width: 100%;
      max-width: 100%;
      padding: 1rem 1.25rem;
      flex: none;
    }

    .form-row {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .steps-container {
      min-height: 480px;
    }

    .step-wrapper {
      max-width: 100%;
      padding: 0.75rem;
      gap: 1rem;
    }

    .step-wrapper.form-step {
      padding: 0.75rem;
      gap: 1rem;
      transform: translate(-50%, -50%);
    }

    .step-wrapper.form-step.active {
      transform: translate(-50%, -50%) translateX(0) scale(1);
    }

    .travel-form {
      gap: 1.25rem;
      max-width: 100%;
    }

    .form-group {
      min-height: 75px;
    }

    .question-container {
      gap: 0.375rem;
      margin-bottom: 0.125rem;
    }

    .logo {
      width: 50px;
      height: 50px;
    }

    .progress-section {
      gap: 0.5rem;
    }
  }

  @media (max-width: 1024px) and (min-width: 769px) {
    .answer-buttons {
      gap: 1.5rem;
    }

    .answer-btn {
      min-width: 160px;
      max-width: 200px;
    }
  }

  @media (max-width: 480px) {
    .content-container {
      gap: 0.75rem;
      padding: 0.75rem;
    }

    .back-btn-container.top {
      top: 0.75rem;
      left: 0.75rem;
    }

    .brand-text {
      font-size: 1.8rem;
    }

    .question-title {
      font-size: 1.4rem;
    }

    .question-subtitle {
      font-size: 1rem;
    }

    .steps-container {
      min-height: 420px;
    }

    .step-wrapper {
      gap: 0.75rem;
    }

    .step-wrapper.form-step {
      transform: translate(-50%, -45%);
      padding: 0.5rem;
    }

    .step-wrapper.form-step.active {
      transform: translate(-50%, -45%) translateX(0) scale(1);
    }

    .travel-form {
      gap: 1rem;
    }

    .form-group {
      min-height: 70px;
    }

    .answer-buttons {
      gap: 0.5rem;
    }
  }
</style>
