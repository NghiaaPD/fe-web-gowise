<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import FaTimes from "svelte-icons/fa/FaTimes.svelte";
  import FaCloudUploadAlt from "svelte-icons/fa/FaCloudUploadAlt.svelte";
  import FaImages from "svelte-icons/fa/FaImages.svelte";
  import FaTrash from "svelte-icons/fa/FaTrash.svelte";

  const dispatch = createEventDispatcher();

  let dragActive = false;
  let uploadedFiles: File[] = [];
  let previewUrls: string[] = [];
  let caption = "";
  let location = "";
  let isUploading = false;
  let uploadProgress = 0;
  let errorMessage = "";

  // File size limit: 100MB (backend limit)
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    dragActive = true;
  }

  function handleDragLeave() {
    dragActive = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragActive = false;

    const files = Array.from(event.dataTransfer?.files || []);
    addFiles(files);
  }

  function handleFileInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    addFiles(files);
  }

  function addFiles(files: File[]) {
    errorMessage = ""; // Clear previous errors
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Check file sizes
    const oversizedFiles = imageFiles.filter(
      (file) => file.size > MAX_FILE_SIZE
    );
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles
        .map((f) => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`)
        .join(", ");
      errorMessage = `Các file sau quá lớn (giới hạn 100MB): ${fileNames}`;
      return;
    }

    imageFiles.forEach((file) => {
      uploadedFiles = [...uploadedFiles, file];

      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrls = [...previewUrls, e.target?.result as string];
      };
      reader.readAsDataURL(file);
    });
  }

  function removeFile(index: number) {
    uploadedFiles = uploadedFiles.filter((_, i) => i !== index);
    previewUrls = previewUrls.filter((_, i) => i !== index);
  }

  function handleClose() {
    if (isUploading) {
      if (!confirm("Đang tải ảnh lên. Bạn có chắc muốn hủy?")) {
        return;
      }
    }
    dispatch("close");
  }

  // Helper to get JWT token from cookies
  function getAccessToken(): string | null {
    const cookies = document.cookie.split(";");
    const tokenCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("accessToken=")
    );
    if (!tokenCookie) return null;
    return tokenCookie.split("=")[1];
  }

  // Helper to get userId from JWT token
  function getUserIdFromToken(): string | null {
    const token = getAccessToken();
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      const decoded = atob(payload);
      const tokenData = JSON.parse(decoded);
      return tokenData?.user_id || tokenData?.id || tokenData?.sub || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  // Helper function to generate UUID (fallback for older browsers)
  function generateUUID(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback UUID v4 generator
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  async function handleSubmit() {
    if (uploadedFiles.length === 0 || !caption.trim()) {
      errorMessage = "Vui lòng nhập chú thích và chọn ít nhất 1 ảnh!";
      return;
    }

    const token = getAccessToken();
    const userId = getUserIdFromToken();

    if (!token || !userId) {
      errorMessage = "Vui lòng đăng nhập để tải ảnh lên!";
      return;
    }

    // Clear previous errors
    errorMessage = "";

    isUploading = true;
    uploadProgress = 0;

    try {
      // Generate a new galleryId for this upload session
      const galleryId = generateUUID();
      console.log(`[Upload API] Generated galleryId: ${galleryId}`);

      let successCount = 0;
      let failCount = 0;

      // Upload each file
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const formData = new FormData();

        // Append required fields
        formData.append("userId", userId); // Required by backend
        formData.append("galleryId", galleryId); // Generated galleryId for this upload session
        formData.append("file", file);

        // Append optional fields
        formData.append("caption", caption);
        if (location.trim()) {
          formData.append("location", location);
        }

        console.log(
          `[Upload API] Uploading file ${i + 1}/${uploadedFiles.length}:`,
          {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            userId: userId,
            galleryId: galleryId,
            caption: caption,
            location: location || "(empty)",
          }
        );

        // Log FormData contents
        console.log("[Upload API] FormData contents:");
        for (let pair of formData.entries()) {
          console.log(
            `  ${pair[0]}:`,
            pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]
          );
        }

        try {
          const apiUrl = `${import.meta.env.VITE_BE_DOMAIN}:${import.meta.env.VITE_BE_PORT}/api/gallery/upload`;
          console.log(`[Upload API] Request URL: ${apiUrl}`);

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          console.log(`[Upload API] Response status: ${response.status}`);

          if (response.ok) {
            try {
              const responseData = await response.json();
              console.log(
                `✅ [Upload API] Success response for ${file.name}:`,
                responseData
              );
              successCount++;
            } catch (parseError) {
              console.error(
                `❌ [Upload API] Failed to parse response for ${file.name}:`,
                parseError
              );
              // Still count as success if status is ok
              successCount++;
            }
          } else {
            try {
              const error = await response.text();
              console.error(
                `❌ [Upload API] Failed to upload ${file.name}:`,
                error
              );
            } catch (e) {
              console.error(
                `❌ [Upload API] Failed to read error response for ${file.name}`
              );
            }

            console.error(
              `❌ [Upload API] Response status: ${response.status}`
            );

            // Show specific error for file too large
            if (response.status === 413) {
              errorMessage = `File "${file.name}" quá lớn (${(file.size / 1024 / 1024).toFixed(2)}MB). Vui lòng chọn file nhỏ hơn 100MB.`;
            }

            failCount++;
          }
        } catch (error) {
          failCount++;
          console.error(
            `❌ [Upload API] Network error uploading ${file.name}:`,
            error
          );
        }

        // Update progress
        uploadProgress = Math.round(((i + 1) / uploadedFiles.length) * 100);
      }

      // Wait a bit to show 100% progress
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Show result
      if (failCount === 0) {
        alert(`✅ Tải lên thành công ${successCount} ảnh!`);

        // Reset form and close
        caption = "";
        location = "";
        uploadedFiles = [];
        previewUrls = [];

        dispatch("upload", { success: true, count: successCount });

        // Delay closing to allow user to see the completion
        setTimeout(() => {
          dispatch("close");
        }, 300);
      } else {
        alert(
          `⚠️ Tải lên hoàn tất!\n✅ Thành công: ${successCount} ảnh\n❌ Thất bại: ${failCount} ảnh`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại!");
    } finally {
      isUploading = false;
      uploadProgress = 0;
    }
  }

  function triggerFileInput() {
    const input = document.getElementById("file-input") as HTMLInputElement;
    input?.click();
  }
</script>

<!-- Modal Overlay -->
<div
  class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  on:click={handleClose}
  on:keydown={(e) => e.key === "Escape" && handleClose()}
  role="presentation"
  tabindex="-1"
>
  <!-- Modal Content -->
  <div
    class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200"
    on:click|stopPropagation
    on:keydown={(e) => e.key === "Escape" && handleClose()}
    role="dialog"
    aria-modal="true"
    tabindex="0"
  >
    <!-- Header -->
    <div class="bg-gradient-to-r from-teal-500 to-teal-600 p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 text-white">
            <FaImages />
          </div>
          <h2 class="text-2xl font-bold text-white">Tạo Kho Ảnh Mới</h2>
        </div>
        <button
          on:click={handleClose}
          class="w-8 h-8 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 flex items-center justify-center"
        >
          <div class="w-5 h-5">
            <FaTimes />
          </div>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
      <!-- Gallery Info Form -->
      <div class="mb-6 space-y-4">
        <div>
          <label
            for="caption"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Chú Thích <span class="text-red-500">*</span>
          </label>
          <input
            id="caption"
            type="text"
            bind:value={caption}
            placeholder="Ví dụ: Chuyến đi Tokyo 2025"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          />
        </div>

        <div>
          <label
            for="location"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Vị Trí (Tùy chọn)
          </label>
          <input
            id="location"
            type="text"
            bind:value={location}
            placeholder="Ví dụ: Tokyo, Nhật Bản"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>

      <!-- Error Message -->
      {#if errorMessage}
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <div class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-red-800">Lỗi</p>
              <p class="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
            <button
              on:click={() => (errorMessage = "")}
              class="text-red-400 hover:text-red-600 transition-colors"
              aria-label="Đóng thông báo lỗi"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      {/if}

      <!-- Upload Area -->
      <div
        class="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 {isUploading
          ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
          : dragActive
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'}"
        on:dragover={isUploading ? null : handleDragOver}
        on:dragleave={isUploading ? null : handleDragLeave}
        on:drop={isUploading ? null : handleDrop}
        role="button"
        tabindex={isUploading ? -1 : 0}
      >
        <div class="w-16 h-16 mx-auto mb-4 text-teal-500">
          <FaCloudUploadAlt />
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">
          Kéo thả ảnh vào đây
        </h3>
        <p class="text-gray-600 mb-4">hoặc</p>
        <button
          type="button"
          on:click={triggerFileInput}
          disabled={isUploading}
          class="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Chọn Ảnh Từ Máy
        </button>
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          on:change={handleFileInput}
          disabled={isUploading}
          class="hidden"
        />
        <p class="text-sm text-gray-500 mt-4">
          Hỗ trợ: JPG, PNG, GIF (Tối đa 100MB mỗi ảnh)
        </p>
      </div>

      <!-- Preview Grid -->
      {#if previewUrls.length > 0}
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Ảnh đã chọn ({previewUrls.length})
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each previewUrls as url, index}
              <div class="relative group">
                <img
                  src={url}
                  alt="Preview {index + 1}"
                  class="w-full h-32 object-cover rounded-lg shadow-md"
                />
                <button
                  type="button"
                  on:click={() => removeFile(index)}
                  class="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-lg"
                >
                  <div class="w-4 h-4">
                    <FaTrash />
                  </div>
                </button>
                <div
                  class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2 rounded-b-lg"
                >
                  {uploadedFiles[index].name.length > 20
                    ? uploadedFiles[index].name.substring(0, 20) + "..."
                    : uploadedFiles[index].name}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="border-t border-gray-200 p-6 bg-gray-50 flex flex-col gap-4">
      <!-- Upload Progress -->
      {#if isUploading}
        <div class="space-y-2">
          <div class="flex justify-between text-sm text-gray-600">
            <span>Đang tải lên...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              class="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-300"
              style="width: {uploadProgress}%"
            ></div>
          </div>
        </div>
      {/if}

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          on:click={handleClose}
          disabled={isUploading}
          class="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Đang tải..." : "Hủy"}
        </button>
        <button
          type="button"
          on:click={handleSubmit}
          disabled={isUploading || uploadedFiles.length === 0}
          class="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {#if isUploading}
            <span class="flex items-center gap-2">
              <svg
                class="animate-spin h-5 w-5 text-white"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang tải lên...
            </span>
          {:else}
            Tải Lên ({uploadedFiles.length} ảnh)
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom scrollbar */
  :global(.overflow-y-auto::-webkit-scrollbar) {
    width: 8px;
  }

  :global(.overflow-y-auto::-webkit-scrollbar-track) {
    background: #f1f1f1;
    border-radius: 10px;
  }

  :global(.overflow-y-auto::-webkit-scrollbar-thumb) {
    background: #14b8a6;
    border-radius: 10px;
  }

  :global(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
    background: #0d9488;
  }
</style>
