<script lang="ts">
  import { onMount } from "svelte";
  import IoIosSend from "svelte-icons/io/IoIosSend.svelte";
  // @ts-expect-error: No type declarations for svelte-icons/gi/GiRobotAntennas.svelte
  import GiRobotAntennas from "svelte-icons/gi/GiRobotAntennas.svelte";
  import FaUserCircle from "svelte-icons/fa/FaUserCircle.svelte";

  interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }

  interface Plan {
    id: string;
    name: string;
    location: string;
    selected: boolean;
  }

  let messages: Message[] = [
    {
      id: "1",
      text: "Hello! I'm your AI travel assistant. How can I help you plan your next trip?",
      isUser: false,
      timestamp: new Date("2024-01-15T10:30:00"),
    },
  ];

  let plans: Plan[] = [
    { id: "1", name: "General Chat", location: "", selected: true },
    {
      id: "2",
      name: "Tokyo Adventure",
      location: "Japan",
      selected: false,
    },
    {
      id: "3",
      name: "European Explorer",
      location: "Europe",
      selected: false,
    },
    {
      id: "4",
      name: "Bali Retreat",
      location: "Indonesia",
      selected: false,
    },
  ];

  let selectedPlan = plans[0];
  let newMessage = "";
  let chatContainer: HTMLElement;

  function selectPlan(plan: Plan) {
    plans = plans.map((p) => ({ ...p, selected: p.id === plan.id }));
    selectedPlan = plan;

    if (plan.name === "General Chat") {
      messages = [
        {
          id: Date.now().toString(),
          text: "Hello! I'm your AI travel assistant. How can I help you plan your next trip?",
          isUser: false,
          timestamp: new Date(),
        },
      ];
    } else {
      messages = [
        {
          id: Date.now().toString(),
          text: `Welcome to ${plan.name}! I'm here to help you with your ${plan.location} travel plans. What would you like to know?`,
          isUser: false,
          timestamp: new Date(),
        },
      ];
    }
  }

  function sendMessage() {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      isUser: true,
      timestamp: new Date(),
    };

    messages = [...messages, userMessage];

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(newMessage),
        isUser: false,
        timestamp: new Date(),
      };
      messages = [...messages, aiResponse];
      scrollToBottom();
    }, 1000);

    newMessage = "";
    scrollToBottom();
  }

  function generateAIResponse(userInput: string): string {
    const responses = [
      "That's a great question! Let me help you with that travel planning.",
      "Based on your requirements, I'd recommend checking out some local attractions and restaurants.",
      "For the best experience, consider the weather and local customs of your destination.",
      "I can help you create a detailed itinerary. What specific activities interest you most?",
      "Let me suggest some budget-friendly options for your trip.",
      "Have you considered the best time to visit? I can provide seasonal recommendations.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  onMount(() => {
    scrollToBottom();
  });
</script>

<div class="flex h-full bg-gray-50">
  <!-- Left Sidebar - Plan Selection -->
  <div class="w-80 bg-white border-r border-gray-200 flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center space-x-3 mb-4">
        <div
          class="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center"
        >
          <div class="w-6 h-6 text-white">
            <GiRobotAntennas />
          </div>
        </div>
        <h1 class="text-xl font-bold text-gray-800">Gowise</h1>
      </div>

      <!-- Search -->
      <div class="relative">
        <input
          type="text"
          placeholder="Search..."
          class="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Plan Selection -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4">
        <p class="text-sm text-gray-600 mb-3">Select a Plan</p>

        <div class="space-y-2">
          {#each plans as plan}
            <button
              on:click={() => selectPlan(plan)}
              class="w-full p-3 rounded-lg text-left transition-all duration-200 {plan.selected
                ? 'bg-gradient-to-r from-teal-100 to-cyan-100 border-2 border-teal-300'
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'}"
            >
              <div
                class="font-medium text-gray-800 {plan.selected
                  ? 'text-teal-700'
                  : ''}"
              >
                {plan.name}
              </div>
              {#if plan.location}
                <div class="text-sm text-gray-500 mt-1">
                  {plan.location}
                </div>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Right Side - Chat Interface -->
  <div class="flex-1 flex flex-col">
    <!-- Chat Header -->
    <div class="bg-white border-b border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-800">AI Travel Assistant</h2>
          <p class="text-sm text-gray-600">General travel assistance</p>
        </div>
        <div class="flex items-center space-x-2">
          <div
            class="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center"
          >
            <div class="w-4 h-4 text-white">
              <GiRobotAntennas />
            </div>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-800">John Doe</div>
            <div class="text-xs text-gray-500">Premium Member</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Messages -->
    <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4">
      {#each messages as message}
        <div class="flex {message.isUser ? 'justify-end' : 'justify-start'}">
          <div class="flex items-start space-x-3 max-w-2xl">
            {#if !message.isUser}
              <div
                class="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              >
                <div class="w-4 h-4 text-white">
                  <GiRobotAntennas />
                </div>
              </div>
            {/if}

            <div
              class="flex flex-col {message.isUser
                ? 'items-end'
                : 'items-start'}"
            >
              <div
                class="px-4 py-3 rounded-2xl {message.isUser
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'}"
              >
                <p class="text-sm leading-relaxed">
                  {message.text}
                </p>
              </div>
              <span class="text-xs text-gray-500 mt-1 px-2">
                {formatTime(message.timestamp)}
              </span>
            </div>

            {#if message.isUser}
              <div
                class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              >
                <div class="w-4 h-4 text-white">
                  <FaUserCircle />
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Message Input -->
    <div class="bg-white border-t border-gray-200 p-4">
      <div class="flex items-center space-x-3">
        <div class="flex-1 relative">
          <input
            bind:value={newMessage}
            on:keydown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Hello! I'm your AI travel assistant. How can I help you plan your next trip?"
            class="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
          <button
            on:click={sendMessage}
            disabled={!newMessage.trim()}
            class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-600 hover:to-cyan-700 transition-all duration-200"
          >
            <div class="w-4 h-4">
              <IoIosSend />
            </div>
          </button>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-2 text-center">
        {formatTime(new Date())}
      </p>
    </div>
  </div>
</div>
