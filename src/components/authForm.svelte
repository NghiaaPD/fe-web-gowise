<script lang="ts">
  import { slide, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import IoIosMail from "svelte-icons/io/IoIosMail.svelte";
  import IoIosLock from "svelte-icons/io/IoIosLock.svelte";
  import IoMdEye from "svelte-icons/io/IoMdEye.svelte";
  import IoMdEyeOff from "svelte-icons/io/IoMdEyeOff.svelte";
  import FaRegUserCircle from "svelte-icons/fa/FaRegUserCircle.svelte";
  import LoadingScreen from "./loadingScreen.svelte";
  import { notificationStore } from "$lib/index";

  // import { goto } from "$app/navigation";

  interface AuthFormEvents {
    submit: {
      email: string;
      password: string;
      rememberMe: boolean;
      isSignUp: boolean;
    };
    close: void;
    forgotPassword: { email: string };
    socialLogin: { provider: string };
  }

  let {
    onsubmit,
    onclose,
    onforgotpassword,
    onsociallogin,
  }: {
    onsubmit?: (event: CustomEvent<AuthFormEvents["submit"]>) => void;
    onclose?: (event: CustomEvent<AuthFormEvents["close"]>) => void;
    onforgotpassword?: (
      event: CustomEvent<AuthFormEvents["forgotPassword"]>
    ) => void;
    onsociallogin?: (event: CustomEvent<AuthFormEvents["socialLogin"]>) => void;
  } = $props();

  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let username = $state("");
  let rememberMe = $state(false);
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);
  let isSignUp = $state(false);
  let agreeToTerms = $state(false);
  let loading = $state(false);
  let showSuccess = $state(false);
  let successMessage = $state("");
  let showLoadingScreen = $state(false);
  let loadingScreenRef: any = $state();

  // Function to decode JWT token and extract user_id
  function decodeJWT(token: string) {
    try {
      // JWT có 3 phần, chúng ta cần phần payload (phần thứ 2)
      const payload = token.split(".")[1];
      // Decode base64
      const decoded = atob(payload);
      // Parse JSON
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }

  // Function to fetch user data and redirect
  async function fetchUserDataAndRedirect(
    userId: string,
    userRole: string,
    token: string
  ) {
    try {
      // Fetch user data from API
      const res = await fetch(
        `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/api/users/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const userData = await res.json();
        console.log("User data fetched:", userData);

        // Redirect based on user role
        if (userRole === "admin" || userRole === "administrator") {
          window.location.href = "/admin/dashboard";
        } else if (userId) {
          window.location.href = `/${userId}/mainScreen`;
        } else {
          window.location.href = "/mainScreen";
        }
      } else {
        console.warn("Failed to fetch user data, proceeding with redirect");
        // Even if fetch fails, still redirect
        if (userRole === "admin" || userRole === "administrator") {
          window.location.href = "/admin/dashboard";
        } else if (userId) {
          window.location.href = `/${userId}/mainScreen`;
        } else {
          window.location.href = "/mainScreen";
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // On error, still redirect
      if (userRole === "admin" || userRole === "administrator") {
        window.location.href = "/admin/dashboard";
      } else if (userId) {
        window.location.href = `/${userId}/mainScreen`;
      } else {
        window.location.href = "/mainScreen";
      }
    }
  }

  async function handleSubmit(event?: Event) {
    if (event) event.preventDefault();
    if (!isSignUp) {
      // Đăng nhập
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/auth/signin`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              login: username, // hoặc username nếu muốn dùng username thay vì email
              password,
            }),
          }
        );
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
        console.log("API response:", data);
        if (!res.ok || !data.success) {
          notificationStore.update(() => ({
            show: true,
            type: "error",
            content: {
              title: "Đăng nhập thất bại",
              message:
                data?.message || "Vui lòng kiểm tra lại thông tin đăng nhập",
            },
          }));
          return;
        }

        // Lưu accessToken vào cookie
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=604800`; // 7 ngày

        // Decode token để lấy user_id và role
        const tokenPayload = decodeJWT(data.accessToken);
        const userId =
          tokenPayload?.user_id || tokenPayload?.id || tokenPayload?.sub;
        const userRole =
          tokenPayload?.role || tokenPayload?.user_role || "user"; // Default to 'user'

        // Hiển thị notification thành công
        notificationStore.update(() => ({
          show: true,
          type: "success",
          content: {
            title: "Đăng nhập thành công!",
            message: "Đang tải dữ liệu người dùng...",
          },
        }));

        // Hiển thị loading screen và fetch user data
        setTimeout(() => {
          showLoadingScreen = true;
          fetchUserDataAndRedirect(userId, userRole, data.accessToken);
        }, 1500);
        onsubmit?.(
          new CustomEvent("submit", {
            detail: { email, password, rememberMe, isSignUp },
          })
        );
      } catch (err: any) {
        notificationStore.update(() => ({
          show: true,
          type: "error",
          content: {
            title: "Lỗi kết nối",
            message: err.message || "Không thể kết nối đến máy chủ",
          },
        }));
      }
    } else {
      // Đăng ký
      loading = true;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/auth/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              email,
              password,
            }),
          }
        );
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
        console.log("API response:", data);
        if (!res.ok) {
          loading = false;
          alert("Đăng ký thất bại: " + (data?.message || data));
          return;
        }
        // Thành công: chuyển về form sign in và hiện thông báo đẹp
        loading = false;
        isSignUp = false;
        showSuccess = true;
        successMessage = "Đăng ký thành công! Vui lòng đăng nhập.";
        setTimeout(() => {
          showSuccess = false;
        }, 2000);
        // Reset form
        email = "";
        password = "";
        confirmPassword = "";
        username = "";
        rememberMe = false;
        agreeToTerms = false;
        onsubmit?.(
          new CustomEvent("submit", {
            detail: {
              email,
              password,
              rememberMe,
              isSignUp,
              username,
            },
          })
        );
      } catch (err: any) {
        loading = false;
        alert("Lỗi kết nối: " + err.message);
      }
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function toggleConfirmPasswordVisibility() {
    showConfirmPassword = !showConfirmPassword;
  }

  function toggleAuthMode() {
    isSignUp = !isSignUp;
    // Reset form when switching modes
    email = "";
    password = "";
    confirmPassword = "";
    username = "";
    rememberMe = false;
    agreeToTerms = false;
  }

  function handleForgotPassword() {
    // Navigate to forget password page
    window.location.href = "/forget-password";
  }

  function handleClose() {
    onclose?.(new CustomEvent("close", { detail: undefined }));
  }

  function handleSocialLogin(provider: string) {
    onsociallogin?.(new CustomEvent("socialLogin", { detail: { provider } }));
  }
</script>

<div
  class="bg-white rounded-3xl p-8 w-full max-w-lg min-w-[448px] relative shadow-2xl transition-all duration-300 ease-out"
  style="min-height: {isSignUp ? '700px' : '610px'};"
>
  <!-- Close Button -->
  <button
    class="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
    onclick={handleClose}
    aria-label="Close"
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

  <!-- Logo -->
  <div class="text-center mb-8">
    <div class="flex items-center justify-center mx-auto mb-2">
      <img src="/logo.png" alt="GoWise Logo" class="w-24 h-24" />
    </div>
    <h2
      class="text-3xl font-bold text-gray-900 mb-2 transition-all duration-300"
    >
      {isSignUp ? "Join GoWise" : "Welcome Back"}
    </h2>
    <p class="text-gray-600 transition-all duration-300">
      {isSignUp
        ? "Tạo tài khoản và bắt đầu lập kế hoạch với AI"
        : "Đăng nhập vào tài khoản GoWise của bạn"}
    </p>
  </div>
  <!-- Form -->
  <form onsubmit={handleSubmit} class="space-y-3">
    <!-- Username Field (Only for Sign Up) -->
    {#if isSignUp}
      <div transition:slide={{ duration: 300, easing: quintOut, delay: 0 }}>
        <label
          for="username"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Username
        </label>
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </div>
          <input
            id="username"
            type="text"
            bind:value={username}
            placeholder="Chọn tên người dùng"
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          />
        </div>
      </div>
    {/if}

    <!-- Username Field (for Sign In) / Email Field (for Sign Up) -->
    {#if !isSignUp}
      <div>
        <label
          for="username"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Tên người dùng
        </label>
        <div class="relative">
          <div
            class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
          >
            <div class="h-5 w-5 text-gray-400">
              <FaRegUserCircle />
            </div>
          </div>
          <input
            id="username"
            type="text"
            bind:value={username}
            placeholder="Nhập tên người dùng"
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          />
        </div>
      </div>
    {:else}
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
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
            placeholder="Nhập email của bạn"
            class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
          />
        </div>
      </div>
    {/if}

    <!-- Password Field -->
    <div>
      <label
        for="password"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        Password
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
          id="password"
          type={showPassword ? "text" : "password"}
          bind:value={password}
          placeholder="Nhập mật khẩu"
          class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
          required
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 pr-4 flex items-center"
          onclick={togglePasswordVisibility}
        >
          <div class="h-5 w-5 text-gray-400 hover:text-gray-600">
            {#if showPassword}
              <IoMdEye />
            {:else}
              <IoMdEyeOff />
            {/if}
          </div>
        </button>
      </div>
    </div>

    <!-- Confirm Password Field (Only for Sign Up) -->
    {#if isSignUp}
      <div
        transition:slide={{
          duration: 300,
          easing: quintOut,
          delay: 50,
        }}
      >
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
            placeholder="Xác nhận mật khẩu"
            class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            required
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
    {/if}

    <!-- Terms Agreement (Only for Sign Up) -->
    {#if isSignUp}
      <div
        transition:slide={{
          duration: 300,
          easing: quintOut,
          delay: 100,
        }}
        class="flex items-start"
      >
        <input
          id="agree-terms"
          type="checkbox"
          bind:checked={agreeToTerms}
          class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-1"
          required
        />
        <label for="agree-terms" class="ml-2 block text-sm text-gray-700">
          Tôi đồng ý với
          <button
            type="button"
            class="text-teal-600 hover:text-teal-500 font-medium"
            >Điều khoản dịch vụ</button
          >
          và
          <button
            type="button"
            class="text-teal-600 hover:text-teal-500 font-medium"
            >Chính sách bảo mật</button
          >
        </label>
      </div>
    {/if}

    <!-- Remember Me / Forgot Password -->
    {#if !isSignUp}
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            bind:checked={rememberMe}
            class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-700">
            Ghi nhớ đăng nhập
          </label>
        </div>
        <button
          type="button"
          class="text-sm text-teal-600 hover:text-teal-500 font-medium"
          onclick={handleForgotPassword}
        >
          Quên mật khẩu?
        </button>
      </div>
    {/if}

    <!-- Submit Button -->
    <button
      type="submit"
      class="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center justify-center"
      disabled={loading}
    >
      {#if loading && isSignUp}
        <svg
          class="animate-spin h-5 w-5 mr-2 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          ><circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle><path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path></svg
        >
        Đang tạo tài khoản...
      {:else}
        {isSignUp ? "Tạo tài khoản" : "Đăng nhập"}
      {/if}
    </button>
    {#if showSuccess}
      <div
        class="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none"
      >
        <div class="success-popup pointer-events-auto">
          <svg
            class="h-6 w-6 text-white mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            /></svg
          >
          <span class="font-semibold">{successMessage}</span>
        </div>
      </div>
      <style>
        .success-popup {
          display: flex;
          align-items: center;
          background: linear-gradient(90deg, #14b8a6 0%, #06b6d4 100%);
          color: #fff;
          padding: 1rem 2rem;
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(20, 184, 166, 0.15);
          font-size: 1.1rem;
          min-width: 280px;
          max-width: 90vw;
          animation: slide-in-out 2s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes slide-in-out {
          0% {
            opacity: 0;
            transform: translateY(-60px) scale(0.95);
          }
          10% {
            opacity: 1;
            transform: translateY(20px) scale(1);
          }
          85% {
            opacity: 1;
            transform: translateY(20px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.95);
          }
        }
      </style>
    {/if}
  </form>

  <!-- Sign Up / Sign In Toggle -->
  <div class="text-center mt-4">
    <p class="text-gray-600">
      {isSignUp ? "Already have an account?" : "Don't have an account?"}
      <button
        type="button"
        class="text-teal-600 hover:text-teal-500 font-medium ml-1"
        onclick={toggleAuthMode}
      >
        {isSignUp ? "Đăng nhập" : "Đăng ký miễn phí"}
      </button>
    </p>
  </div>
</div>

{#if showLoadingScreen}
  <LoadingScreen
    bind:this={loadingScreenRef}
    manualControl={true}
    onComplete={() => {}}
  />
{/if}
