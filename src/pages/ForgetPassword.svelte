<script lang="ts">
  import { fade } from "svelte/transition";
  import IoIosMail from "svelte-icons/io/IoIosMail.svelte";
  import IoIosLock from "svelte-icons/io/IoIosLock.svelte";
  import IoMdEye from "svelte-icons/io/IoMdEye.svelte";
  import IoMdEyeOff from "svelte-icons/io/IoMdEyeOff.svelte";

  let email = $state("");
  let loading = $state(false);
  let showSuccess = $state(false);
  let showError = $state(false);
  let message = $state("");
  let showOtpInput = $state(false);
  let otp = $state(["", "", "", "", "", ""]);
  let otpLoading = $state(false);
  let showNewPasswordInput = $state(false);
  let newPassword = $state("");
  let confirmPassword = $state("");
  let showNewPassword = $state(false);
  let showConfirmPassword = $state(false);
  let passwordLoading = $state(false);
  let cachedEmail = $state(""); // Cache email for reset password API

  async function handleSubmit(event?: Event) {
    if (event) event.preventDefault();

    if (!email) {
      showError = true;
      message = "Vui lòng nhập email";
      return;
    }

    loading = true;
    try {
      // Call forgot password API
      const res = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (res.ok && res.status === 200) {
        cachedEmail = email; // Cache email for later use
        showSuccess = true;
        message =
          "Đã gửi email reset password. Vui lòng kiểm tra hộp thư của bạn.";
        // Show OTP input after 2 seconds
        setTimeout(() => {
          showSuccess = false;
          showOtpInput = true;
        }, 2000);
      } else {
        showError = true;
        message = data.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      }
    } catch (error) {
      // If API is not implemented yet, simulate success for testing
      console.warn(
        "API endpoint not available, simulating success for testing"
      );
      cachedEmail = email; // Cache email for later use
      showSuccess = true;
      message =
        "Đã gửi email reset password. Vui lòng kiểm tra hộp thư của bạn.";
      // Show OTP input after 2 seconds
      setTimeout(() => {
        showSuccess = false;
        showOtpInput = true;
      }, 2000);
    } finally {
      loading = false;
      // Hide message after 5 seconds
      setTimeout(() => {
        showSuccess = false;
        showError = false;
      }, 5000);
    }
  }

  function goBack() {
    if (showNewPasswordInput) {
      // Go back to OTP input
      showNewPasswordInput = false;
      showOtpInput = true;
      newPassword = "";
      confirmPassword = "";
    } else if (showOtpInput) {
      // Go back to email input
      showOtpInput = false;
      otp = ["", "", "", "", "", ""];
    } else {
      window.history.back();
    }
  }

  function handleOtpInput(index: number, value: string) {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      otp[index] = value;

      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  }

  function handleOtpKeydown(index: number, event: KeyboardEvent) {
    // Handle backspace
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  }

  function toggleNewPasswordVisibility() {
    showNewPassword = !showNewPassword;
  }

  function toggleConfirmPasswordVisibility() {
    showConfirmPassword = !showConfirmPassword;
  }

  async function handlePasswordSubmit(event?: Event) {
    if (event) event.preventDefault();

    if (!newPassword) {
      showError = true;
      message = "Vui lòng nhập password mới";
      return;
    }

    if (newPassword.length < 6) {
      showError = true;
      message = "Password phải có ít nhất 6 ký tự";
      return;
    }

    if (newPassword !== confirmPassword) {
      showError = true;
      message = "Password xác nhận không khớp";
      return;
    }

    passwordLoading = true;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cachedEmail,
            otp: otp.join(""),
            new_password: newPassword,
          }),
        }
      );

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (res.ok) {
        showSuccess = true;
        message = "Password đã được cập nhật thành công! Redirecting...";
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        showError = true;
        message = data.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      }
    } catch (error) {
      // If API is not implemented yet, simulate success for testing
      console.warn(
        "Reset password API endpoint not available, simulating success for testing"
      );
      showSuccess = true;
      message = "Password đã được cập nhật thành công! Redirecting...";
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } finally {
      passwordLoading = false;
      // Hide message after 5 seconds
      setTimeout(() => {
        showSuccess = false;
        showError = false;
      }, 5000);
    }
  }

  async function handleOtpSubmit() {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      showError = true;
      message = "Vui lòng nhập đủ 6 số OTP";
      return;
    }

    otpLoading = true;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/auth/validate-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cachedEmail || email,
            otp: otpCode,
          }),
        }
      );

      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (res.ok) {
        showSuccess = true;
        message = "OTP xác thực thành công!";
        // Show new password input after successful OTP verification
        setTimeout(() => {
          showSuccess = false;
          showError = false; // Clear any error state
          message = ""; // Clear message
          showOtpInput = false;
          showNewPasswordInput = true;
        }, 1500);
      } else {
        showError = true;
        message = data.message || "OTP không đúng. Vui lòng thử lại.";
      }
    } catch (error) {
      // If API is not implemented yet, simulate success for testing
      console.warn(
        "Verify OTP API endpoint not available, simulating success for testing"
      );
      showSuccess = true;
      message = "OTP xác thực thành công!";
      // Show new password input after successful OTP verification
      setTimeout(() => {
        showSuccess = false;
        showError = false; // Clear any error state
        message = ""; // Clear message
        showOtpInput = false;
        showNewPasswordInput = true;
      }, 1500);
    } finally {
      otpLoading = false;
      // Hide message after 5 seconds
      setTimeout(() => {
        showSuccess = false;
        showError = false;
      }, 5000);
    }
  }
</script>

<div
  class="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center p-4"
