<script lang="ts">
  import { onMount } from "svelte";
  // Import icons from svelte-icons
  import FaUserShield from "svelte-icons/fa/FaUserShield.svelte";
  import FaEnvelope from "svelte-icons/fa/FaEnvelope.svelte";
  import FaBell from "svelte-icons/fa/FaBell.svelte";
  import FaUser from "svelte-icons/fa/FaUser.svelte";
  import FaUsers from "svelte-icons/fa/FaUsers.svelte";
  import FaChartBar from "svelte-icons/fa/FaChartBar.svelte";
  import FaCog from "svelte-icons/fa/FaCog.svelte";
  import FaEye from "svelte-icons/fa/FaEye.svelte";
  import FaServer from "svelte-icons/fa/FaServer.svelte";
  import FaClock from "svelte-icons/fa/FaClock.svelte";
  import FaWifi from "svelte-icons/fa/FaWifi.svelte";
  import FaUserFriends from "svelte-icons/fa/FaUserFriends.svelte";
  import FaTachometerAlt from "svelte-icons/fa/FaTachometerAlt.svelte";
  import FaMicrochip from "svelte-icons/fa/FaMicrochip.svelte";
  import FaHdd from "svelte-icons/fa/FaHdd.svelte";
  import FaDollarSign from "svelte-icons/fa/FaDollarSign.svelte";
  import FaCalendar from "svelte-icons/fa/FaCalendar.svelte";
  import FaArrowUp from "svelte-icons/fa/FaArrowUp.svelte";
  import FaChartLine from "svelte-icons/fa/FaChartLine.svelte";
  import FaMapMarker from "svelte-icons/fa/FaMapMarker.svelte";

  let activeTab = $state("overview");

  // Logout function
  function handleLogout() {
    // Clear all cookies
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    // Redirect to login
    window.location.href = "/";
  }

  // Mock data
  let stats = {
    totalUsers: { value: 12847, change: 2.3, trend: "up" },
    activeUsers: { value: 8934, change: 2.1, trend: "up" },
    totalPlans: { value: 3421, change: 19.3, trend: "up" },
    revenue: { value: 284750, change: 3.2, trend: "up" },
  };

  let systemHealth = {
    serverStatus: {
      value: "Healthy",
      percentage: 100,
      color: "text-green-500",
    },
    uptime: { value: "99.9%", color: "text-blue-500" },
    responseTime: { value: "120ms", color: "text-purple-500" },
    activeConnections: { value: 1247, color: "text-orange-500" },
    cpuUsage: { value: "45%", color: "text-red-500" },
    memory: { value: "62%", color: "text-indigo-500" },
    diskUsage: { value: "38%", color: "text-cyan-500" },
  };

  function setActiveTab(tab: string) {
    activeTab = tab;
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  }

  function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US").format(value);
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Logo and Title -->
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 text-teal-500">
          <FaUserShield />
        </div>
        <h1 class="text-xl font-semibold text-gray-900">
          Bảng điều khiển quản trị
        </h1>
      </div>

      <!-- Header Actions -->
      <div class="flex items-center space-x-4">
        <button class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <div class="w-5 h-5">
            <FaEnvelope />
          </div>
        </button>
        <button class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <div class="w-5 h-5">
            <FaBell />
          </div>
        </button>
        <div class="flex items-center space-x-2">
          <div
            class="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
          >
            A
          </div>
          <span class="text-sm font-medium text-gray-700">Quản trị viên</span>
          <button
            onclick={handleLogout}
            class="ml-4 px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Navigation Tabs -->
  <div class="bg-white border-b border-gray-200 px-6">
    <nav class="flex space-x-8">
      <button
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab ===
        'overview'
          ? 'border-teal-500 text-teal-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        onclick={() => setActiveTab("overview")}
      >
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4">
            <FaEye />
          </div>
          <span>Tổng quan</span>
        </div>
      </button>
      <button
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab ===
        'users'
          ? 'border-teal-500 text-teal-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        onclick={() => setActiveTab("users")}
      >
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4">
            <FaUsers />
          </div>
          <span>Người dùng</span>
        </div>
      </button>
      <button
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab ===
        'plans'
          ? 'border-teal-500 text-teal-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        onclick={() => setActiveTab("plans")}
      >
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4">
            <FaCalendar />
          </div>
          <span>Kế hoạch</span>
        </div>
      </button>
      <button
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {activeTab ===
        'settings'
          ? 'border-teal-500 text-teal-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        onclick={() => setActiveTab("settings")}
      >
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4">
            <FaCog />
          </div>
          <span>Cài đặt</span>
        </div>
      </button>
    </nav>
  </div>

  <!-- Main Content -->
  <div class="p-6">
    {#if activeTab === "overview"}
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Users -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p class="text-3xl font-bold text-gray-900">
                {formatNumber(stats.totalUsers.value)}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <div class="w-6 h-6 text-blue-600">
                <FaUsers />
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 text-green-500">
              <FaArrowUp />
            </div>
            <span class="text-sm text-green-600 font-medium"
              >+{stats.totalUsers.change}% so với tháng trước</span
            >
          </div>
        </div>

        <!-- Active Users -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm font-medium text-gray-600">
                Người dùng hoạt động
              </p>
              <p class="text-3xl font-bold text-gray-900">
                {formatNumber(stats.activeUsers.value)}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <div class="w-6 h-6 text-green-600">
                <FaChartLine />
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 text-green-500">
              <FaArrowUp />
            </div>
            <span class="text-sm text-green-600 font-medium"
              >+{stats.activeUsers.change}% so với tuần trước</span
            >
          </div>
        </div>

        <!-- Total Plans -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm font-medium text-gray-600">Tổng kế hoạch</p>
              <p class="text-3xl font-bold text-gray-900">
                {formatNumber(stats.totalPlans.value)}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <div class="w-6 h-6 text-purple-600">
                <FaMapMarker />
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 text-green-500">
              <FaArrowUp />
            </div>
            <span class="text-sm text-green-600 font-medium"
              >+{stats.totalPlans.change}% so với tháng trước</span
            >
          </div>
        </div>

        <!-- Revenue -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm font-medium text-gray-600">Doanh thu</p>
              <p class="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.revenue.value)}
              </p>
            </div>
            <div
              class="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center"
            >
              <div class="w-6 h-6 text-teal-600">
                <FaDollarSign />
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-3 h-3 text-green-500">
              <FaArrowUp />
            </div>
            <span class="text-sm text-green-600 font-medium"
              >+{stats.revenue.change}% chuyển đổi</span
            >
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- User Growth Chart -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              Tăng trưởng người dùng
            </h3>
            <div class="w-5 h-5 text-gray-400">
              <FaChartBar />
            </div>
          </div>
          <div class="h-64 flex items-center justify-center text-gray-500">
            Biểu đồ trực quan sẽ hiển thị ở đây
          </div>
        </div>

        <!-- Revenue Analytics Chart -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              Phân tích doanh thu
            </h3>
            <div class="w-5 h-5 text-gray-400">
              <FaTachometerAlt />
            </div>
          </div>
          <div class="h-64 flex items-center justify-center text-gray-500">
            Biểu đồ trực quan sẽ hiển thị ở đây
          </div>
        </div>
      </div>

      <!-- System Health -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-6">
          Tình trạng hệ thống
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          <!-- Server Status -->
          <div class="text-center">
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3"
            >
              <div class="w-6 h-6 text-green-600">
                <FaServer />
              </div>
            </div>
            <p class="text-xs text-gray-600 mb-1">Trạng thái máy chủ</p>
            <p class="text-sm font-semibold {systemHealth.serverStatus.color}">
              {systemHealth.serverStatus.value === "Healthy"
                ? "Tốt"
                : systemHealth.serverStatus.value}
            </p>
          </div>

          <!-- Uptime -->
          <div class="text-center">
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3"
            >
              <div class="w-6 h-6 text-blue-600">
                <FaClock />
              </div>
            </div>
            <p class="text-xs text-gray-600 mb-1">Thời gian hoạt động</p>
            <p class="text-sm font-semibold {systemHealth.uptime.color}">
              {systemHealth.uptime.value}
            </p>
          </div>

          <!-- Response Time -->
          <div class="text-center">
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3"
            >
              <div class="w-6 h-6 text-purple-600">
                <FaWifi />
              </div>
            </div>
            <p class="text-xs text-gray-600 mb-1">Thời gian phản hồi</p>
            <p class="text-sm font-semibold {systemHealth.responseTime.color}">
              {systemHealth.responseTime.value}
            </p>
          </div>

          <!-- Active Connections -->
          <div class="text-center">
            <div
              class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3"
            >
              <div class="w-6 h-6 text-orange-600">
                <FaUserFriends />
              </div>
            </div>
            <p class="text-xs text-gray-600 mb-1">Kết nối hoạt động</p>
            <p
              class="text-sm font-semibold {systemHealth.activeConnections
                .color}"
            >
              {systemHealth.activeConnections.value}
            </p>
          </div>

          <!-- CPU Usage -->
          <div class="text-center">
            <div
              class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3"
            >
              <div class="w-6 h-6 text-red-600">
                <FaTachometerAlt />
              </div>
            </div>
            <p class="text-xs text-gray-600 mb-1">Sử dụng CPU</p>
            <p class="text-sm font-semibold {systemHealth.cpuUsage.color}">
              {systemHealth.cpuUsage.value}
            </p>
          </div>

          <!-- Memory -->
          <div class="text-center">
            <div
              class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3"
            >
              <div class="w-6 h-6 text-indigo-600">
                <FaMicrochip />
              </div>
            </div>
            <p class="text-xs text-gray-600 mb-1">Bộ nhớ</p>
            <p class="text-sm font-semibold {systemHealth.memory.color}">
              {systemHealth.memory.value}
            </p>
          </div>

          <!-- Disk Usage -->
          <div class="text-center">
            <div
              class="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-3"
            >
              <div class="w-6 h-6 text-cyan-600">
                <FaHdd />
              </div>
            </div>
            <p class="text-xs text-gray-600 mb-1">Sử dụng ổ đĩa</p>
            <p class="text-sm font-semibold {systemHealth.diskUsage.color}">
              {systemHealth.diskUsage.value}
            </p>
          </div>
        </div>
      </div>
    {:else}
      <!-- Other tabs content placeholder -->
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center"
      >
        <div
          class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4"
        >
          <div class="w-8 h-8 text-gray-400">
            {#if activeTab === "users"}
              <FaUsers />
            {:else if activeTab === "plans"}
              <FaCalendar />
            {:else if activeTab === "settings"}
              <FaCog />
            {/if}
          </div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2 capitalize">
          Quản lý {activeTab === "users"
            ? "Người dùng"
            : activeTab === "plans"
              ? "Kế hoạch"
              : activeTab === "settings"
                ? "Cài đặt"
                : activeTab}
        </h3>
        <p class="text-gray-600">
          Phần này đang được phát triển. Nội dung quản lý {activeTab === "users"
            ? "người dùng"
            : activeTab === "plans"
              ? "kế hoạch"
              : activeTab === "settings"
                ? "cài đặt"
                : activeTab}
          sẽ sớm có mặt.
        </p>
      </div>
    {/if}
  </div>
</div>
