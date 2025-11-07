<script lang="ts">
  import { onMount } from "svelte";
  import FaExternalLinkAlt from "svelte-icons/fa/FaExternalLinkAlt.svelte";
  import FaSyncAlt from "svelte-icons/fa/FaSyncAlt.svelte";
  import FaCopy from "svelte-icons/fa/FaCopy.svelte";
  import { showNotification } from "$lib/index";

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
    expiredAt?: string | null;
    checkoutUrl?: string;
    qrCode?: string;
  }

  const props = $props<{ userData: Record<string, any> | null }>();

  function generateOrderCode(): string {
    return Math.floor(1_000_000_000 + Math.random() * 9_000_000_000).toString();
  }

  function getAccessToken(): string | null {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find(
      (cookie) =>
        cookie.trim().startsWith("accessToken=") ||
        cookie.trim().startsWith("access_token=")
    );
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  }

  async function copyToClipboard(value: string) {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard API not available");
      }
      await navigator.clipboard.writeText(value);
      showNotification(
        { title: "Copied", message: "Link copied to clipboard." },
        "success"
      );
    } catch {
      showNotification(
        { title: "Copy failed", message: "Could not copy to clipboard." },
        "error"
      );
    }
  }

  let buyerName = $state("");
  let buyerEmail = $state("");
  let buyerPhone = $state("");
  let itemName = $state("Premium plan");
  let description = $state("Monthly subscription");
  let cancelUrl = $state("");
  let returnUrl = $state("");
  let orderCode = $state(generateOrderCode());
  let amount = $state("5000");
  let includeAmount = $state(true);
  let isSubmitting = $state(false);
  let errorMessage = $state("");
  let paymentResponse = $state<PayOSPaymentResponse | null>(null);
  let hasPrefilledBuyer = $state(false);

  const checkoutUrl = $derived(paymentResponse?.checkoutUrl ?? "");
  const paymentStatus = $derived(paymentResponse?.status ?? "UNKNOWN");
  const paymentAmount = $derived(paymentResponse?.amount ?? null);
  const qrCodeValue = $derived(paymentResponse?.qrCode ?? "");

  function trimSlash(value: string | undefined | null): string {
    if (!value) return "";
    return value.endsWith("/") ? value.slice(0, -1) : value;
  }

  const payosEndpoint = (() => {
    const direct = trimSlash(import.meta.env.VITE_PAYOS_PAYMENT_ENDPOINT);
    if (direct) {
      return direct;
    }

    const domain = trimSlash(import.meta.env.VITE_BE_DOMAIN);
    const port = import.meta.env.VITE_BE_PORT;

    if (domain) {
      const separator =
        domain.startsWith("http://") || domain.startsWith("https://")
          ? ""
          : "http://";
      const base = `${separator}${domain}${port ? `:${port}` : ""}`;
      return `${base}/api/payos/payment-link`;
    }

    return "http://localhost:8080/api/payos/payment-link";
  })();

  $effect(() => {
    const info = props.userData;
    if (!hasPrefilledBuyer && info) {
      const fullName = [info.firstName, info.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      if (fullName) buyerName = fullName;
      if (info.email) buyerEmail = info.email;
      const phone =
        info.phone || info.phoneNumber || info.contactNumber || "";
      if (phone) buyerPhone = phone;
      hasPrefilledBuyer = true;
    }
  });

  onMount(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (!cancelUrl) cancelUrl = `${origin}/payment/cancel`;
      if (!returnUrl) returnUrl = `${origin}/payment/success`;
    }
  });

  function regenerateOrderCode() {
    orderCode = generateOrderCode();
    paymentResponse = null;
    errorMessage = "";
  }

  function openCheckout() {
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank", "noopener");
    }
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!buyerName || !buyerEmail || !buyerPhone) {
      showNotification(
        {
          title: "Missing information",
          message: "Please fill buyer name, email, and phone number.",
        },
        "error"
      );
      return;
    }

    isSubmitting = true;
    errorMessage = "";
    paymentResponse = null;

    try {
      const token = getAccessToken();
      const payload: Record<string, unknown> = {
        orderCode: parseInt(orderCode, 10),
        description,
        cancelUrl,
        returnUrl,
        buyer: {
          name: buyerName,
          email: buyerEmail,
          phone: buyerPhone,
        },
        items: [{ name: itemName || "Premium plan" }],
      };

      if (includeAmount && Number(amount) > 0) {
        const numericAmount = Number(amount);
        if (!Number.isNaN(numericAmount) && numericAmount > 0) {
          payload.amount = numericAmount;
        }
      }

      const response = await fetch(payosEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      paymentResponse = (data?.data as PayOSPaymentResponse) ?? data;

      showNotification(
        {
          title: "Payment created",
          message: "Checkout link is ready for the subscription.",
        },
        "success"
      );
    } catch (error) {
      console.error("Error creating PayOS payment:", error);
      errorMessage =
        error instanceof Error ? error.message : "Unexpected error occurred.";
      showNotification(
        {
          title: "Payment failed",
          message: "Could not create payment link. Please try again.",
        },
        "error"
      );
    } finally {
      isSubmitting = false;
    }
  }
</script>

