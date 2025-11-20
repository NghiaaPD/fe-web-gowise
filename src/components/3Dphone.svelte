<script lang="ts">
  // 3D Phone component - clean và không có jQuery
  let { screenImage = "/mobile-bg.jpg" } = $props();
</script>

<div class="flex justify-center items-center min-h-[60vh]">
  <div class="perspective-container">
    <div class="phone-3d">
      <div class="background-circle"></div>
      <div class="phone-frame">
        <div class="phone-screen">
          <div class="notch">
            <div class="notch-camera"></div>
          </div>
          <img
            src={screenImage}
            alt="Phone Screen"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="phone-button-right"></div>
        <div class="phone-button-left"></div>
      </div>
      <div class="phone-shadow"></div>
    </div>
  </div>
</div>

<style>
  /* 3D Phone Container */
  .perspective-container {
    perspective: 1500px;
    perspective-origin: center top;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  /* Background Circle */
  .background-circle {
    position: absolute;
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      rgba(52, 211, 153, 0.3) 0%,
      rgba(20, 184, 166, 0.2) 30%,
      rgba(14, 116, 144, 0.15) 50%,
      transparent 70%
    );
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateZ(-200px) scale(1.1);
    pointer-events: none;
    filter: blur(2px);
    z-index: 0;
  }

  /* Main Phone Wrapper */
  .phone-3d {
    width: 320px;
    height: 650px;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s ease;
    animation: float 6s ease-in-out infinite;
    transform: rotateX(-15deg) rotateY(-5deg) rotateZ(2deg);
    z-index: 1;
  }

  .phone-3d:hover {
    transform: rotateX(-18deg) rotateY(-8deg) rotateZ(2deg) scale(1.05);
  }

  /* Phone Frame (Device Body) */
  .phone-frame {
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #1f1f1f, #0a0a0a);
    border-radius: 55px;
    padding: 8px;
    position: relative;
    z-index: 2;
    box-shadow:
      0 50px 100px rgba(0, 0, 0, 0.8),
      0 25px 50px rgba(0, 0, 0, 0.6),
      inset 0 1px 2px rgba(255, 255, 255, 0.05),
      inset 0 -1px 2px rgba(0, 0, 0, 0.8);
    position: relative;
    transform: translateZ(0);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  /* Phone Screen (Inner Display) */
  .phone-screen {
    width: 100%;
    height: 100%;
    background: #000;
    border-radius: 47px;
    overflow: hidden;
    position: relative;
    box-shadow:
      inset 0 0 30px rgba(0, 0, 0, 0.9),
      inset 0 1px 2px rgba(255, 255, 255, 0.03);
    transform: translateZ(10px);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    backface-visibility: hidden;
  }

  .phone-screen img {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    backface-visibility: hidden;
    transform: translateZ(0);
  }

  /* Notch (Dynamic Island) */
  .notch {
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 35px;
    background: #000;
    border-radius: 20px;
    z-index: 100;
    box-shadow:
      0 4px 10px rgba(0, 0, 0, 0.8),
      inset 0 1px 1px rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
  }

  .notch-camera {
    width: 12px;
    height: 12px;
    background: radial-gradient(circle, #1a1a2e 0%, #000 100%);
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Side Buttons */
  .phone-button-right {
    position: absolute;
    right: -3px;
    top: 140px;
    width: 4px;
    height: 85px;
    background: linear-gradient(90deg, #0a0a0a, #1f1f1f);
    border-radius: 0 2px 2px 0;
    box-shadow:
      inset -1px 0 2px rgba(0, 0, 0, 0.8),
      1px 0 2px rgba(0, 0, 0, 0.5);
  }

  .phone-button-left {
    position: absolute;
    left: -3px;
    top: 100px;
    width: 4px;
    height: 35px;
    background: linear-gradient(270deg, #0a0a0a, #1f1f1f);
    border-radius: 2px 0 0 2px;
    box-shadow:
      inset 1px 0 2px rgba(0, 0, 0, 0.8),
      -1px 0 2px rgba(0, 0, 0, 0.5);
  }

  .phone-button-left::after {
    content: "";
    position: absolute;
    top: 50px;
    left: 0;
    width: 4px;
    height: 50px;
    background: linear-gradient(270deg, #0a0a0a, #1f1f1f);
    border-radius: 2px 0 0 2px;
    box-shadow:
      inset 1px 0 2px rgba(0, 0, 0, 0.8),
      -1px 0 2px rgba(0, 0, 0, 0.5);
  }

  /* Phone Shadow (Ground Contact) */
  .phone-shadow {
    position: absolute;
    bottom: -60px;
    left: 50%;
    transform: translateX(-50%) rotateX(90deg);
    width: 280px;
    height: 600px;
    background: radial-gradient(
      ellipse,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.15) 30%,
      transparent 60%
    );
    filter: blur(25px);
    opacity: 0.5;
  }

  /* Float Animation */
  @keyframes float {
    0%,
    100% {
      transform: rotateX(-15deg) rotateY(-5deg) rotateZ(2deg) translateY(0px);
    }
    25% {
      transform: rotateX(-16deg) rotateY(-5deg) rotateZ(2deg) translateY(-15px);
    }
    50% {
      transform: rotateX(-14deg) rotateY(-6deg) rotateZ(2deg) translateY(-5px);
    }
    75% {
      transform: rotateX(-15deg) rotateY(-4deg) rotateZ(2deg) translateY(-10px);
    }
  }

  /* Responsive Adjustments */
  @media (max-width: 1024px) {
    .phone-3d {
      width: 280px;
      height: 570px;
    }
    .phone-shadow {
      width: 280px;
      height: 570px;
    }
  }

  @media (max-width: 768px) {
    .phone-3d {
      width: 240px;
      height: 490px;
    }
    .phone-shadow {
      width: 240px;
      height: 490px;
    }
  }
</style>
