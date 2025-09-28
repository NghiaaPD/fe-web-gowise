<script lang="ts">
    import IoIosLock from 'svelte-icons/io/IoIosLock.svelte'
    import IoMdKey from 'svelte-icons/io/IoMdKey.svelte'
    
    let passwordData = {
        lastChanged: "3 months ago",
    };

    let twoFactorEnabled = false;

    function changePassword() {
        // Handle password change
        console.log("Change password clicked");
    }

    function toggleTwoFactor() {
        twoFactorEnabled = !twoFactorEnabled;
        console.log(
            "Two-factor authentication:",
            twoFactorEnabled ? "enabled" : "disabled",
        );
    }

    function manageApiKeys() {
        // Handle API keys management
        console.log("Manage API keys clicked");
    }
</script>

<div class="max-w-5xl mx-auto">
    <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-800 m-0">
            Account Security
        </h2>
    </div>

    <div class="space-y-4">
        <!-- Password Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <div
                        class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4"
                    >
                        <div class="w-5 h-5 text-gray-600">
                            <IoIosLock />
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 m-0">
                            Password
                        </h3>
                        <p class="text-sm text-gray-500 m-0">
                            Last changed {passwordData.lastChanged}
                        </p>
                    </div>
                </div>
                <button
                    class="bg-transparent border border-teal-600 text-teal-600 px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-teal-600 hover:text-white"
                    on:click={changePassword}
                >
                    Change
                </button>
            </div>
        </div>

        <!-- Two-Factor Authentication Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <div
                        class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4"
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
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            ></path>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 m-0">
                            Two-Factor Authentication
                        </h3>
                        <p class="text-sm text-gray-500 m-0">
                            Add an extra layer of security
                        </p>
                    </div>
                </div>
                <button
                    class="{twoFactorEnabled
                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                        : 'bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white'} px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-all duration-200"
                    on:click={toggleTwoFactor}
                >
                    {twoFactorEnabled ? "Disable" : "Enable"}
                </button>
            </div>
        </div>

        <!-- API Keys Section -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <div
                        class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4"
                    >
                        <div class="w-5 h-5 text-gray-600">
                            <IoMdKey />
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 m-0">
                            API Keys
                        </h3>
                        <p class="text-sm text-gray-500 m-0">
                            Manage your API access
                        </p>
                    </div>
                </div>
                <button
                    class="bg-transparent border border-teal-600 text-teal-600 px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-teal-600 hover:text-white"
                    on:click={manageApiKeys}
                >
                    Manage
                </button>
            </div>
        </div>

        <!-- Additional Security Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div class="flex items-start">
                <svg
                    class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <div>
                    <h4 class="text-sm font-medium text-blue-900 m-0 mb-1">
                        Security Recommendations
                    </h4>
                    <p class="text-sm text-blue-700 m-0">
                        We recommend enabling two-factor authentication and
                        regularly updating your password to keep your account
                        secure.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
