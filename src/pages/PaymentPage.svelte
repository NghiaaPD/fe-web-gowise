<script lang="ts">
  import { onMount } from "svelte";
  import FaCopy from "svelte-icons/fa/FaCopy.svelte";
  import FaExternalLinkAlt from "svelte-icons/fa/FaExternalLinkAlt.svelte";
  import { showNotification } from "$lib";

  interface PayOSPaymentResponse {
    bin?: string;
    accountNumber?: string;
    accountName?: string;
    amount?: number;
    description?: string;
    orderCode?: number;
    currency?: string;
    paymentLinkId?: string;
    status?: string;
    expiredAt?: number | string | null;
    expiresAt?: number | string | null;
    checkoutUrl?: string;
    qrCode?: string;
    checkout_url?: string;
    redirectUrl?: string;
    redirect_url?: string;
    data?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    [key: string]: unknown;
  }

  const props = $props<{ userData?: Record<string, any> | null }>();

  const PLAN_PRICE_VND = 52_397;
  const PLAN_NAME = "Gói Premium Gowise";
  const PLAN_DESCRIPTION =
    "Quyền truy cập đầy đủ vào trợ lý du lịch AI, lịch trình theo thời gian thực và hỗ trợ ưu tiên trong 30 ngày.";
  const MAX_DESCRIPTION_LENGTH = 25;
  const DEFAULT_PAYMENT_NOTE = "Gowise Premium";
  const planFeatures = [
    "Lịch trình AI không giới hạn",
    "Tối ưu chi phí và cảnh báo thời tiết",
    "Gợi ý địa điểm độc quyền",
    "Cập nhật theo thời gian thực",
    "Hỗ trợ khách hàng 24/7",
  ];

  let localUser = $state<Record<string, any> | null>(props.userData ?? null);
  let resolvedUserId = $state<string | null>(
    props.userData?.id ??
      props.userData?.userId ??
      props.userData?.user_id ??
      null
  );
  let accessToken = $state<string | null>(null);

  let buyerName = $state("");
  let buyerEmail = $state("");
  let buyerPhone = $state("");
  let buyerCompany = $state("");
  let buyerTaxCode = $state("");
  let buyerAddress = $state("");
  let paymentNote = $state(DEFAULT_PAYMENT_NOTE);

  let returnUrl = $state("");
  let cancelUrl = $state("");
  let isLoading = $state(false);
  let paymentResult = $state<PayOSPaymentResponse | null>(null);
  let errorMessage = $state("");

  const checkoutUrl = $derived(paymentResult?.checkoutUrl ?? "");
  const paymentStatus = $derived(paymentResult?.status ?? "PENDING");
  const paymentAmount = $derived(paymentResult?.amount ?? PLAN_PRICE_VND);
  const orderCode = $derived(paymentResult?.orderCode ?? null);
  const qrCodeValue = $derived(paymentResult?.qrCode ?? "");
  const expiresAtText = $derived(
    formatTimestamp(
      paymentResult?.expiredAt ?? paymentResult?.expiresAt ?? null
    )
  );
  const disableSubmit = $derived(!accessToken || !resolvedUserId || isLoading);

  const backendBaseUrl = buildBackendBaseUrl();
  const paymentEndpoint = `${backendBaseUrl}/api/payos/payment-link`;

  $effect(() => {
    if (props.userData && props.userData !== localUser) {
      localUser = props.userData;
    }
  });

  $effect(() => {
    if (!localUser) return;
    if (!resolvedUserId) {
      resolvedUserId =
        localUser.id ||
        localUser.userId ||
        localUser.user_id ||
        localUser.uid ||
        null;
    }
    prefillBuyerFields(localUser);
  });

  onMount(async () => {
    if (typeof window === "undefined") return;

    accessToken = readAccessToken();

    if (!returnUrl || !cancelUrl) {
      const origin = window.location.origin;
      if (!returnUrl) {
        returnUrl = `${origin}/payment/success`;
      }
      if (!cancelUrl) {
        cancelUrl = `${origin}/payment/cancel`;
      }
    }

    if (!resolvedUserId) {
      resolvedUserId = getUserIdFromToken(accessToken);
    }

    if (!localUser && accessToken && resolvedUserId) {
      await loadUserProfile(resolvedUserId, accessToken);
    }
  });

  async function loadUserProfile(userId: string, token: string) {
    try {
      const response = await fetch(`${backendBaseUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const body = await response.json().catch(() => null);
      const data = body?.data ?? body;
      if (data) {
        localUser = data;
      }
    } catch (error) {
      console.error("Unable to load user profile", error);
    }
  }

  function prefillBuyerFields(data: Record<string, any>) {
    if (!data) return;
    const fullName =
      data.fullName ||
      data.name ||
      [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
    if (fullName && !buyerName) {
      buyerName = fullName;
    }
    if (data.email && !buyerEmail) {
      buyerEmail = data.email;
    }
    const phone = data.phone || data.phoneNumber || data.contactNumber;
    if (phone && !buyerPhone) {
      buyerPhone = phone;
    }
    if (data.companyName && !buyerCompany) buyerCompany = data.companyName;
    if (data.taxCode && !buyerTaxCode) buyerTaxCode = data.taxCode;
    if (data.address && !buyerAddress) buyerAddress = data.address;
  }

  function readAccessToken(): string | null {
    return (
      getCookie("accessToken") ||
      getCookie("access_token") ||
      getCookie("access-token")
    );
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
    return (
      decoded?.userId ||
      decoded?.user_id ||
      decoded?.id ||
      decoded?.sub ||
      decoded?.uid ||
      null
    );
  }

  function buildBackendBaseUrl(): string {
    const rawDomain = trimSlash(import.meta.env.VITE_BE_DOMAIN);
    const port = import.meta.env.VITE_BE_PORT;
    if (!rawDomain) {
      return "http://localhost:8080";
    }
    const hasProtocol =
      rawDomain.startsWith("http://") || rawDomain.startsWith("https://");
    const domain = hasProtocol ? rawDomain : `http://${rawDomain}`;
    return port ? `${domain}:${port}` : domain;
  }

  function trimSlash(value: string | undefined | null): string {
    if (!value) return "";
    return value.endsWith("/") ? value.slice(0, -1) : value;
  }

  function formatCurrency(value: number | null | undefined): string {
    if (!value || Number.isNaN(value)) return "0";
    return value.toLocaleString("vi-VN");
  }

  function formatTimestamp(
    value: string | number | null | undefined
  ): string | null {
    if (value === null || value === undefined) return null;
    let millis: number | null = null;

    if (typeof value === "number") {
      millis = value > 1_000_000_000_000 ? value : value * 1000;
    } else if (!Number.isNaN(Number(value))) {
      const numeric = Number(value);
      millis = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
    } else {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }

    if (!millis) return null;
    return new Date(millis).toLocaleString();
  }

  function sanitizeDescription(value: string | null | undefined): string {
    if (!value) return "";
    return value.trim().slice(0, MAX_DESCRIPTION_LENGTH);
  }

  async function handleCreatePayment(event: Event) {
    event.preventDefault();
    if (disableSubmit) return;

    if (!buyerName || !buyerEmail || !buyerPhone) {
      showNotification(
        {
          title: "Thiếu thông tin",
          message: "Hãy nhập đầy đủ họ tên, email và số điện thoại.",
        },
        "error"
      );
      return;
    }

    const token = readAccessToken();
    accessToken = token;
    const userId = resolvedUserId || getUserIdFromToken(token);

    if (!token || !userId) {
      errorMessage = "Bạn cần đăng nhập để tạo thanh toán Premium.";
      showNotification(
        {
          title: "Cần đăng nhập",
          message: "Hãy đăng nhập lại trước khi tiếp tục.",
        },
        "error"
      );
      return;
    }

    resolvedUserId = userId;
    isLoading = true;
    errorMessage = "";
    paymentResult = null;

    try {
      const buyer: Record<string, string> = {
        name: buyerName,
        email: buyerEmail,
        phone: buyerPhone,
      };
      if (buyerCompany) buyer.companyName = buyerCompany;
      if (buyerTaxCode) buyer.taxCode = buyerTaxCode;
      if (buyerAddress) buyer.address = buyerAddress;

      const payload = {
        userId,
        description: sanitizeDescription(paymentNote) || PLAN_NAME,
        cancelUrl,
        returnUrl,
        buyer,
        items: [{ name: PLAN_NAME }],
      };

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
          data?.error ||
          data?.message ||
          data?.detail ||
          `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      if (!data) {
        throw new Error("Không nhận được dữ liệu từ máy chủ.");
      }

      const paymentData =
        (data?.data as PayOSPaymentResponse) ??
        (data as PayOSPaymentResponse) ??
        null;
      const normalizedPaymentData = (paymentData ?? {}) as PayOSPaymentResponse;

      const checkoutCandidate =
        normalizedPaymentData?.checkoutUrl ??
        normalizedPaymentData?.checkout_url ??
        normalizedPaymentData?.redirectUrl ??
        normalizedPaymentData?.redirect_url ??
        (normalizedPaymentData?.data as PayOSPaymentResponse | undefined)
          ?.checkoutUrl ??
        (normalizedPaymentData?.data as PayOSPaymentResponse | undefined)
          ?.checkout_url ??
        (normalizedPaymentData?.payload as PayOSPaymentResponse | undefined)
          ?.checkoutUrl ??
        (normalizedPaymentData?.payload as PayOSPaymentResponse | undefined)
          ?.checkout_url;

      if (!checkoutCandidate || typeof checkoutCandidate !== "string") {
        console.error(
          "Unexpected PayOS payload",
          normalizedPaymentData ?? data
        );
        throw new Error("Không nhận được đường dẫn thanh toán từ PayOS.");
      }

      paymentResult = {
        ...normalizedPaymentData,
        checkoutUrl: checkoutCandidate,
      };

      showNotification(
        {
          title: "Tạo thanh toán thành công",
          message: "Liên kết PayOS đã sẵn sàng.",
        },
        "success"
      );
    } catch (error) {
      console.error("Unable to create PayOS payment link", error);
      errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tạo thanh toán. Thử lại sau.";
      showNotification(
        {
          title: "Tạo thanh toán thất bại",
          message: "Vui lòng thử lại trong giây lát.",
        },
        "error"
      );
    } finally {
      isLoading = false;
    }
  }

  async function copyToClipboard(value: string) {
    if (!value) return;
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard API not available");
      }
      await navigator.clipboard.writeText(value);
      showNotification(
        { title: "Đã sao chép", message: "Đường dẫn đã được sao chép." },
        "success"
      );
    } catch (error) {
      console.error("Clipboard error", error);
      showNotification(
        { title: "Không thể sao chép", message: "Hãy thử lại thủ công." },
        "error"
      );
    }
  }

  function openCheckout() {
    if (!checkoutUrl) return;
    window.open(checkoutUrl, "_blank", "noopener");
  }
</script>

<section class="payment-page">
  <div class="hero">
    <div>
      <p class="eyebrow">Nâng cấp Premium</p>
      <h1>Thanh toán Gowise Premium qua PayOS</h1>
      <p class="subtitle">
        Chỉ {formatCurrency(PLAN_PRICE_VND)} VND / tháng (~1.99 USD) để mở khóa toàn
        bộ tính năng của trợ lý du lịch AI.
      </p>
    </div>
    <div class="hero-pill">
      <span>PayOS bảo mật</span>
      <small>Liên kết hết hạn sau 2 phút</small>
    </div>
  </div>

  <div class="content-grid">
    <article class="plan-card">
      <div class="price">
        <span class="currency">VND</span>
        <span class="amount">{formatCurrency(PLAN_PRICE_VND)}</span>
        <span class="period">/ tháng</span>
      </div>
      <p class="plan-description">{PLAN_DESCRIPTION}</p>
      <ul class="feature-list">
        {#each planFeatures as feature}
          <li>{feature}</li>
        {/each}
      </ul>
      <div class="plan-hint">
        Thanh toán xử lý qua PayOS, hỗ trợ hầu hết ngân hàng Việt Nam với mã QR
        hoặc chuyển khoản tự động.
      </div>
    </article>

    <form class="form-card" onsubmit={handleCreatePayment}>
      <h2>Xác nhận thông tin thanh toán</h2>

      {#if !accessToken}
        <div class="alert warning">
          <strong>Chưa đăng nhập.</strong>
          Vui lòng đăng nhập để tiếp tục nâng cấp Premium.
        </div>
      {/if}

      <fieldset>
        <legend>Thông tin người mua</legend>
        <div class="form-grid">
          <label>
            <span>Họ và tên *</span>
            <input type="text" bind:value={buyerName} required />
          </label>

          <label>
            <span>Email *</span>
            <input type="email" bind:value={buyerEmail} required />
          </label>

          <label>
            <span>Số điện thoại *</span>
            <input type="tel" bind:value={buyerPhone} required />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Thông tin xuất hóa đơn (tùy chọn)</legend>
        <div class="form-grid">
          <label>
            <span>Công ty</span>
            <input
              type="text"
              bind:value={buyerCompany}
              placeholder="VD: Gowise Travel"
            />
          </label>

          <label>
            <span>Mã số thuế</span>
            <input type="text" bind:value={buyerTaxCode} />
          </label>

          <label>
            <span>Địa chỉ nhận hóa đơn</span>
            <input type="text" bind:value={buyerAddress} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Ghi chú &amp; liên kết hoàn tất</legend>
        <label>
          <span>Ghi chú hiển thị trên PayOS</span>
          <textarea
            rows="3"
            bind:value={paymentNote}
            maxlength={MAX_DESCRIPTION_LENGTH}
          ></textarea>
          <small class="helper-text">
            Tối đa {MAX_DESCRIPTION_LENGTH} ký tự (yêu cầu PayOS).
          </small>
        </label>
        <div class="form-grid">
          <label>
            <span>Return URL</span>
            <input type="url" bind:value={returnUrl} required />
          </label>
          <label>
            <span>Cancel URL</span>
            <input type="url" bind:value={cancelUrl} required />
          </label>
        </div>
      </fieldset>

      {#if errorMessage}
        <div class="alert error">
          {errorMessage}
        </div>
      {/if}

      <button class="primary-button" type="submit" disabled={disableSubmit}>
        {isLoading ? "Đang tạo liên kết..." : "Tạo liên kết PayOS"}
      </button>
      <p class="small-print">
        Bạn sẽ nhận được đường dẫn thanh toán và mã QR PayOS. Liên kết tự động
        hết hạn sau 2 phút để đảm bảo an toàn.
      </p>
    </form>
  </div>

  {#if paymentResult}
    <section class="result-card">
      <div class="result-header">
        <div>
          <p class="eyebrow">Liên kết PayOS</p>
          <h2>Hoàn tất thanh toán</h2>
        </div>
        <div class={`status-pill ${paymentStatus.toLowerCase()}`}>
          {paymentStatus}
        </div>
      </div>

      <div class="result-details">
        {#if orderCode}
          <div class="detail">
            <span>Mã đơn</span>
            <strong>{orderCode}</strong>
          </div>
        {/if}
        <div class="detail">
          <span>Số tiền</span>
          <strong>{formatCurrency(paymentAmount)} VND</strong>
        </div>
        <div class="detail">
          <span>Hết hạn</span>
          <strong>{expiresAtText ?? "Sau 2 phút kể từ khi tạo"}</strong>
        </div>
        {#if paymentResult && (paymentResult.accountName || paymentResult.accountNumber || paymentResult.bin)}
          <div class="detail">
            <span>Ngân hàng</span>
            <div>
              {#if paymentResult.accountName}<p>
                  Chủ tài khoản: {paymentResult.accountName}
                </p>{/if}
              {#if paymentResult.accountNumber}<p>
                  Số tài khoản: {paymentResult.accountNumber}
                </p>{/if}
              {#if paymentResult.bin}<p>BIN: {paymentResult.bin}</p>{/if}
            </div>
          </div>
        {/if}
      </div>

      {#if checkoutUrl}
        <div class="checkout-row">
          <input type="text" readonly value={checkoutUrl} />
          <button
            type="button"
            class="icon-button"
            onclick={() => copyToClipboard(checkoutUrl)}
          >
            <FaCopy />
          </button>
          <button type="button" class="icon-button" onclick={openCheckout}>
            <FaExternalLinkAlt />
          </button>
        </div>
      {/if}

      {#if qrCodeValue}
        <div class="qr-section">
          <img
            alt="PayOS QR code"
            src={`https://chart.googleapis.com/chart?cht=qr&chs=240x240&chl=${encodeURIComponent(qrCodeValue)}`}
          />
          <p>
            Quét QR để thanh toán tức thì qua ứng dụng ngân hàng hoặc ví điện
            tử.
          </p>
        </div>
      {/if}
    </section>
  {/if}
</section>

<style>
  .payment-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 32px;
    background: #f8fafc;
    min-height: 100vh;
  }

  .hero {
    background: linear-gradient(120deg, #0f172a, #0f766e);
    color: white;
    border-radius: 20px;
    padding: 32px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 12px;
    margin: 0 0 8px 0;
    color: rgba(255, 255, 255, 0.7);
  }

  .hero h1 {
    margin: 0;
    font-size: 28px;
  }

  .subtitle {
    margin: 12px 0 0;
    color: rgba(255, 255, 255, 0.85);
    max-width: 560px;
  }

  .hero-pill {
    align-self: flex-start;
    background: rgba(15, 23, 42, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 16px 20px;
    border-radius: 16px;
    text-align: right;
  }

  .hero-pill span {
    display: block;
    font-weight: 600;
  }

  .hero-pill small {
    color: rgba(255, 255, 255, 0.8);
  }

  .content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    align-items: start;
  }

  .plan-card,
  .form-card {
    background: white;
    border-radius: 18px;
    border: 1px solid #e2e8f0;
    padding: 28px;
    box-shadow: 0 25px 60px rgba(15, 23, 42, 0.08);
  }

  .price {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .price .currency {
    color: #0f766e;
  }

  .price .amount {
    font-size: 32px;
    color: #0f172a;
  }

  .plan-description {
    margin: 0 0 16px;
    color: #475569;
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: #1e293b;
  }

  .feature-list li::before {
    content: "✓";
    color: #0f766e;
    margin-right: 8px;
  }

  .plan-hint {
    margin-top: 20px;
    padding: 12px 16px;
    background: #ecfeff;
    border: 1px dashed #0f766e;
    border-radius: 12px;
    color: #0f172a;
    font-size: 14px;
  }

  .form-card h2 {
    margin: 0 0 16px;
    font-size: 22px;
    color: #0f172a;
  }

  fieldset {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    margin: 0 0 18px;
  }

  legend {
    padding: 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
    margin-top: 12px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    color: #334155;
  }

  input[type="text"],
  input[type="url"],
  input[type="email"],
  input[type="tel"],
  textarea {
    border: 1px solid #cbd5f5;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 14px;
    color: #0f172a;
    background: #f8fafc;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: #0ea5e9;
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
    background: white;
  }

  .helper-text {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #94a3b8;
  }

  .alert {
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 14px;
    margin-bottom: 16px;
  }

  .alert.warning {
    background: #fff8e6;
    border: 1px solid #facc15;
    color: #713f12;
  }

  .alert.error {
    background: #fee2e2;
    border: 1px solid #f87171;
    color: #7f1d1d;
  }

  .primary-button {
    width: 100%;
    border: none;
    border-radius: 12px;
    padding: 14px;
    background: linear-gradient(120deg, #0ea5e9, #0f766e);
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .primary-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .small-print {
    margin-top: 8px;
    font-size: 13px;
    color: #64748b;
  }

  .result-card {
    background: white;
    border-radius: 18px;
    border: 1px solid #e2e8f0;
    padding: 28px;
    box-shadow: 0 25px 60px rgba(15, 23, 42, 0.08);
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .result-header h2 {
    margin: 0;
  }

  .status-pill {
    padding: 8px 14px;
    border-radius: 999px;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 12px;
  }

  .status-pill.paid {
    background: #dcfce7;
    color: #166534;
  }

  .status-pill.pending {
    background: #fef3c7;
    color: #92400e;
  }

  .status-pill.failed {
    background: #fee2e2;
    color: #991b1b;
  }

  .result-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-top: 20px;
  }

  .detail span {
    display: block;
    font-size: 13px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .detail strong {
    display: block;
    font-size: 18px;
    color: #0f172a;
  }

  .checkout-row {
    display: flex;
    gap: 10px;
    margin-top: 24px;
  }

  .checkout-row input {
    flex: 1;
    border: 1px solid #cbd5f5;
    border-radius: 10px;
    padding: 10px 12px;
    background: #f8fafc;
  }

  .icon-button {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    border: 1px solid #cbd5f5;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0f172a;
    transition: background 0.2s ease;
  }

  .icon-button:hover {
    background: #e0f2fe;
  }

  .qr-section {
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .qr-section img {
    border-radius: 18px;
    border: 10px solid white;
    box-shadow: 0 12px 25px rgba(15, 23, 42, 0.12);
  }

  .qr-section p {
    margin: 0;
    color: #475569;
    text-align: center;
  }

  @media (max-width: 640px) {
    .payment-page {
      padding: 20px;
    }

    .hero {
      padding: 24px;
    }

    .content-grid {
      grid-template-columns: 1fr;
    }

    .checkout-row {
      flex-direction: column;
    }

    .icon-button {
      width: 100%;
      height: 40px;
    }
  }
</style>
