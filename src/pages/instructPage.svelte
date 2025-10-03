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
  let stepKey = $state(1); // Key to force component re-render for smoother transitions
  let travelType = $state<"domestic" | "international" | null>(null);
  let travelDetails = $state({
    destination: "",
    days: "",
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
        stepKey = 3; // Update key to force re-render
        isAnimating = false;
        // Keep selectedAnswer = true to show destination field
      }, 800);
    } else {
      // If user says "Not yet", go to domestic/international question (step 2)
      setTimeout(() => {
        currentStep = 2;
        stepKey = 2; // Update key to force re-render
        isAnimating = false;
        // Keep selectedAnswer = false for proper flow tracking
      }, 800);
    }
  }

  function handleTravelTypeAnswer(type: "domestic" | "international") {
    if (isAnimating) return;

    travelType = type;
    isAnimating = true;

    // Go to travel details form (step 3)
    setTimeout(() => {
      currentStep = 3;
      stepKey = 3; // Update key to force re-render
      isAnimating = false;
    }, 800);
  }

  function goBack() {
    if (isAnimating) return;

    isAnimating = true;

    if (currentStep === 3) {
      // From step 3, go back based on how we got here
      if (selectedAnswer === true) {
        // "Yes I do" users go back to step 1
        currentStep = 1;
        stepKey = 1;
        selectedAnswer = null;
      } else {
        // "Not yet" users go back to step 2
        currentStep = 2;
        stepKey = 2;
      }
    } else if (currentStep === 2) {
      // From step 2, go back to step 1
      currentStep = 1;
      stepKey = 1;
      selectedAnswer = null;
      travelType = null;
    }

    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }

  function handleTravelDetailsSubmit() {
    // Validation based on flow
    const isValidForExistingPlan =
      selectedAnswer === true &&
      travelDetails.destination &&
      travelDetails.days &&
      travelDetails.budget;
    const isValidForNewPlan =
      selectedAnswer !== true && travelDetails.days && travelDetails.budget;

    if (!isValidForExistingPlan && !isValidForNewPlan) {
      return; // Don't submit if required fields are empty
    }

    isAnimating = true;
    showSuccessOverlay = true; // Show success overlay when form is submitted

    // Dispatch travel details
    setTimeout(() => {
      const dataToSend = {
        hasExistingPlan: selectedAnswer === true,
        travelType: travelType,
        destination: selectedAnswer === true ? travelDetails.destination : null,
        days: parseInt(travelDetails.days),
        budget: travelDetails.budget,
      };

      dispatch("travelDetails", dataToSend);

      // Navigate to main screen
      setTimeout(() => {
        const userId = getUserIdFromToken();

        if (userId) {
          window.location.href = `/${userId}/mainScreen`;
        } else {
          window.location.href = "/";
        }
      }, 2000);
    }, 1000);
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

      <!-- Question Section - Step 1 -->
      {#if currentStep === 1}
        <div
          class="question-section"
          in:fly={{ y: 50, duration: 800, delay: 400, easing: cubicOut }}
          out:fly={{ y: -50, duration: 600, easing: quintOut }}
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

          <!-- Answer Buttons -->
          <div
            class="answer-buttons"
            in:fly={{ y: 30, duration: 700, delay: 800, easing: cubicOut }}
            out:fade={{ duration: 400 }}
          >
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
      {/if}

      <!-- Travel Type Question - Step 2 -->
      {#if currentStep === 2}
        <div
          class="question-section"
          in:fly={{ y: 50, duration: 800, delay: 400, easing: cubicOut }}
          out:fly={{ y: -50, duration: 600, easing: quintOut }}
        >
          <!-- Back Button -->
          <button class="back-btn" onclick={goBack}>
            <span class="back-icon"><FaArrowLeft /></span>
            Back
          </button>

          <div class="question-container">
            <h1 class="question-title">
              <span class="question-icon"><FaMap /></span>
              Would you like to travel domestically or internationally?
            </h1>
            <p class="question-subtitle">
              Let us know your preference so we can suggest the best options
            </p>
          </div>

          <!-- Travel Type Buttons -->
          <div
            class="answer-buttons"
            in:fly={{ y: 30, duration: 700, delay: 800, easing: cubicOut }}
            out:fade={{ duration: 400 }}
          >
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
      {/if}

      <!-- Travel Details Form - Step 3 -->
      {#if currentStep === 3}
        {#key stepKey}
          <div
            class="travel-details-section"
            in:fly={{ y: 50, duration: 800, delay: 200, easing: cubicOut }}
            out:fly={{ y: -30, duration: 500, easing: quintOut }}
          >
            <!-- Back Button -->
            <button class="back-btn" onclick={goBack}>
              <span class="back-icon"><FaArrowLeft /></span>
              Back
            </button>

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

            <!-- Travel Form -->
            <div class="travel-form" in:fade={{ duration: 600, delay: 400 }}>
              {#if selectedAnswer === true}
                <!-- Full form for users who already have a plan (only for "Yes I do") -->
                <div
                  class="form-group"
                  in:fly={{
                    y: 20,
                    duration: 500,
                    delay: 600,
                    easing: cubicOut,
                  }}
                >
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

              <div
                class="form-row"
                in:fly={{
                  y: 20,
                  duration: 500,
                  delay: selectedAnswer === true ? 800 : 600,
                  easing: cubicOut,
                }}
              >
                <div class="form-group">
                  <label for="days" class="form-label">
                    <span class="label-icon"><FaCalendarAlt /></span>
                    Duration (days)
                  </label>
                  <input
                    id="days"
                    type="number"
                    bind:value={travelDetails.days}
                    placeholder="7"
                    min="1"
                    max="365"
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
                in:scale={{
                  duration: 500,
                  delay: selectedAnswer === true ? 1000 : 800,
                  easing: cubicOut,
                  start: 0.8,
                }}
                class:disabled={(selectedAnswer === true &&
                  !travelDetails.destination) ||
                  !travelDetails.days ||
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
        {/key}
      {/if}

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
    gap: 2rem;
    max-width: 550px;
    padding: 1.5rem;
    position: relative;
    z-index: 10;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Header Section */
  .header-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
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

  /* Question Section */
  .question-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
    will-change: transform, opacity;
    width: 100%;
  }

  .question-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .question-title {
    font-size: 1.5rem;
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
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    line-height: 1.5;
  }

  /* Answer Buttons */
  .answer-buttons {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
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
    min-width: 160px;
    overflow: hidden;
  }

  .answer-btn:hover {
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

  /* Travel Details Form */
  .travel-details-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    text-align: center;
    width: 100%;
    max-width: 450px;
    will-change: transform, opacity;
  }

  .travel-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    will-change: transform, opacity;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
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
    padding: 1.25rem 1.5rem;
    border: 2px solid #14b8a6;
    border-radius: 14px;
    background: linear-gradient(135deg, #14b8a6, #06b6d4);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    margin-top: 0.75rem;
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
  .back-btn {
    align-self: flex-start;
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
    margin-bottom: 1rem;
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
    gap: 1rem;
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
      gap: 1.5rem;
      padding: 1rem;
      max-width: 100%;
    }

    .brand-text {
      font-size: 1.5rem;
    }

    .question-title {
      font-size: 1.25rem;
      flex-direction: column;
      gap: 0.5rem;
    }

    .answer-buttons {
      flex-direction: column;
      gap: 1rem;
    }

    .answer-btn {
      min-width: 140px;
      padding: 1rem 1.25rem;
    }

    .form-row {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .travel-details-section {
      max-width: 100%;
      gap: 1.5rem;
    }

    .logo {
      width: 50px;
      height: 50px;
    }
  }

  @media (max-width: 480px) {
    .brand-text {
      font-size: 1.8rem;
    }

    .question-title {
      font-size: 1.3rem;
    }

    .question-subtitle {
      font-size: 1rem;
    }
  }
</style>
