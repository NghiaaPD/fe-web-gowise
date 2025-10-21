<script lang="ts">
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  import IoIosArrowForward from "svelte-icons/io/IoIosArrowForward.svelte";
  import IoIosArrowBack from "svelte-icons/io/IoIosArrowBack.svelte";
  import IoLogoFacebook from "svelte-icons/io/IoLogoFacebook.svelte";
  import IoLogoInstagram from "svelte-icons/io/IoLogoInstagram.svelte";
  import IoLogoYoutube from "svelte-icons/io/IoLogoYoutube.svelte";
  import IoLogoLinkedin from "svelte-icons/io/IoLogoLinkedin.svelte";

  import IoLogoIonitron from "svelte-icons/io/IoLogoIonitron.svelte";
  import IoMdPeople from "svelte-icons/io/IoMdPeople.svelte";
  import IoIosTimer from "svelte-icons/io/IoIosTimer.svelte";
  import IoMdLocate from "svelte-icons/io/IoMdLocate.svelte";

  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";
  import IoMdCheckmark from "svelte-icons/io/IoMdCheckmark.svelte";
  import IoMdClose from "svelte-icons/io/IoMdClose.svelte";
  import IoIosFlash from "svelte-icons/io/IoIosFlash.svelte";
  import FaShieldAlt from "svelte-icons/fa/FaShieldAlt.svelte";

  import FaBrain from "svelte-icons/fa/FaBrain.svelte";
  import FaCalendarAlt from "svelte-icons/fa/FaCalendarAlt.svelte";
  import IoIosPin from "svelte-icons/io/IoIosPin.svelte";
  import FaDollarSign from "svelte-icons/fa/FaDollarSign.svelte";
  import FaRegClock from "svelte-icons/fa/FaRegClock.svelte";

  import FaStar from "svelte-icons/fa/FaStar.svelte";
  import IoIosChatbubbles from "svelte-icons/io/IoIosChatbubbles.svelte";

  import IoIosCall from "svelte-icons/io/IoIosCall.svelte";
  import IoIosMail from "svelte-icons/io/IoIosMail.svelte";

  import AuthForm from "../components/authForm.svelte";

  const cards = [
    { title: "NIGHT", img: "/hodangquang.jpg" },
    { title: "MOUNTAIN", img: "/mountain.jpg" },
    { title: "FOREST", img: "/forest.jpg" },
  ];

  const socials = [
    { icon: IoLogoFacebook, link: "#" },
    { icon: IoLogoInstagram, link: "#" },
    { icon: IoLogoYoutube, link: "#" },
    { icon: IoLogoLinkedin, link: "#" },
  ];

  // Reviews data
  const reviews = [
    {
      id: 1,
      text: "GoWise planned my entire European vacation in 30 seconds! The itinerary was so detailed and personalized. Every restaurant, activity, and hotel was perfect for my taste and budget.",
      author: "Sarah Johnson",
      location: "San Francisco, USA",
      plan: "Premium Plan",
      trip: "14-day Europe Trip",
      avatar: "/user-avatar.jpg",
    },
    {
      id: 2,
      text: "Amazing experience! The AI understood exactly what I wanted for my honeymoon. It found hidden gems in Bali that we never would have discovered on our own.",
      author: "Michael Chen",
      location: "New York, USA",
      plan: "Premium Plan",
      trip: "7-day Bali Honeymoon",
      avatar: "/user-avatar.jpg",
    },
    {
      id: 3,
      text: "As a solo female traveler, safety was my top concern. GoWise created a perfect itinerary with safe accommodations and reliable transportation for my Japan trip.",
      author: "Emma Rodriguez",
      location: "Madrid, Spain",
      plan: "Basic Plan",
      trip: "10-day Japan Solo Trip",
      avatar: "/user-avatar.jpg",
    },
    {
      id: 4,
      text: "The budget optimization feature saved me over $800 on my family vacation to Thailand. The AI found amazing deals while keeping all our must-have activities.",
      author: "David Kim",
      location: "Toronto, Canada",
      plan: "Premium Plan",
      trip: "12-day Thailand Family Trip",
      avatar: "/user-avatar.jpg",
    },
  ];

  // Background images array
  const backgrounds = ["/beach.jpg", ...cards.map((card) => card.img)];

  let currentBgIndex = $state(0);
  let currentReviewIndex = $state(0);
  let isTransitioning = $state(false);

  // Add state for auth form
  let showAuthForm = $state(false);

  function nextBackground() {
    currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
  }

  function prevBackground() {
    currentBgIndex =
      currentBgIndex === 0 ? backgrounds.length - 1 : currentBgIndex - 1;
  }

  function nextReview() {
    if (isTransitioning) return;
    isTransitioning = true;
    setTimeout(() => {
      currentReviewIndex = (currentReviewIndex + 1) % reviews.length;
      isTransitioning = false;
    }, 150);
  }

  function prevReview() {
    if (isTransitioning) return;
    isTransitioning = true;
    setTimeout(() => {
      currentReviewIndex =
        currentReviewIndex === 0 ? reviews.length - 1 : currentReviewIndex - 1;
      isTransitioning = false;
    }, 150);
  }

  function goToReview(index: number) {
    if (isTransitioning || index === currentReviewIndex) return;
    isTransitioning = true;
    setTimeout(() => {
      currentReviewIndex = index;
      isTransitioning = false;
    }, 150);
  }

  // Auth form handlers
  function showAuth() {
    showAuthForm = true;
  }

  function hideAuth() {
    showAuthForm = false;
  }