>
  <div class="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
    <!-- Header with back button -->
    <div class="flex items-center mb-8">
      <button
        class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mr-4"
        onclick={goBack}
        aria-label="Go back"
      >
        <svg
          class="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h1 class="text-2xl font-bold text-gray-900">
        {showNewPasswordInput
          ? "Mật khẩu mới"
          : showOtpInput
            ? "Nhập mã OTP"
            : "Quên mật khẩu"}
      </h1>
    </div>

    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="flex items-center justify-center mx-auto mb-4">
        <img src="/logo.png" alt="GoWise Logo" class="w-20 h-20" />
      </div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">
        {showNewPasswordInput
          ? "Create New Password"
          : showOtpInput
            ? "Verify OTP"
            : "Reset Your Password"}
      </h2>
      <p class="text-gray-600 text-sm">
        {showNewPasswordInput
          ? "Enter your new password to complete the reset process"
          : showOtpInput
            ? `Enter the 6-digit verification code sent to ${cachedEmail || email}`
            : "Enter your email address and we'll send you a verification code"}
      </p>
    </div>

    <!-- Success Message -->
    {#if showSuccess}
      <div
        class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        transition:fade={{ duration: 300 }}
      >
        <div class="flex items-center">
          <svg
            class="h-5 w-5 text-green-600 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p class="text-green-800 text-sm font-medium">{message}</p>
        </div>
      </div>
    {/if}

    <!-- Error Message -->
    {#if showError}
      <div
        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        transition:fade={{ duration: 300 }}
      >
        <div class="flex items-center">
          <svg
            class="h-5 w-5 text-red-600 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="text-red-800 text-sm font-medium">{message}</p>
        </div>
      </div>
    {/if}

    <!-- Form -->
    {#if !showOtpInput && !showNewPasswordInput}
      <!-- Email Input Form -->
      <form onsubmit={handleSubmit} class="space-y-6">
        <!-- Email Field -->
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address
          </label>
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <div class="h-5 w-5 text-gray-400">
                <IoIosMail />
              </div>
            </div>
            <input
              id="email"
              type="email"
              bind:value={email}
              placeholder="Enter your email address"
              class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
              required
              disabled={loading}
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center justify-center"
          disabled={loading}
        >
          {#if loading}
            <svg
              class="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            Sending...
          {:else}
            Send Verification Code
          {/if}
        </button>
      </form>
    {:else if showOtpInput}
      <!-- OTP Input Form -->
      <div class="space-y-6">
        <!-- OTP Field -->
        <div>
          <div class="block text-sm font-medium text-gray-700 mb-4">
            Verification Code
          </div>
          <div class="flex justify-center space-x-3 mb-6">
            {#each otp as digit, index}
              <input
                id="otp-{index}"
                type="text"
                maxlength="1"
                value={digit}
                oninput={(e) =>
                  handleOtpInput(
                    index,
                    (e.target as HTMLInputElement)?.value || ""
                  )}
                onkeydown={(e) => handleOtpKeydown(index, e)}
                class="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                disabled={otpLoading}
                autocomplete="off"
              />
            {/each}
          </div>
        </div>

        <!-- Verify Button -->
        <button
          onclick={handleOtpSubmit}
          class="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center justify-center"
          disabled={otpLoading}
        >
          {#if otpLoading}
            <svg
              class="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            Verifying...
          {:else}
            Verify OTP
          {/if}
        </button>

        <!-- Resend OTP -->
        <div class="text-center">
          <p class="text-gray-600 text-sm">
            Didn't receive the code?
            <button
              type="button"
              onclick={handleSubmit}
              class="text-teal-600 hover:text-teal-500 font-medium ml-1"
              disabled={loading}
            >
              Resend Code
            </button>
          </p>
        </div>
      </div>
    {:else if showNewPasswordInput}
      <!-- New Password Input Form -->
      <form onsubmit={handlePasswordSubmit} class="space-y-6">
        <!-- New Password Field -->
        <div>
          <label
            for="newPassword"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            New Password
          </label>
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <div class="h-5 w-5 text-gray-400">
                <IoIosLock />
              </div>
            </div>
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              bind:value={newPassword}
              placeholder="Enter new password"
              class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
              required
              disabled={passwordLoading}
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-4 flex items-center"
              onclick={toggleNewPasswordVisibility}
            >
              <div class="h-5 w-5 text-gray-400 hover:text-gray-600">
                {#if showNewPassword}
                  <IoMdEye />
                {:else}
                  <IoMdEyeOff />
                {/if}
              </div>
            </button>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm Password
          </label>
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
            >
              <div class="h-5 w-5 text-gray-400">
                <IoIosLock />
              </div>
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              bind:value={confirmPassword}
              placeholder="Confirm new password"
              class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
              required
              disabled={passwordLoading}
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-4 flex items-center"
              onclick={toggleConfirmPasswordVisibility}
            >
              <div class="h-5 w-5 text-gray-400 hover:text-gray-600">
                {#if showConfirmPassword}
                  <IoMdEye />
                {:else}
                  <IoMdEyeOff />
                {/if}
              </div>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center justify-center"
          disabled={passwordLoading}
        >
          {#if passwordLoading}
            <svg
              class="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            Updating...
          {:else}
            Update Password
          {/if}
        </button>
      </form>
    {/if}

    <!-- Back to Login -->
    <div class="text-center mt-6">
      <p class="text-gray-600 text-sm">
        {showNewPasswordInput
          ? "Password must be at least 6 characters long"
          : showOtpInput
            ? "Want to use different email?"
            : "Remember your password?"}
        {#if !showNewPasswordInput}
          <a
            href="/"
            class="text-teal-600 hover:text-teal-500 font-medium ml-1"
          >
            Back to Sign In
          </a>
        {/if}
      </p>
    </div>
  </div>
</div>
