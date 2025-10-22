<script lang="ts">
  // Optional: Add logic to detect mobile if needed
</script>

<div
  class="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center px-4"
>
  <div class="text-center max-w-md">
    <!-- Mobile Icon -->
    <div class="mb-8">
      <svg
        class="w-24 h-24 mx-auto text-teal-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      <div class="w-16 h-1 bg-teal-600 mx-auto rounded-full"></div>
    </div>

    <!-- Main Content -->
    <h1 class="text-3xl font-bold text-gray-800 mb-4">
      Không hỗ trợ di động trên trình duyệt
    </h1>
    <p class="text-lg text-gray-600 mb-6">
      Ứng dụng này được tối ưu hóa chỉ dành cho máy tính để bàn. Để có trải
      nghiệm tốt nhất, vui lòng thay đổi kích thước cửa sổ trình duyệt sang kích
      thước lớn hơn hoặc sử dụng thiết bị máy tính để bàn.
    </p>

    <!-- Additional Info -->
    <div class="mt-8 text-sm text-gray-500">
      <p>
        Trình duyệt được khuyến nghị: Chrome, Firefox, Safari (phiên bản mới
        nhất)
      </p>
      <p class="mt-2">
        Vui lòng chuyển sang chế độ xem máy tính để bàn để có đầy đủ chức năng.
      </p>
    </div>
  </div>
</div>

<style>
  /* Custom styles if needed */
  @media (min-width: 768px) {
    .max-w-md {
      max-width: 28rem;
    }
  }
</style>
