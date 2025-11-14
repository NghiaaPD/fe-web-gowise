<script lang="ts">
  import { onMount } from "svelte";
  import IoMdCheckmark from "svelte-icons/io/IoMdCheckmark.svelte";
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";
  import IoIosFlash from "svelte-icons/io/IoIosFlash.svelte";
  import FaShieldAlt from "svelte-icons/fa/FaShieldAlt.svelte";
  import AuthForm from "../components/authForm.svelte";
  import { showNotification } from "$lib";

  const PLANS = [
    {
      id: "monthly",
      name: "Gói 1 Tháng",
      price: 52_397,
      priceUSD: "1.99",
      duration: "1 tháng",
      popular: false,
      description:
        "Truy cập đầy đủ trợ lý du lịch AI và hỗ trợ ưu tiên trong 30 ngày.",
      endpoint: "/api/payos/payment-link",
    },
    {
      id: "premium",
      name: "Gói 6 Tháng",
      price: 314_380,
      priceUSD: "11.99",
      duration: "6 tháng",
      popular: true,
      description:
        "Tiết kiệm 10%! Trải nghiệm Premium dài hạn với giá tốt nhất.",
      endpoint: "/api/payos/payment-link/premium",
    },
    {
      id: "enterprise",
      name: "Gói 1 Năm",
      price: 628_760,
      priceUSD: "23.99",
      duration: "12 tháng",
      popular: false,
      description:
        "Tiết kiệm 20%! Giải pháp tốt nhất cho người dùng thường xuyên.",
      endpoint: "/api/payos/payment-link/enterprise",
    },
  ];

  const MAX_DESCRIPTION_LENGTH = 25;
  const PAYOS_DESCRIPTION = "Gowise Premium";
  const USER_CACHE_KEY = "gowise:user-data";

  const backendBaseUrl = buildBackendBaseUrl();

  let showAuthForm = $state(false);
  let isCreatingPayment = $state(false);
  let paymentError = $state("");
  let isProcessingReturn = $state(false);
  let returnStatusMessage = $state("");
  let awaitingUpgradeAfterLogin = $state(false);

  function showAuth() {
    showAuthForm = true;
  }
  function hideAuth() {
    showAuthForm = false;
  }

  function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const cookies = `; ${document.cookie}`;
    const parts = cookies.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() ?? null;
    }
    return null;
  }

  function getAccessToken(): string | null {
    return (
      getCookie("accessToken") ||
      getCookie("access_token") ||
      getCookie("access-token")
    );
  }

  function decodeJwt(token: string) {
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
      console.error("Unable to decode token", error);
      return null;
    }
  }

  function getUserIdFromToken(token: string | null): string | null {
    if (!token) return null;
    const decoded = decodeJwt(token);
    const rawId =
      decoded?.userId ||
      decoded?.user_id ||
      decoded?.id ||
      decoded?.sub ||
      decoded?.uid;
    return rawId ? String(rawId) : null;
  }

  function trimSlash(value: string | undefined | null): string {
    if (!value) return "";
    return value.endsWith("/") ? value.slice(0, -1) : value;
  }

  function buildBackendBaseUrl(): string {
    const rawDomain = trimSlash(import.meta.env.VITE_BE_DOMAIN);
    const port = import.meta.env.VITE_BE_PORT;
    if (!rawDomain) {
      return "http://localhost:8080";
    }
    const hasProtocol =
      rawDomain.startsWith("http://") || rawDomain.startsWith("https://");
    const base = hasProtocol ? rawDomain : `http://${rawDomain}`;
    return port ? `${base}:${port}` : base;
  }

  function sanitizeDescription(value: string | null | undefined): string {
    if (!value) return "";
    return value.trim().slice(0, MAX_DESCRIPTION_LENGTH);
  }

  function cacheUserProfile(data: Record<string, any> | null) {
    if (typeof window === "undefined") return;
    try {
      if (data) {
        sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(data));
      } else {
        sessionStorage.removeItem(USER_CACHE_KEY);
      }
    } catch (error) {
      console.warn("Unable to cache user profile", error);
    }
  }

  async function fetchUserProfile(token: string, userId: string) {
    const response = await fetch(`${backendBaseUrl}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        payload?.message ||
        `Không thể lấy thông tin người dùng (HTTP ${response.status})`;
      throw new Error(message);
    }
    const data = payload?.data ?? payload;
    if (!data) {
      throw new Error("Không nhận được thông tin người dùng.");
    }
    return data;
  }

  function getAppOrigin(): string {
    if (typeof window === "undefined") {
      return "http://localhost:5173";
    }
    return window.location.origin;
  }

  function handleStartPremium(plan: (typeof PLANS)[number]) {
    paymentError = "";
    if (isProcessingReturn) return;
    const token = getAccessToken();
    if (!token) {
      showAuth();
      showNotification(
        {
          title: "Cần đăng nhập",
          message: "Đăng nhập để tiếp tục nâng cấp Premium.",
        },
        "info"
      );
      return;
    }
    createPaymentLink(token, plan);
  }

  async function createPaymentLink(
    token: string,
    plan: (typeof PLANS)[number]
  ) {
    if (isCreatingPayment) return;
    const userId = getUserIdFromToken(token);
    if (!userId) {
      paymentError = "Không xác định được tài khoản. Vui lòng đăng nhập lại.";
      showAuth();
      return;
    }

    isCreatingPayment = true;
    paymentError = "";

    const origin = getAppOrigin();
    const successUrl = userId
      ? `${origin}/${userId}/mainScreen?payment=success`
      : `${origin}/premium?status=success`;
    const cancelUrl = `${origin}/premium?status=cancel`;
    const payload = {
      userId,
      description: sanitizeDescription(plan.name) || plan.name,
      cancelUrl,
      returnUrl: successUrl,
      items: [{ name: plan.name }],
      amount: plan.price,
    };

    try {
      const paymentEndpoint = `${backendBaseUrl}${plan.endpoint}`;
      const response = await fetch(paymentEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const rawText = await response.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        console.warn("PayOS response is not JSON", rawText);
      }

      if (!response.ok) {
        const message =
          data?.error || data?.message || `Lỗi ${response.status}`;
        throw new Error(message);
      }

      const paymentData = data?.data ?? data;
      const checkoutUrl =
        paymentData?.checkoutUrl ??
        paymentData?.checkout_url ??
        paymentData?.redirectUrl ??
        paymentData?.redirect_url ??
        paymentData?.data?.checkoutUrl ??
        paymentData?.data?.checkout_url ??
        paymentData?.payload?.checkoutUrl ??
        paymentData?.payload?.checkout_url;
      if (!checkoutUrl) {
        console.error("Unexpected PayOS payload", paymentData ?? data);
      }
      if (!checkoutUrl) {
        throw new Error("Không nhận được đường dẫn thanh toán.");
      }

      showNotification(
        {
          title: "Liên kết PayOS đã sẵn sàng",
          message: "Đang chuyển đến trang thanh toán.",
        },
        "success"
      );

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Unable to create payment link", error);
      paymentError =
        error instanceof Error ? error.message : "Không thể tạo thanh toán.";
      showNotification(
        {
          title: "Tạo thanh toán thất bại",
          message: paymentError,
        },
        "error"
      );
    } finally {
      isCreatingPayment = false;
    }
  }

  async function markUserAsPremium(token: string, userId: string) {
    const response = await fetch(
      `${backendBaseUrl}/users/${userId}/is_premium`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPremium: true }),
      }
    );
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.success === false) {
      const message =
        payload?.message ||
        `Không thể cập nhật tài khoản (HTTP ${response.status})`;
      throw new Error(message);
    }
  }

  function clearStatusQueryParams() {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("status");
    url.searchParams.delete("orderCode");
    url.searchParams.delete("order_code");
    const paramsString = url.searchParams.toString();
    const nextUrl = paramsString
      ? `${url.pathname}?${paramsString}`
      : url.pathname;
    window.history.replaceState({}, "", nextUrl);
  }

  async function finalizeSuccessfulPayment(
    orderCode?: string | null,
    existingToken?: string | null
  ) {
    if (isProcessingReturn) return;
    const token = existingToken ?? getAccessToken();
    if (!token) {
      awaitingUpgradeAfterLogin = true;
      showAuth();
      returnStatusMessage = "Vui lòng đăng nhập lại để hoàn tất nâng cấp.";
      return;
    }
    const userId = getUserIdFromToken(token);
    if (!userId) {
      returnStatusMessage =
        "Không xác định được tài khoản. Đăng nhập lại để tiếp tục.";
      showAuth();
      awaitingUpgradeAfterLogin = true;
      return;
    }

    isProcessingReturn = true;
    returnStatusMessage = "Thanh toán thành công! Đang kích hoạt Premium...";

    try {
      await markUserAsPremium(token, userId);
      const updatedUser = await fetchUserProfile(token, userId);
      if (!updatedUser?.isPremium) {
        throw new Error(
          "Hệ thống chưa xác nhận quyền Premium. Hãy thử lại sau ít phút hoặc liên hệ hỗ trợ."
        );
      }
      cacheUserProfile(updatedUser);
      showNotification(
        {
          title: "Kích hoạt Premium thành công",
          message: "Đang chuyển bạn về trang chính.",
        },
        "success"
      );
      clearStatusQueryParams();
      setTimeout(() => {
        window.location.href = `/${userId}/mainScreen`;
      }, 1200);
    } catch (error) {
      console.error("Unable to update user premium status", error);
      const message =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái tài khoản sau thanh toán.";
      paymentError = message;
      returnStatusMessage = message;
    } finally {
      isProcessingReturn = false;
      awaitingUpgradeAfterLogin = false;
    }
  }

  onMount(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const orderCode = params.get("orderCode") ?? params.get("order_code");
    if (status === "success") {
      finalizeSuccessfulPayment(orderCode);
    } else if (status === "cancel") {
      returnStatusMessage = "Thanh toán đã bị hủy. Bạn có thể thử lại.";
    }
  });

  function handleLoginSuccess(
    event: CustomEvent<{
      accessToken: string;
      userId?: string;
      userRole?: string;
    }>
  ) {
    hideAuth();
    const token = event.detail?.accessToken || getAccessToken();
    if (!token) {
      paymentError = "Không thể xác thực. Vui lòng thử lại.";
      return;
    }
    if (awaitingUpgradeAfterLogin) {
      finalizeSuccessfulPayment(null, token);
      return;
    }
    createPaymentLink(token, PLANS[0]);
  }
</script>

<section class="bg-white py-20 px-10">
  <div class="max-w-6xl mx-auto">
    {#if returnStatusMessage}
      <div class={`status-banner ${isProcessingReturn ? "processing" : ""}`}>
        {returnStatusMessage}
      </div>
    {/if}
    <!-- Header -->
    <div class="text-center mb-16">
      <p class="text-teal-500 font-bold text-sm tracking-widest mb-4">
        GÓI GIÁ
      </p>
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        Chọn Trợ lý Du lịch AI của bạn
      </h2>
      <p class="text-gray-600 text-lg max-w-2xl mx-auto">
        Bắt đầu với gói miễn phí của chúng tôi hoặc mở khóa sức mạnh đầy đủ của
        lập kế hoạch du lịch AI với Premium với giá rẻ hơn chi phí một ly cà
        phê.
      </p>
    </div>

    <!-- Pricing Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {#each PLANS as plan}
        <!-- Premium Plan Card -->
        <div
          class="bg-white border-2 rounded-2xl p-8 relative shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 {plan.popular
            ? 'border-teal-500 hover:border-teal-400 hover:bg-gradient-to-br hover:from-teal-50 hover:to-white scale-105'
            : 'border-gray-200 hover:border-teal-300'}"
        >
          <!-- Most Popular Badge -->
          {#if plan.popular}
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div
                class="bg-teal-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg hover:bg-teal-600 transition-colors duration-300"
              >
                <div class="w-4 h-4 mr-2"><IoIosStar /></div>
                Phổ biến nhất
              </div>
            </div>
          {/if}

          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div class="flex items-baseline justify-center gap-2">
              <span class="text-3xl font-bold text-gray-900"
                >~{plan.priceUSD} USD</span
              >
              <span class="text-gray-500 text-lg">/ {plan.duration}</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              ({plan.price.toLocaleString()} VND)
            </p>
            <p class="text-gray-600 mt-4">{plan.description}</p>
          </div>

          <!-- What's Included -->
          <div class="mb-8">
            <h4 class="font-semibold text-gray-900 mb-4 flex items-center">
              <div class="w-4 h-4 text-teal-500 mr-2"><IoMdCheckmark /></div>
              Bao gồm:
            </h4>
            <ul class="space-y-3">
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3"><IoMdCheckmark /></div>
                Lịch trình AI không giới hạn
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3"><IoMdCheckmark /></div>
                Cá nhân hóa nâng cao
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3"><IoMdCheckmark /></div>
                Cập nhật lịch trình thời gian thực
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3"><IoMdCheckmark /></div>
                Điểm đến & trải nghiệm cao cấp
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3"><IoMdCheckmark /></div>
                Hỗ trợ khách hàng ưu tiên
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3"><IoMdCheckmark /></div>
                Truy cập ngoại tuyến
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3"><IoMdCheckmark /></div>
                Lập kế hoạch du lịch nhóm
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3"><IoMdCheckmark /></div>
                Budget Optimization
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3"><IoMdCheckmark /></div>
                Khuyến nghị từ người trong cuộc địa phương
              </li>
              <li class="flex items-center text-gray-600">
                <div class="w-4 h-4 text-teal-500 mr-3"><IoMdCheckmark /></div>
                Tích hợp bảo hiểm du lịch
              </li>
            </ul>
          </div>

          <button
            type="button"
            onclick={() => handleStartPremium(plan)}
            disabled={isCreatingPayment}
            class="w-full py-3 rounded-lg font-semibold hover:scale-105 transition-all duration-300 flex items-center justify-center hover:shadow-lg transform hover:-translate-y-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed {plan.popular
              ? 'bg-teal-500 text-white hover:bg-teal-600'
              : 'bg-gray-100 text-gray-900 hover:bg-teal-50 border-2 border-teal-500'}"
          >
            {isCreatingPayment ? "Đang tạo liên kết..." : "Chọn gói này"}
            <div class="w-6 h-6 ml-2"><IoIosFlash /></div>
          </button>
          {#if paymentError}
            <p class="text-sm text-red-600 mt-3 text-center">{paymentError}</p>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Money Back Guarantee -->
    <div class="text-center mt-12">
      <div
        class="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-6 py-3"
      >
        <div class="w-5 h-5 text-green-700 mr-2"><FaShieldAlt /></div>
        <span class="text-green-700 font-semibold"
          >Bảo đảm hoàn tiền 30 ngày</span
        >
      </div>
      <p class="text-gray-600 mt-4">
        Thử Premium không rủi ro. Nếu bạn không hoàn toàn hài lòng, nhận hoàn
        tiền đầy đủ trong vòng 30 ngày.
      </p>
    </div>
  </div>
</section>

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
      <AuthForm
        onclose={hideAuth}
        redirectOnSuccess={false}
        onloginSuccess={handleLoginSuccess}
      />
    </div>
  </div>
{/if}

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  .modal-overlay {
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
  }
  .status-banner {
    text-align: center;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #34d399;
    background: #ecfdf5;
    color: #065f46;
    font-weight: 500;
    margin-bottom: 20px;
  }
  .status-banner.processing {
    border-color: #fbbf24;
    background: #fef9c3;
    color: #92400e;
  }
</style>