</script>

<!-- Main content wrapper -->
<div>
  <section id="home">
    <div
      class="bg-cover bg-center min-h-screen text-white relative transition-all duration-500"
      style="background-image: url('{backgrounds[currentBgIndex]}');"
    >
      <!-- Overlay màu xanh nhẹ -->
      <div class="absolute inset-0 bg-teal-500/20"></div>

      <!-- Header -->
      <header
        class="relative flex items-center justify-between px-10 py-6 bg-white/20 backdrop-blur-sm"
      >
        <div class="text-2xl font-bold flex items-center">
          <img src="/logo.png" alt="GoWise Logo" class="mr-2 w-8 h-8" />
          GoWise
        </div>
        <nav class="hidden md:flex space-x-8 font-semibold text-sm">
          <a href="#home" class="hover:underline hover:decoration-teal-500"
            >HOME</a
          >
          <a href="#features" class="hover:underline hover:decoration-teal-500"
            >FEATURES</a
          >
          <a href="#pricing" class="hover:underline hover:decoration-teal-500"
            >PRICING</a
          >
          <a
            href="#how-it-works"
            class="hover:underline hover:decoration-teal-500">HOW IT WORKS</a
          >
          <a href="#contact" class="hover:underline hover:decoration-teal-500"
            >CONTACT</a
          >
        </nav>
        <div class="flex items-center space-x-6">
          <button
            onclick={showAuth}
            class="bg-[#14B8A6] hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold text-sm cursor-pointer"
          >
            Sign In
          </button>
          <div class="flex space-x-3">
            {#each socials as s}
              <a
                href={s.link}
                class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 text-white hover:scale-110 hover:text-teal-600"
              >
                <div class="w-5 h-5">
                  {#if s.icon === IoLogoFacebook}
                    <IoLogoFacebook />
                  {:else if s.icon === IoLogoInstagram}
                    <IoLogoInstagram />
                  {:else if s.icon === IoLogoYoutube}
                    <IoLogoYoutube />
                  {:else if s.icon === IoLogoLinkedin}
                    <IoLogoLinkedin />
                  {/if}
                </div>
              </a>
            {/each}
          </div>
        </div>
      </header>

      <!-- Hero + Cards -->
      <section
        class="flex flex-col lg:flex-row items-center justify-between px-10 mt-16 space-y-12 lg:space-y-0 lg:gap-0"
      >
        <!-- Text bên trái -->
        <div class="lg:w-1/2 flex justify-center relative">
          <div class="text-left">
            <h1 class="text-5xl md:text-6xl font-bold leading-tight mb-6">
              AUTOMATE YOUR<br />
              PERSONALIZED<br />
              TRAVEL PLANNING.
            </h1>
            <p class="mt-6 text-lg text-white/90 mb-8 max-w-lg">
              Let our AI create perfect itineraries tailored to your
              preferences, budget, and travel style. From flights to activities,
              everything planned automatically in seconds.
            </p>
            <div class="mt-8 space-x-4">
              <button
                onclick={showAuth}
                class="bg-[#14B8A6] hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-bold text-sm cursor-pointer"
              >
                START FREE TRIAL
              </button>
              <button
                type="button"
                class="border-2 border-white/50 px-8 py-3 font-bold hover:bg-white/50 text-sm rounded-lg cursor-pointer"
              >
                WATCH DEMO
              </button>
            </div>
          </div>
        </div>

        <!-- Cards bên phải -->
        <div class="flex lg:w-1/2 justify-center items-center">
          {#each cards as { title, img }, index}
            <div
              class="relative w-54 h-74 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300 mx-3 {currentBgIndex ===
              index + 1
                ? 'ring-4 ring-white/50 scale-110'
                : ''}"
            >
              <img src={img} alt={title} class="w-full h-full object-cover" />
              <div
                class="absolute bottom-0 bg-gradient-to-t from-black/80 to-transparent w-full py-4 text-center"
              >
                <div class="text-lg font-bold">{title}</div>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Footer Navigation -->
      <div
        class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-4"
      >
        <button
          class="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm text-white border border-white/20 hover:bg-white/40 transition p-3 cursor-pointer"
          onclick={prevBackground}
        >
          <IoIosArrowBack />
        </button>
        <button
          class="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm text-white border border-white/20 hover:bg-white/40 transition p-3 cursor-pointer"
          onclick={nextBackground}
        >
          <IoIosArrowForward />
        </button>
      </div>
      <div
        class="absolute bottom-8 right-10 text-white font-bold tracking-widest"
      >
        — {String(currentBgIndex + 1).padStart(2, "0")}
      </div>
    </div>
  </section>
  <section id="how-it-works" class="bg-gray-50 py-20 px-10">
    <div class="max-w-7xl mx-auto">
      <!-- Main Content: Stats + Steps -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <!-- Left Column: Title + Stats Grid -->
        <div>
          <!-- Title và description -->
          <div class="mb-12">
            <p class="text-teal-500 font-bold text-sm tracking-widest mb-4">
              HOW IT WORKS
            </p>
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Travel<br />
              Planning Made Simple
            </h2>
            <p class="text-gray-600 text-lg">
              Our advanced AI analyzes millions of travel data points, your
              preferences, and real-time information to create the perfect
              personalized itinerary. No more hours of research - just tell us
              what you want and let AI do the rest.
            </p>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-8">
            <!-- 10K+ AI Itineraries Created -->
            <div class="text-center">
              <div
                class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <div class="w-8 h-8 text-teal-500">
                  <IoLogoIonitron />
                </div>
              </div>
              <div class="text-3xl font-bold text-gray-900 mb-2">10K+</div>
              <div class="text-gray-600 text-sm">AI Itineraries Created</div>
            </div>

            <!-- 5K+ Happy Users -->
            <div class="text-center">
              <div
                class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <div class="w-8 h-8 text-teal-500">
                  <IoMdPeople />
                </div>
              </div>
              <div class="text-3xl font-bold text-gray-900 mb-2">5K+</div>
              <div class="text-gray-600 text-sm">Happy Users</div>
            </div>

            <!-- 30sec Average Planning Time -->
            <div class="text-center">
              <div
                class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <div class="w-8 h-8 text-teal-500">
                  <IoIosTimer />
                </div>
              </div>
              <div class="text-3xl font-bold text-gray-900 mb-2">30sec</div>
              <div class="text-gray-600 text-sm">Average Planning Time</div>
            </div>

            <!-- 200+ Destinations Covered -->
            <div class="text-center">
              <div
                class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <div class="w-8 h-8 text-teal-500">
                  <IoMdLocate />
                </div>
              </div>
              <div class="text-3xl font-bold text-gray-900 mb-2">200+</div>
              <div class="text-gray-600 text-sm">Destinations Covered</div>
            </div>
          </div>
        </div>

        <!-- Right Column: Steps -->
        <div class="space-y-6">
          <!-- Step 1 -->
          <div
            class="p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:rotateX-360 transition-transform duration-700 cursor-pointer"
            style="background-color: #F9FAFB;"
          >
            <div
              class="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            >
              1
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                Tell Us Your Preferences
              </h3>
              <p class="text-gray-600">
                Share your travel style, budget, interests, and any special
                requirements.
              </p>
            </div>
          </div>

          <!-- Step 2 -->
          <div
            class="p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:rotateX-360 transition-transform duration-700 cursor-pointer"
            style="background-color: #F9FAFB;"
          >
            <div
              class="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            >
              2
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                AI Analyzes & Plans
              </h3>
              <p class="text-gray-600">
                Our AI processes millions of data points to create your perfect
                itinerary.
              </p>
            </div>
          </div>

          <!-- Step 3 -->
          <div
            class="p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:rotateX-360 transition-transform duration-700 cursor-pointer"
            style="background-color: #F9FAFB;"
          >
            <div
              class="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            >
              3
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">
                Get Your Custom Plan
              </h3>
              <p class="text-gray-600">
                Receive a detailed, personalized travel plan with bookings and
                recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section id="pricing" class="bg-white py-20 px-10">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <p class="text-teal-500 font-bold text-sm tracking-widest mb-4">
          PRICING PLANS
        </p>
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Choose Your AI Travel Assistant
        </h2>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          Start with our free plan or unlock the full power of AI travel
          planning with Premium for less than the cost of a coffee.
        </p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <!-- Basic Plan -->
        <div
          class="bg-white border border-gray-200 rounded-2xl p-8 relative shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:border-teal-300"
        >
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Basic Plan</h3>
            <div class="flex items-baseline justify-center">
              <span class="text-5xl font-bold text-gray-900">FREE</span>
              <span class="text-gray-500 ml-2">Forever</span>
            </div>
            <p class="text-gray-600 mt-4">
              Perfect for occasional travelers who want to try AI planning
            </p>
          </div>

          <!-- What's Included -->
          <div class="mb-8">
            <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
              <div class="w-4 h-4 text-teal-500 mr-2">
                <IoMdCheckmark />
              </div>
              What's Included:
            </h4>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Up to 3 AI itineraries per month
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Basic destination recommendations
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Standard travel templates
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Email support
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Mobile app access
              </li>
            </ul>
          </div>

          <!-- Limitations -->
          <div class="mb-8">
            <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
              <div class="w-4 h-4 text-red-500 mr-2">
                <IoMdClose />
              </div>
              Limitations:
            </h4>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-500">
                <div class="w-4 h-4 text-red-500 mr-3">
                  <IoMdClose />
                </div>
                No real-time updates
              </li>
              <li class="flex items-center text-gray-500">
                <div class="w-4 h-4 text-red-500 mr-3">
                  <IoMdClose />
                </div>
                Limited customization options
              </li>
              <li class="flex items-center text-gray-500">
                <div class="w-4 h-4 text-red-500 mr-3">
                  <IoMdClose />
                </div>
                No premium destinations
              </li>
              <li class="flex items-center text-gray-500">
                <div class="w-4 h-4 text-red-500 mr-3">
                  <IoMdClose />
                </div>
                Basic customer support
              </li>
            </ul>
          </div>

          <button
            onclick={showAuth}
            class="w-full bg-white border-2 border-teal-500 text-teal-500 py-3 rounded-lg font-semibold hover:bg-teal-50 hover:scale-105 transition-all duration-300 hover:shadow-lg cursor-pointer"
          >
            Start Free
          </button>
        </div>

        <!-- Premium Plan -->
        <div
          class="bg-white border-2 border-teal-500 rounded-2xl p-8 relative shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 hover:border-teal-400 hover:bg-gradient-to-br hover:from-teal-50 hover:to-white"
        >
          <!-- Most Popular Badge -->
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div
              class="bg-teal-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg hover:bg-teal-600 transition-colors duration-300"
            >
              <div class="w-4 h-4 mr-2">
                <IoIosStar />
              </div>
              Most Popular
            </div>
          </div>

          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
            <div class="flex items-baseline justify-center">
              <span class="text-5xl font-bold text-gray-900">$1.99</span>
              <span class="text-gray-500 ml-2">per month</span>
            </div>
            <p class="text-gray-600 mt-4">
              For serious travelers who want the full AI experience
            </p>
          </div>

          <!-- What's Included -->
          <div class="mb-8">
            <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
              <div class="w-4 h-4 text-teal-500 mr-2">
                <IoMdCheckmark />
              </div>
              What's Included:
            </h4>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Unlimited AI itineraries
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Advanced personalization
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Real-time itinerary updates
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Premium destinations & experiences
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Priority customer support
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Offline access
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Group travel planning
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Budget optimization
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Local insider recommendations
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3">
                  <IoMdCheckmark />
                </div>
                Travel insurance integration
              </li>
            </ul>
          </div>

          <button
            onclick={showAuth}
            class="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 hover:scale-105 transition-all duration-300 flex items-center justify-center hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
          >
            Start Premium
            <div class="w-6 h-6 ml-2">
              <IoIosFlash />
            </div>
          </button>
        </div>
      </div>

      <!-- Money Back Guarantee -->
      <div class="text-center mt-12">
        <div
          class="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-6 py-3"
        >
          <div class="w-5 h-5 text-green-700 mr-2">
            <FaShieldAlt />
          </div>
          <span class="text-green-700 font-semibold"
            >30-day money-back guarantee</span
          >
        </div>
        <p class="text-gray-600 mt-4">
          Try Premium risk-free. If you're not completely satisfied, get a full
          refund within 30 days.
        </p>
      </div>
    </div>
  </section>
  <section id="features" class="bg-gray-50 py-20 px-10">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <p class="text-teal-500 font-bold text-sm tracking-widest mb-4">
          AI FEATURES
        </p>
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Powerful AI Travel Planning Features
        </h2>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          Experience the future of travel planning with our cutting-edge AI
          technology that makes personalized trip planning effortless and
          intelligent.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <!-- Smart AI Planning -->
        <div
          class="text-center group cursor-pointer bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-gradient-to-br hover:from-teal-500 hover:to-teal-600 border border-gray-100 hover:border-teal-200"
        >
          <div
            class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#14B8A6] group-hover:scale-110 transition-all duration-300"
          >
            <div class="w-8 h-8 text-teal-500 group-hover:text-white">
              <FaBrain />
            </div>
          </div>
          <h3
            class="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors duration-300"
          >
            Smart AI Planning
          </h3>
          <p
            class="text-gray-600 group-hover:text-white transition-colors duration-300"
          >
            Advanced machine learning algorithms analyze your preferences to
            create perfect itineraries tailored just for you.
          </p>
        </div>

        <!-- Instant Itineraries -->
        <div
          class="text-center group cursor-pointer bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-gradient-to-br hover:from-teal-500 hover:to-teal-600 border border-gray-100 hover:border-teal-200"
        >
          <div
            class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#14B8A6] group-hover:scale-110 transition-all duration-300"
          >
            <div class="w-8 h-8 text-teal-500 group-hover:text-white">
              <FaCalendarAlt />
            </div>
          </div>
          <h3
            class="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors duration-300"
          >
            Instant Itineraries
          </h3>
          <p
            class="text-gray-600 group-hover:text-white transition-colors duration-300"
          >
            Get complete travel plans in under 30 seconds, including flights,
            hotels, activities, and dining recommendations.
          </p>
        </div>

        <!-- Local Insights -->
        <div
          class="text-center group cursor-pointer bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-gradient-to-br hover:from-teal-500 hover:to-teal-600 border border-gray-100 hover:border-teal-200"
        >
          <div
            class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#14B8A6] group-hover:scale-110 transition-all duration-300"
          >
            <div class="w-8 h-8 text-teal-500 group-hover:text-white">
              <IoIosPin />
            </div>
          </div>
          <h3
            class="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors duration-300"
          >
            Local Insights
          </h3>
          <p
            class="text-gray-600 group-hover:text-white transition-colors duration-300"
          >
            Access hidden gems and local experiences that only AI can discover
            by analyzing millions of traveler reviews.
          </p>
        </div>

        <!-- Budget Optimization -->
        <div
          class="text-center group cursor-pointer bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-gradient-to-br hover:from-teal-500 hover:to-teal-600 border border-gray-100 hover:border-teal-200"
        >
          <div
            class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#14B8A6] group-hover:scale-110 transition-all duration-300"
          >
            <div class="w-8 h-8 text-teal-500 group-hover:text-white">
              <FaDollarSign />
            </div>
          </div>
          <h3
            class="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors duration-300"
          >
            Budget Optimization
          </h3>
          <p
            class="text-gray-600 group-hover:text-white transition-colors duration-300"
          >
            AI finds the best deals and optimizes your spending to get maximum
            value within your specified budget.
          </p>
        </div>

        <!-- Real-time Updates -->
        <div
          class="text-center group cursor-pointer bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-gradient-to-br hover:from-teal-500 hover:to-teal-600 border border-gray-100 hover:border-teal-200"
        >
          <div
            class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#14B8A6] group-hover:scale-110 transition-all duration-300"
          >
            <div class="w-8 h-8 text-teal-500 group-hover:text-white">
              <FaRegClock />
            </div>
          </div>
          <h3
            class="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors duration-300"
          >
            Real-time Updates
          </h3>
          <p
            class="text-gray-600 group-hover:text-white transition-colors duration-300"
          >
            Dynamic itinerary adjustments based on weather, events, and
            real-time availability for seamless travel.
          </p>
        </div>

        <!-- Travel Protection -->
        <div
          class="text-center group cursor-pointer bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:bg-gradient-to-br hover:from-teal-500 hover:to-teal-600 border border-gray-100 hover:border-teal-200"
        >
          <div
            class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#14B8A6] group-hover:scale-110 transition-all duration-300"
          >
            <div class="w-8 h-8 text-teal-500 group-hover:text-white">
              <FaShieldAlt />
            </div>
          </div>
          <h3
            class="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors duration-300"
          >
            Travel Protection
          </h3>
          <p
            class="text-gray-600 group-hover:text-white transition-colors duration-300"
          >
            Built-in travel insurance recommendations and 24/7 AI support to
            handle any unexpected situations.
          </p>
        </div>
      </div>

      <!-- CTA Section -->
      <div
        class="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-12 text-center text-white relative overflow-hidden group"
      >
        <!-- Animated background overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-gradient-move"
        ></div>

        <!-- Content -->
        <div class="relative z-10">
          <h3 class="text-3xl font-bold mb-4">See GoWise in Action</h3>
          <p class="text-lg mb-8 max-w-2xl mx-auto">
            Watch how our AI creates a complete 7-day European itinerary in
            under 30 seconds, including flights, hotels, activities, and local
            recommendations.
          </p>
          <div class="space-x-4">
            <button
              class="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition cursor-pointer transform hover:scale-105"
            >
              Watch Demo Video
            </button>
            <button
              onclick={showAuth}
              class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition cursor-pointer transform hover:scale-105"
            >
              Try Free Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="bg-white py-20 px-10">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16">
        <p class="text-teal-500 font-bold text-sm tracking-widest mb-4">
          USER REVIEWS
        </p>
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Travelers Love GoWise
        </h2>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          Join thousands of satisfied travelers who have discovered the power of
          AI-driven personalized travel planning.
        </p>
      </div>

      <!-- Review Card -->
      <div class="max-w-4xl mx-auto">
        <div
          class="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 relative overflow-hidden min-h-[400px]"
        >
          <!-- Quote Icon -->
          <div class="flex justify-center mb-4 -mt-8">
            <div class="w-16 h-16 text-teal-400">
              <IoIosChatbubbles />
            </div>
          </div>

          <!-- Stars -->
          <div class="flex justify-center mb-4">
            {#each Array(5) as _, i}
              <div class="w-8 h-8 text-yellow-400">
                <FaStar />
              </div>
            {/each}
          </div>

          <!-- Review Content with Transition -->
          {#key currentReviewIndex}
            <div
              in:fly={{ x: 100, duration: 600, easing: quintOut }}
              out:fly={{ x: -100, duration: 300, easing: quintOut }}
              class="absolute inset-x-12 top-32"
            >
              <!-- Review Text -->
              <blockquote class="text-center mb-8 mt-2">
                <p
                  class="text-xl md:text-2xl text-gray-700 italic leading-relaxed"
                >
                  "{reviews[currentReviewIndex].text}"
                </p>
              </blockquote>

              <!-- User Info -->
              <div class="flex items-center justify-center space-x-4">
                <img
                  src={reviews[currentReviewIndex].avatar}
                  alt={reviews[currentReviewIndex].author}
                  class="w-16 h-16 rounded-full object-cover border-4 border-gray-100"
                />
                <div class="text-left">
                  <div class="font-bold text-lg text-gray-900">
                    {reviews[currentReviewIndex].author}
                  </div>
                  <div class="text-gray-600">
                    {reviews[currentReviewIndex].location}
                  </div>
                  <div class="flex items-center space-x-2 mt-1">
                    <span
                      class="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {reviews[currentReviewIndex].plan}
                    </span>
                    <span class="text-gray-500 text-sm">
                      {reviews[currentReviewIndex].trip}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          {/key}
        </div>

        <!-- Navigation Dots -->
        <div class="flex justify-center items-center space-x-4 mt-8">
          <button
            class="p-3 text-gray-400 hover:text-teal-500 transition-all duration-300 cursor-pointer bg-white rounded-full shadow-md hover:shadow-lg hover:bg-teal-50 active:scale-95 active:bg-teal-100 border border-gray-100 hover:border-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous review"
            onclick={prevReview}
            disabled={isTransitioning}
          >
            <div class="w-6 h-6">
              <IoIosArrowBack />
            </div>
          </button>

          <div class="flex space-x-2">
            {#each reviews as review, index}
              <button
                class="w-3 h-3 rounded-full transition-all duration-300 cursor-pointer hover:scale-110 active:scale-90 disabled:cursor-not-allowed {currentReviewIndex ===
                index
                  ? 'bg-teal-500 shadow-md'
                  : 'bg-gray-300 hover:bg-gray-400'}"
                aria-label="Go to review {index + 1}"
                onclick={() => goToReview(index)}
                disabled={isTransitioning}
              ></button>
            {/each}
          </div>

          <button
            class="p-3 text-gray-400 hover:text-teal-500 transition-all duration-300 cursor-pointer bg-white rounded-full shadow-md hover:shadow-lg hover:bg-teal-50 active:scale-95 active:bg-teal-100 border border-gray-100 hover:border-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next review"
            onclick={nextReview}
            disabled={isTransitioning}
          >
            <div class="w-6 h-6">
              <IoIosArrowForward />
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
  <!-- Newsletter Section -->
  <section class="bg-gradient-to-r from-teal-500 to-blue-600 py-20 px-10">
    <div class="max-w-4xl mx-auto text-center">
      <!-- Icon -->
      <!-- <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
        <div class="w-10 h-10 text-white">
          <FaCalendarAlt />
        </div>
      </div> -->
      <img
        src="/logo.png"
        alt="GoWise Logo"
        class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8"
      />

      <!-- Title -->
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
        Get AI Travel Tips & Updates
      </h2>

      <!-- Description -->
      <p class="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
        Subscribe to receive the latest AI travel planning tips, destination
        insights, and exclusive updates about new GoWise features.
      </p>

      <!-- Email Form -->
      <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
        <input
          type="email"
          placeholder="Enter your email for AI travel tips"
          class="flex-1 px-6 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
        />
        <button
          class="bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-lg font-semibold transition cursor-pointer flex items-center justify-center"
        >
          Subscribe
          <div class="w-5 h-5 ml-2">
            <IoIosArrowForward />
          </div>
        </button>
      </div>

      <!-- Small Text -->
      <p class="text-sm text-white/70">
        Join 10,000+ travelers getting AI-powered travel insights. Unsubscribe
        anytime.
      </p>
    </div>
  </section>

  <!-- Footer -->
  <footer id="contact" class="bg-gray-900 text-white py-16 px-10">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div class="md:col-span-1">
          <div class="flex items-center mb-6">
            <img src="/logo.png" alt="GoWise Logo" class="mr-3 w-8 h-8" />
            <span class="text-2xl font-bold text-teal-400">GoWise</span>
          </div>
          <p class="text-gray-400 mb-6 leading-relaxed">
            The world's most advanced AI travel planning software. Create
            personalized itineraries in seconds with the power of artificial
            intelligence.
          </p>

          <!-- Social Icons -->
          <div class="flex space-x-4">
            <a
              href="https://www.facebook.com/profile.php?id=61580929276868"
              class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-all duration-300 cursor-pointer"
            >
              <div class="w-5 h-5">
                <IoLogoFacebook />
              </div>
            </a>
            <a
              href="#"
              class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-all duration-300 cursor-pointer"
            >
              <div class="w-5 h-5">
                <IoLogoInstagram />
              </div>
            </a>
            <a
              href="#"
              class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-all duration-300 cursor-pointer"
            >
              <div class="w-5 h-5">
                <IoLogoYoutube />
              </div>
            </a>
            <a
              href="#"
              class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-all duration-300 cursor-pointer"
            >
              <div class="w-5 h-5">
                <IoLogoLinkedin />
              </div>
            </a>
          </div>
        </div>

        <!-- Product -->
        <div>
          <h3 class="text-xl font-bold mb-6 text-white">Product</h3>
          <ul class="space-y-3">
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >Features</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >Pricing</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >API Access</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >Mobile App</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >Integrations</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >Enterprise</a
              >
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-xl font-bold mb-6 text-white">Support</h3>
          <ul class="space-y-3">
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >Help Center</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >Documentation</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >AI Training</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >Community</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >Status Page</a
              >
            </li>
            <li>
              <a
                href="#"
                class="text-gray-400 hover:text-teal-400 transition cursor-pointer"
                >Contact Support</a
              >
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-xl font-bold mb-6 text-white">Contact</h3>
          <div class="space-y-4">
            <div class="flex items-center text-gray-400">
              <div class="w-5 h-5 mr-3 text-teal-400">
                <IoIosPin />
              </div>
              Ho Chi Minh City, Vietnam
            </div>
            <div class="flex items-center text-gray-400">
              <div class="w-5 h-5 mr-3 text-teal-400">
                <IoIosCall />
              </div>
              +84 696969696969
            </div>
            <div class="flex items-center text-gray-400">
              <div class="w-5 h-5 mr-3 text-teal-400">
                <IoIosMail />
              </div>
              gowise2025@gmail.com
            </div>
          </div>

          <!-- AI Support Badge -->
          <div class="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div class="text-white font-semibold mb-2">
              AI Support Available
            </div>
            <div class="text-sm text-gray-400">
              24/7 AI-powered customer support for Premium users
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Footer -->
      <div
        class="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
      >
        <div class="text-gray-400 text-sm">
          © 2024 GoWise. All rights reserved.
        </div>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a
            href="#"
            class="text-gray-400 hover:text-teal-400 text-sm transition cursor-pointer"
            >Privacy Policy</a
          >
          <a
            href="#"
            class="text-gray-400 hover:text-teal-400 text-sm transition cursor-pointer"
            >Terms of Service</a
          >
          <button
            type="button"
            class="text-gray-400 hover:text-teal-400 text-sm transition cursor-pointer"
            >Cookie Policy</button
          >
        </div>
      </div>
    </div>
  </footer>
</div>

<!-- Enhanced modal overlay -->
{#if showAuthForm}
  <div
    class="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300 modal-overlay"
    style="background-color: rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px);"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onclick={hideAuth}
    onkeydown={(e) => e.key === "Escape" && hideAuth()}
  >
    <div
      role="presentation"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => {
        if (e.key === "Escape") hideAuth();
      }}
    >
      <AuthForm onclose={hideAuth} />
    </div>
  </div>
{/if}

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  .hover\:rotateX-360:hover {
    transform: rotateX(360deg);
  }

  /* Custom underline with gap */
  .hover\:underline {
    position: relative;
    text-decoration: none !important;
  }

  .hover\:underline::after {
    content: "";
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: transparent;
    transition: background-color 0.3s ease;
  }

  .hover\:underline:hover::after {
    background-color: #14b8a6;
  }

  @keyframes gradient-move {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .animate-gradient-move {
    background-size: 200% 200%;
    animation: gradient-move 3s ease infinite;
  }

  /* Enhanced modal overlay blur */
  .modal-overlay {
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
  }

  /* Alternative floating particles effect */
</style>
