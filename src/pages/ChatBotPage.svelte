<script lang="ts">
  import { onMount } from "svelte";
  // Send SVG icon
  const SendIcon = `<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-send-icon lucide-send\"><path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\"/><path d=\"m21.854 2.147-10.94 10.939\"/></svg>`;
  // Chatbot SVG icon (responsive, fills parent)
  const BotIcon = `<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-bot-message-square-icon lucide-bot-message-square\"><path d=\"M12 6V2H8\"/><path d=\"M15 11v2\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z\"/><path d=\"M9 11v2\"/></svg>`;
  import FaUserCircle from "svelte-icons/fa/FaUserCircle.svelte";

  interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }

  let planChatReady = false; // For non-general chat: only true after Start Chat
  let isStartingChat = false;

  interface Plan {
    id: string;
    name: string;
    location: string;
    selected: boolean;
  }

  let messages: Message[] = [
    {
      id: "1",
      text: "Xin chào! Tôi là trợ lý du lịch AI của bạn. Tôi có thể giúp gì cho kế hoạch chuyến đi tiếp theo của bạn?",
      isUser: false,
      timestamp: new Date("2024-01-15T10:30:00"),
    },
  ];

  let plans: Plan[] = [];
  let selectedPlan: Plan | null = null;
  let isPlansLoading = true;
  let newMessage = "";
  let chatContainer: HTMLElement;

  function selectPlan(plan: Plan) {
    plans = plans.map((p) => ({ ...p, selected: p.id === plan.id }));
    selectedPlan = plan;
    planChatReady = false;
    if (plan.name === "Trò chuyện chung") {
      messages = [
        {
          id: Date.now().toString(),
          text: "Xin chào! Tôi là trợ lý AI du lịch của bạn. Tôi có thể giúp bạn lên kế hoạch cho chuyến đi tiếp theo như thế nào?",
          isUser: false,
          timestamp: new Date(),
        },
      ];
      planChatReady = true;
    } else {
      messages = [
        {
          id: Date.now().toString(),
          text: `Chào mừng đến với ${plan.name}! Tôi ở đây để giúp bạn với kế hoạch du lịch ${plan.location}. Nhấn 'Bắt đầu trò chuyện' để bắt đầu.`,
          isUser: false,
          timestamp: new Date(),
        },
      ];
      planChatReady = false;
    }
  }

  async function startPlanChat() {
    if (!selectedPlan) return;
    isStartingChat = true;
    try {
      // Get userId from token
      const userId = getUserIdFromToken();
      const planId = selectedPlan.id;
      if (!userId || !planId) {
        messages = [
          {
            id: Date.now().toString(),
            text: "Thiếu thông tin người dùng hoặc kế hoạch. Không thể bắt đầu trò chuyện.",
            isUser: false,
            timestamp: new Date(),
          },
        ];
        return;
      }
      // Fetch plan details (like ManagePlan.svelte)
      const res = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/plans/${userId}/${planId}`
      );
      console.log("[startPlanChat] Fetching plan details:", {
        userId,
        planId,
        res,
      });
      if (!res.ok) {
        messages = [
          {
            id: Date.now().toString(),
            text: "Không thể tải chi tiết kế hoạch. Không thể bắt đầu trò chuyện.",
            isUser: false,
            timestamp: new Date(),
          },
        ];
        return;
      }
      const data = await res.json();
      console.log("[startPlanChat] Plan details response:", data);
      const planRaw = data.plan || data;

      // Extract only the required fields for chat context
      const planData = {
        destination: planRaw.destination || planRaw.plan_content?.destination,
        startDate: planRaw.startDate || planRaw.plan_content?.startDate,
        endDate: planRaw.endDate || planRaw.plan_content?.endDate,
        budget: planRaw.budget || planRaw.plan_content?.budget,
        plan_id:
          planRaw.plan_id || planRaw._id?.$oid || planRaw.plan_content?.plan_id,
        selectedInterests:
          planRaw.selectedInterests || planRaw.plan_content?.selectedInterests,
      };

      console.log("[startPlanChat] plan_data to send:", planData);

      const requestBody = {
        message:
          "Đây là chi tiết kế hoạch du lịch của tôi. Vui lòng xem xét và hỗ trợ tôi.",
        plan_content: planData,
      };
      console.log("[startPlanChat] Full request body:", requestBody);

      // Send plan_content and a default message to chatbot endpoint
      const chatRes = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/chatbot/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
      console.log("[startPlanChat] Chatbot response status:", chatRes.status);
      let aiText = "";
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        console.log("[startPlanChat] Chatbot response JSON:", chatData);
        aiText = chatData.reply || chatData.message || chatData.response || "";
      }
      if (!aiText.trim()) {
        aiText = "Sẵn sàng trò chuyện về kế hoạch của bạn!";
      }
      // Replace the welcome message with the AI response
      messages = [
        {
          id: Date.now().toString(),
          text: aiText,
          isUser: false,
          timestamp: new Date(),
        },
      ];
      planChatReady = true;
    } catch (e) {
      messages = [
        {
          id: Date.now().toString(),
          text: "Lỗi khi bắt đầu trò chuyện cho kế hoạch này.",
          isUser: false,
          timestamp: new Date(),
        },
      ];
    } finally {
      isStartingChat = false;
    }
  }

  // Helper to get userId from JWT token in cookies
  function getUserIdFromToken(): string | null {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    if (!tokenCookie) return null;
    const token = tokenCookie.split("=")[1];
    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      const tokenData = JSON.parse(decoded);
      return tokenData?.user_id || tokenData?.id || tokenData?.sub || null;
    } catch (error) {
      return null;
    }
  }

  // Fetch real plans from API
  async function fetchPlans() {
    isPlansLoading = true;
    let userId = getUserIdFromToken();
    if (!userId) {
      plans = [
        {
          id: "general",
          name: "Trò chuyện chung",
          location: "",
          selected: true,
        },
      ];
      selectedPlan = plans[0];
      isPlansLoading = false;
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/plans/${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        const realPlans = (data.plans || []).map((plan: any, idx: number) => {
          const content = plan.plan_content || {};
          return {
            id: plan._id?.$oid || content.plan_id || String(idx + 1),
            name: content.destination
              ? `Trip to ${content.destination}`
              : `Plan ${idx + 1}`,
            location: content.destination || "Unknown",
            selected: false,
          };
        });
        plans = [
          {
            id: "general",
            name: "Trò chuyện chung",
            location: "",
            selected: true,
          },
          ...realPlans,
        ];
        selectedPlan = plans[0];
      } else {
        plans = [
          {
            id: "general",
            name: "Trò chuyện chung",
            location: "",
            selected: true,
          },
        ];
        selectedPlan = plans[0];
      }
    } catch (e) {
      plans = [
        {
          id: "general",
          name: "Trò chuyện chung",
          location: "",
          selected: true,
        },
      ];
      selectedPlan = plans[0];
    } finally {
      isPlansLoading = false;
    }
  }

  async function sendMessage() {
    const trimmedMsg = newMessage.trim();
    if (!trimmedMsg) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      isUser: true,
      timestamp: new Date(),
    };

    messages = [...messages, userMessage];

    // If General Chat, call chatbot API
    if (selectedPlan && selectedPlan.id === "general") {
      try {
        const requestBody = { message: trimmedMsg };
        console.log("[sendMessage] General chat request:", requestBody);

        const res = await fetch(
          `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/chatbot/chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );
        let aiText = "Sorry, I couldn't get a response.";
        if (res.ok) {
          const data = await res.json();
          aiText = data.reply || data.message || data.response || aiText;
        } else if (res.status === 422) {
          aiText = "Please enter a valid message.";
        }
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: new Date(),
        };
        messages = [...messages, aiResponse];
        scrollToBottom();
      } catch (e) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Error contacting chatbot API.",
          isUser: false,
          timestamp: new Date(),
        };
        messages = [...messages, aiResponse];
        scrollToBottom();
      }
    } else if (selectedPlan && planChatReady) {
      // For plan chat after Start Chat, send message to chatbot with plan context
      try {
        // Optionally, you can keep plan_content in memory if needed for context
        const requestBody = { message: trimmedMsg };
        console.log("[sendMessage] Plan chat request:", requestBody);

        const res = await fetch(
          `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/chatbot/chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );
        let aiText = "Sorry, I couldn't get a response.";
        if (res.ok) {
          const data = await res.json();
          aiText = data.reply || data.message || data.response || aiText;
        } else if (res.status === 422) {
          aiText = "Please enter a valid message.";
        }
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: aiText,
          isUser: false,
          timestamp: new Date(),
        };
        messages = [...messages, aiResponse];
        scrollToBottom();
      } catch (e) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "Error contacting chatbot API.",
          isUser: false,
          timestamp: new Date(),
        };
        messages = [...messages, aiResponse];
        scrollToBottom();
      }
    }

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
    fetchPlans().then(() => scrollToBottom());
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
          <div class="w-6 h-6 text-white flex items-center justify-center">
            {@html BotIcon}
          </div>
        </div>
        <h1 class="text-xl font-bold text-gray-800">Gowise</h1>
      </div>

      <!-- Search -->
      <div class="relative">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          class="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition-shadow duration-150"
        />
      </div>
    </div>

    <!-- Plan Selection -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4">
        <p class="text-sm text-gray-600 mb-3">Chọn kế hoạch</p>
        {#if isPlansLoading}
          <div class="text-center text-gray-400 py-8">Đang tải kế hoạch...</div>
        {:else}
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
        {/if}
      </div>
    </div>
  </div>

  <!-- Right Side - Chat Interface -->
  <div class="flex-1 flex flex-col">
    <!-- Chat Header -->
    <div class="bg-white border-b border-gray-200 p-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Trợ lý du lịch AI</h2>
          <p class="text-sm text-gray-600">Hỗ trợ du lịch chung</p>
        </div>
        <div class="flex items-center space-x-2">
          <!-- User info removed as requested -->
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
                <div
                  class="w-4 h-4 text-white flex items-center justify-center"
                >
                  {@html BotIcon}
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

    <!-- Message Input & Start Chat for plan chat -->
    <div class="bg-white border-t border-gray-200 p-4">
      {#if selectedPlan && selectedPlan.id !== "general" && !planChatReady}
        <div class="flex flex-col items-center justify-center space-y-2">
          <button
            class="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={startPlanChat}
            disabled={isStartingChat}
          >
            {isStartingChat ? "Đang bắt đầu..." : "Bắt đầu trò chuyện"}
          </button>
          <p class="text-xs text-gray-500">
            Bạn cần bắt đầu trò chuyện cho kế hoạch này trước khi gửi tin nhắn.
          </p>
        </div>
      {:else}
        <div class="flex items-center space-x-3">
          <div class="flex-1 relative">
            <input
              bind:value={newMessage}
              on:keydown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Xin chào! Tôi là trợ lý du lịch AI của bạn. Tôi có thể giúp gì cho kế hoạch chuyến đi tiếp theo của bạn?"
              class="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-500 transition-shadow duration-150"
              disabled={selectedPlan &&
                selectedPlan.id !== "general" &&
                !planChatReady}
            />
            <button
              on:click={sendMessage}
              disabled={!newMessage.trim() ||
                (selectedPlan &&
                  selectedPlan.id !== "general" &&
                  !planChatReady)}
              class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-teal-600 hover:to-cyan-700 transition-all duration-200"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                {@html SendIcon}
              </div>
            </button>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2 text-center">
          {formatTime(new Date())}
        </p>
      {/if}
    </div>
  </div>
</div>
