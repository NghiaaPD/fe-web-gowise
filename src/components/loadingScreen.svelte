<script lang="ts">
  import { onMount } from "svelte";

  let progress = $state(0);
  let isComplete = $state(false);

  interface Props {
    onComplete?: () => void;
    manualControl?: boolean;
  }

  let { onComplete = () => {}, manualControl = false }: Props = $props();

  onMount(() => {
    if (manualControl) {
      // In manual control mode, don't auto-increment progress
      return;
    }

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random increment between 5-20

      if (progress >= 95) {
        progress = 100;
        isComplete = true;
        clearInterval(interval);

        // Complete animation after a short delay
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 150); // Update every 150ms

    return () => clearInterval(interval);
  });

  // Function to complete loading manually
  export function completeLoading() {
    progress = 100;
    isComplete = true;
    setTimeout(() => {
      onComplete();
    }, 500);
  }
</script>

<div class="loading-screen" class:complete={isComplete}>
  <!-- Background -->
  <div class="loading-background"></div>

  <!-- Content Container -->
  <div class="loading-content">
    <!-- Logo -->
    <div class="logo-container">
      <img src="/logo.png" alt="GoWise Logo" class="logo" />
      <div class="logo-glow"></div>
    </div>

    <!-- Brand Name -->
    <div class="brand-name">
      <span class="brand-text">GoWise</span>
    </div>

    <!-- Loading Text -->
    <div class="loading-text">
      <span class="loading-label">loading</span>
      <span class="progress-dots">
        <span class="dot" style="animation-delay: 0ms">.</span>
        <span class="dot" style="animation-delay: 200ms">.</span>
        <span class="dot" style="animation-delay: 400ms">.</span>
      </span>
    </div>
  </div>

  <!-- Particles -->
  <div class="particles">
    {#each Array(12) as _, i}
      <div
        class="particle"
        style="animation-delay: {i * 100}ms; left: {10 + i * 7}%"
      ></div>
    {/each}
  </div>
</div>

<style>
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      opacity 0.8s ease-out,
      transform 0.8s ease-out;
  }

  .loading-screen.complete {
    opacity: 0;
    transform: scale(1.1);
    pointer-events: none;
  }

  .loading-background {
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
    animation: gradientShift 8s ease-in-out infinite;
  }

  @keyframes gradientShift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    position: relative;
    z-index: 10;
  }

  .logo-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo {
    width: 80px;
    height: 80px;
    filter: drop-shadow(0 0 20px rgba(20, 184, 166, 0.5));
    animation: logoFloat 3s ease-in-out infinite;
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
      rgba(20, 184, 166, 0.3) 0%,
      transparent 70%
    );
    border-radius: 50%;
    animation: glowPulse 2s ease-in-out infinite;
  }

  @keyframes logoFloat {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-10px) rotate(2deg);
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
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  .brand-name {
    margin: 0;
  }

  .brand-text {
    font-size: 3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #14b8a6, #06b6d4, #3b82f6);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 300% 300%;
    animation: textShimmer 4s ease-in-out infinite;
    letter-spacing: 0.05em;
    text-shadow: 0 0 30px rgba(20, 184, 166, 0.3);
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

  .loading-text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.05em;
  }

  .loading-label {
    color: #14b8a6;
  }

  .progress-dots {
    display: inline-flex;
    width: 20px;
  }

  .dot {
    animation: dotBounce 1.4s ease-in-out infinite both;
    color: #06b6d4;
  }

  @keyframes dotBounce {
    0%,
    80%,
    100% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
  }

  .particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
  }

  .particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: #14b8a6;
    border-radius: 50%;
    animation: particleFloat 6s linear infinite;
    opacity: 0;
  }

  @keyframes particleFloat {
    0% {
      opacity: 0;
      transform: translateY(100vh) scale(0);
    }
    10% {
      opacity: 1;
      transform: translateY(90vh) scale(1);
    }
    90% {
      opacity: 1;
      transform: translateY(10vh) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(0vh) scale(0);
    }
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .brand-text {
      font-size: 2.5rem;
    }

    .logo {
      width: 60px;
      height: 60px;
    }

    .logo-glow {
      width: 90px;
      height: 90px;
    }
  }

  @media (max-width: 480px) {
    .brand-text {
      font-size: 2rem;
    }

    .loading-content {
      gap: 1.5rem;
    }
  }
</style>