<section class="payment-page">
  <header class="header">
    <div>
      <h1>Subscription &amp; Billing</h1>
      <p>Generate a PayOS checkout link for your monthly subscription.</p>
    </div>
    <button class="regen-button" onclick={regenerateOrderCode}>
      <FaSyncAlt />
      <span>New order code</span>
    </button>
  </header>

  <form class="form" onsubmit={handleSubmit}>
    <div class="card">
      <h2>Order information</h2>
      <div class="grid">
        <label>
          <span>Order code</span>
          <div class="input-group">
            <input
              type="text"
              bind:value={orderCode}
              inputmode="numeric"
              pattern="[0-9]*"
              required
            />
          </div>
        </label>

        <label>
          <span>Description</span>
          <input type="text" bind:value={description} required />
        </label>

        <label>
          <span>Return URL</span>
          <input type="url" bind:value={returnUrl} required />
        </label>

        <label>
          <span>Cancel URL</span>
          <input type="url" bind:value={cancelUrl} required />
        </label>

        <label>
          <span>Plan name</span>
          <input type="text" bind:value={itemName} required />
        </label>

        <label class="amount-field">
          <span>Amount (VND)</span>
          <div class="amount-input">
            <input
              type="number"
              min="0"
              step="1000"
              bind:value={amount}
              disabled={!includeAmount}
            />
            <label class="checkbox">
              <input type="checkbox" bind:checked={includeAmount} />
              <span>Send amount with request</span>
            </label>
          </div>
        </label>
      </div>
    </div>

    <div class="card">
      <h2>Buyer details</h2>
      <div class="grid">
        <label>
          <span>Full name</span>
          <input type="text" bind:value={buyerName} required />
        </label>

        <label>
          <span>Email</span>
          <input type="email" bind:value={buyerEmail} required />
        </label>

        <label>
          <span>Phone number</span>
          <input type="tel" bind:value={buyerPhone} required />
        </label>
      </div>
    </div>

    {#if errorMessage}
      <div class="error-banner">
        <p>{errorMessage}</p>
      </div>
    {/if}

    <div class="actions">
      <button class="submit-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating payment..." : "Create PayOS checkout"}
      </button>
    </div>
  </form>

  {#if paymentResponse}
    <section class="result">
      <div class="card">
        <h2>Checkout details</h2>
        <div class="result-row">
          <span>Status</span>
          <span class="status">{paymentStatus}</span>
        </div>

        {#if paymentAmount}
          <div class="result-row">
            <span>Amount</span>
            <span>{paymentAmount.toLocaleString()} VND</span>
          </div>
        {/if}

        {#if checkoutUrl}
          <div class="checkout">
            <label for="checkout-link">Checkout link</label>
            <div class="checkout-row">
              <input
                type="text"
                id="checkout-link"
                readonly
                value={checkoutUrl}
              />
              <button type="button" class="icon-button" onclick={() => copyToClipboard(checkoutUrl)}>
                <FaCopy />
              </button>
              <button type="button" class="icon-button" onclick={openCheckout}>
                <FaExternalLinkAlt />
              </button>
            </div>
          </div>
        {/if}

        {#if qrCodeValue}
          <div class="qr-wrapper">
            <img
              alt="PayOS QR code"
              src={`https://chart.googleapis.com/chart?cht=qr&chs=240x240&chl=${encodeURIComponent(qrCodeValue)}`}
            />
            <p>Scan to complete the subscription.</p>
          </div>
        {/if}
      </div>
    </section>
  {/if}
</section>

<style>
  .payment-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
    background-color: #f5f5f5;
    min-height: 100%;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px 24px;
    box-shadow: 0 10px 25px -3px rgba(15, 23, 42, 0.08);
  }

  .header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #0f172a;
  }

  .header p {
    margin: 4px 0 0;
    color: #475569;
    font-size: 14px;
  }

  .regen-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #ecfeff;
    border: 1px solid #0e7490;
    color: #0e7490;
    border-radius: 8px;
    padding: 10px 16px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .regen-button:hover {
    background: #0e7490;
    color: white;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .card {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    padding: 24px;
    box-shadow: 0 10px 25px -3px rgba(15, 23, 42, 0.05);
  }

  .card h2 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    color: #334155;
  }

  input[type="text"],
  input[type="url"],
  input[type="email"],
  input[type="tel"],
  input[type="number"] {
    border: 1px solid #cbd5f5;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    color: #0f172a;
    background: #f8fafc;
  }

  input:focus {
    outline: none;
    border-color: #0ea5e9;
    background: white;
    box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
  }

  .amount-field span {
    display: block;
  }

  .amount-input {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .amount-input .checkbox {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #475569;
  }

  .amount-input input[type="number"][disabled] {
    background: #e2e8f0;
    cursor: not-allowed;
  }

  .error-banner {
    border-radius: 8px;
    padding: 12px 16px;
    border: 1px solid #f87171;
    background: #fee2e2;
    color: #991b1b;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  .submit-button {
    background: #0d9488;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    transition: background-color 0.2s ease;
  }

  .submit-button:disabled {
    background: #99f6e4;
    cursor: wait;
  }

  .submit-button:not(:disabled):hover {
    background: #0f766e;
  }

  .result {
    margin-bottom: 24px;
  }

  .result-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e2e8f0;
    color: #0f172a;
  }

  .result-row span:first-child {
    font-weight: 500;
    color: #475569;
  }

  .status {
    font-weight: 600;
    color: #0d9488;
  }

  .checkout {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .checkout label {
    font-size: 13px;
    color: #475569;
  }

  .checkout-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .checkout-row input {
    flex: 1;
    background: #f8fafc;
  }

  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid #cbd5f5;
    background: white;
    color: #0f172a;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .icon-button:hover {
    background: #e0f2fe;
  }

  .qr-wrapper {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .qr-wrapper img {
    border: 10px solid white;
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(15, 23, 42, 0.12);
    background: white;
  }

  .qr-wrapper p {
    margin: 0;
    font-size: 13px;
    color: #475569;
  }
</style>
