<script lang="ts">
    let isEditing = false;

    // User data
    let userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        bio: "Passionate traveler and adventure seeker. Love exploring new cultures and creating unforgettable memories around the world.",
    };

    function toggleEdit() {
        isEditing = !isEditing;
    }

    function saveChanges() {
        isEditing = false;
        // Here you would typically save to backend
        console.log("Saving user data:", userData);
    }
</script>

<div class="max-w-5xl mx-auto">
    <div class="mb-6">
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-800 m-0">
                Profile Information
            </h2>
            <button
                class="bg-transparent border border-teal-600 text-teal-600 px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-teal-600 hover:text-white"
                on:click={toggleEdit}
            >
                {isEditing ? "Cancel" : "Edit"}
            </button>
        </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="flex items-center p-8 bg-gray-50 border-b border-gray-200">
            <div
                class="w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-400 rounded-full flex items-center justify-center mr-5 flex-shrink-0"
            >
                <span class="text-white text-2xl font-semibold">JD</span>
            </div>
            <div>
                <h3 class="text-2xl font-semibold text-gray-900 mb-1">
                    {userData.firstName}
                    {userData.lastName}
                </h3>
                <p class="text-teal-600 font-medium text-sm mb-1">
                    Premium Member
                </p>
                <p class="text-gray-500 text-sm m-0">
                    Member since January 2024
                </p>
            </div>
        </div>

        <div class="p-8">
            <div class="grid grid-cols-2 gap-8 mb-6">
                <div class="flex flex-col">
                    <label
                        for="firstName"
                        class="mb-2 font-medium text-gray-700 text-sm"
                        >First Name</label
                    >
                    <input
                        type="text"
                        id="firstName"
                        bind:value={userData.firstName}
                        disabled={!isEditing}
                        class="p-3 border border-gray-300 rounded-md text-sm transition-colors duration-200 {!isEditing
                            ? 'bg-gray-50 cursor-not-allowed'
                            : 'bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100'}"
                    />
                </div>
                <div class="flex flex-col">
                    <label
                        for="lastName"
                        class="mb-2 font-medium text-gray-700 text-sm"
                        >Last Name</label
                    >
                    <input
                        type="text"
                        id="lastName"
                        bind:value={userData.lastName}
                        disabled={!isEditing}
                        class="p-3 border border-gray-300 rounded-md text-sm transition-colors duration-200 {!isEditing
                            ? 'bg-gray-50 cursor-not-allowed'
                            : 'bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100'}"
                    />
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8 mb-6">
                <div class="flex flex-col">
                    <label
                        for="email"
                        class="mb-2 font-medium text-gray-700 text-sm"
                        >Email</label
                    >
                    <input
                        type="email"
                        id="email"
                        bind:value={userData.email}
                        disabled={!isEditing}
                        class="p-3 border border-gray-300 rounded-md text-sm transition-colors duration-200 {!isEditing
                            ? 'bg-gray-50 cursor-not-allowed'
                            : 'bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100'}"
                    />
                </div>
                <div class="flex flex-col">
                    <label
                        for="phone"
                        class="mb-2 font-medium text-gray-700 text-sm"
                        >Phone</label
                    >
                    <input
                        type="tel"
                        id="phone"
                        bind:value={userData.phone}
                        disabled={!isEditing}
                        class="p-3 border border-gray-300 rounded-md text-sm transition-colors duration-200 {!isEditing
                            ? 'bg-gray-50 cursor-not-allowed'
                            : 'bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100'}"
                    />
                </div>
            </div>

            <div class="flex flex-col mb-6">
                <label for="bio" class="mb-2 font-medium text-gray-700 text-sm"
                    >Bio</label
                >
                <textarea
                    id="bio"
                    bind:value={userData.bio}
                    disabled={!isEditing}
                    class="p-3 border border-gray-300 rounded-md text-sm transition-colors duration-200 resize-y min-h-[100px] {!isEditing
                        ? 'bg-gray-50 cursor-not-allowed'
                        : 'bg-white focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100'}"
                    rows="4"
                ></textarea>
            </div>

            {#if isEditing}
                <div class="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                        class="bg-teal-600 text-white border-0 px-6 py-3 rounded-md cursor-pointer font-medium transition-colors duration-200 hover:bg-teal-700"
                        on:click={saveChanges}
                    >
                        Save Changes
                    </button>
                    <button
                        class="bg-transparent border border-gray-300 text-gray-500 px-6 py-3 rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
                        on:click={toggleEdit}
                    >
                        Cancel
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    @media (max-width: 640px) {
        .grid-cols-2 {
            grid-template-columns: 1fr;
        }

        .flex.items-center.p-8 {
            flex-direction: column;
            text-align: center;
        }

        .w-20.h-20 {
            margin-right: 0;
            margin-bottom: 1rem;
        }
    }
</style>
