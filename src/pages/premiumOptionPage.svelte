<script lang="ts">
  import IoMdCheckmark from "svelte-icons/io/IoMdCheckmark.svelte";
  import IoMdClose from "svelte-icons/io/IoMdClose.svelte";
  import IoIosStar from "svelte-icons/io/IoIosStar.svelte";
  import IoIosFlash from "svelte-icons/io/IoIosFlash.svelte";
  import FaShieldAlt from "svelte-icons/fa/FaShieldAlt.svelte";
  import AuthForm from "../components/authForm.svelte";

  // reuse showAuth logic
  let showAuthForm = $state(false);
  function showAuth() {
    showAuthForm = true;
  }
  function hideAuth() {
    showAuthForm = false;
  }
</script>

<section class="bg-white py-20 px-10">
  <div class="max-w-6xl mx-auto">
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
    <div class="grid grid-cols-1 place-items-center gap-8 max-w-2xl mx-auto">
      <!-- Premium Plan -->
      <div
        class="bg-white border-2 border-teal-500 rounded-2xl p-8 relative shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 hover:border-teal-400 hover:bg-gradient-to-br hover:from-teal-50 hover:to-white"
      >
        <!-- Most Popular Badge -->
        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div
            class="bg-teal-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg hover:bg-teal-600 transition-colors duration-300"
          >
            <div class="w-4 h-4 mr-2"><IoIosStar /></div>
            Phổ biến nhất
          </div>
        </div>

        <div class="text-center mb-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Gói Premium</h3>
          <div class="flex items-baseline justify-center">
            <span class="text-5xl font-bold text-gray-900">1.99$</span>
            <span class="text-gray-500 ml-2">mỗi tháng</span>
          </div>
          <p class="text-gray-600 mt-4">
            Dành cho những người du lịch nghiêm túc muốn trải nghiệm AI đầy đủ
          </p>
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
          onclick={showAuth}
          class="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 hover:scale-105 transition-all duration-300 flex items-center justify-center hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
          >Bắt đầu Premium
          <div class="w-6 h-6 ml-2"><IoIosFlash /></div></button
        >
      </div>
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
      <AuthForm onclose={hideAuth} />
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
</style>
