<script lang="ts">
  import { onMount } from "svelte";

  let baseUrl = "";
  let pendingUrl = "";
  let healthStatus = "checking";
  let healthMessage = "";
  let apiResponse = "";

  onMount(() => {
    const domain = import.meta.env?.VITE_BE_DOMAIN || "Not set";
    const port = import.meta.env?.VITE_BE_PORT || "Not set";

    baseUrl = `${domain}:${port}`;
    pendingUrl = `${baseUrl}/api/admin/posts/pending?page=0&size=5`;

    checkHealth();
  });

  async function checkHealth() {
    healthStatus = "checking";
    healthMessage = "Đang kiểm tra kết nối...";
    apiResponse = "";

    try {
      const token = getCookie("accessToken");
      if (!token) {
        healthStatus = "error";
        healthMessage = "Không tìm thấy token đăng nhập";
        return;
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      const response = await fetch(pendingUrl, {
        headers,
        credentials: "include",
      });

      const text = await response.text();
      apiResponse = text;

      if (response.ok) {
        healthStatus = "success";
        healthMessage = `Kết nối thành công! Status: ${response.status}`;
      } else {
        healthStatus = "error";
        healthMessage = `Lỗi từ server. Status: ${response.status}`;
      }
    } catch (error) {
      healthStatus = "error";
      healthMessage = `Lỗi kết nối: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
    return null;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
</script>

<div class="min-h-screen bg-gray-50 p-6">
  <div class="mx-auto max-w-4xl space-y-6">
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">API Health Check</h1>

      <div class="space-y-4">
        <div>
          <div class="text-sm font-semibold text-gray-700">Base URL</div>
          <div class="mt-1 flex gap-2">
            <code class="flex-1 rounded bg-gray-100 p-2 text-sm">{baseUrl}</code
            >
            <button
              onclick={() => copyToClipboard(baseUrl)}
              class="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            >
              Copy
            </button>
          </div>
        </div>

        <div>
          <div class="text-sm font-semibold text-gray-700">
            Pending Posts URL
          </div>
          <div class="mt-1 flex gap-2">
            <code class="flex-1 rounded bg-gray-100 p-2 text-sm break-all"
              >{pendingUrl}</code
            >
            <button
              onclick={() => copyToClipboard(pendingUrl)}
              class="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            >
              Copy
            </button>
          </div>
        </div>

        <div>
          <div class="text-sm font-semibold text-gray-700">Status</div>
          <div class="mt-1 flex items-center gap-2">
            {#if healthStatus === "checking"}
              <span
                class="inline-block h-3 w-3 animate-pulse rounded-full bg-yellow-500"
              ></span>
            {:else if healthStatus === "success"}
              <span class="inline-block h-3 w-3 rounded-full bg-green-500"
              ></span>
            {:else}
              <span class="inline-block h-3 w-3 rounded-full bg-red-500"></span>
            {/if}
            <span class="text-sm text-gray-700">{healthMessage}</span>
          </div>
        </div>

        <div>
          <button
            onclick={checkHealth}
            class="rounded-full bg-teal-500 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-600"
          >
            Kiểm tra lại
          </button>
        </div>

        {#if apiResponse}
          <div>
            <div class="text-sm font-semibold text-gray-700">API Response</div>
            <pre
              class="mt-1 overflow-auto rounded bg-gray-900 p-4 text-xs text-green-400 max-h-96">{apiResponse}</pre>
          </div>
        {/if}

        <div class="rounded-lg bg-blue-50 p-4">
          <h3 class="font-semibold text-blue-900 mb-2">Hướng dẫn debug:</h3>
          <ol class="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Kiểm tra Base URL có đúng không</li>
            <li>Mở F12 Console để xem chi tiết request/response</li>
            <li>Nếu gặp lỗi 500, kiểm tra backend logs</li>
            <li>Nếu gặp lỗi CORS, kiểm tra cấu hình CORS ở backend</li>
            <li>Nếu gặp lỗi 401, kiểm tra token đăng nhập</li>
          </ol>
        </div>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-bold text-gray-900 mb-4">
        Environment Variables
      </h2>
      <div class="space-y-2 text-sm">
        <div class="flex gap-4">
          <span class="font-semibold text-gray-700 w-32">VITE_BE_DOMAIN:</span>
          <code class="text-gray-600"
            >{import.meta.env?.VITE_BE_DOMAIN || "Not set"}</code
          >
        </div>
        <div class="flex gap-4">
          <span class="font-semibold text-gray-700 w-32">VITE_BE_PORT:</span>
          <code class="text-gray-600"
            >{import.meta.env?.VITE_BE_PORT || "Not set"}</code
          >
        </div>
        <div class="flex gap-4">
          <span class="font-semibold text-gray-700 w-32">Has Token:</span>
          <code class="text-gray-600"
            >{getCookie("accessToken") ? "Yes" : "No"}</code
          >
        </div>
      </div>
    </div>
  </div>
</div>
