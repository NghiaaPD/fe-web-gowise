<script lang="ts">
    import FaCreditCard from 'svelte-icons/fa/FaCreditCard.svelte'
    import FaEdit from 'svelte-icons/fa/FaEdit.svelte'
    import FaRegTrashAlt from 'svelte-icons/fa/FaRegTrashAlt.svelte'
    import FaPlus from 'svelte-icons/fa/FaPlus.svelte'
    
    let paymentMethods = [
        {
            id: 1,
            type: "Visa",
            number: "**** 4242",
            expires: "12/26",
            isDefault: true
        },
        {
            id: 2,
            type: "Mastercard", 
            number: "**** 8888",
            expires: "10/28",
            isDefault: false
        }
    ];

    function addPaymentMethod() {
        console.log("Add payment method clicked");
    }

    function editPaymentMethod(id: number) {
        console.log("Edit payment method:", id);
    }

    function deletePaymentMethod(id: number) {
        console.log("Delete payment method:", id);
        paymentMethods = paymentMethods.filter(method => method.id !== id);
    }
</script>

<div class="max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-800 m-0">
            Payment Methods
        </h2>
        <button
            class="flex items-center bg-teal-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 hover:bg-teal-700"
            on:click={addPaymentMethod}
        >
            <div class="w-4 h-4 mr-2">
                <FaPlus />
            </div>
            Add Method
        </button>
    </div>

    <div class="space-y-4">
        {#each paymentMethods as method}
            <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-8 h-8 mr-4 text-gray-600">
                            <FaCreditCard />
                        </div>
                        <div>
                            <div class="flex items-center">
                                <span class="text-base font-medium text-gray-900 mr-2">
                                    {method.type} {method.number}
                                </span>
                                {#if method.isDefault}
                                    <span class="bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded">
                                        Default
                                    </span>
                                {/if}
                            </div>
                            <p class="text-sm text-gray-600 mt-1">
                                Expires {method.expires}
                            </p>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <button
                            class="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors duration-200"
                            on:click={() => editPaymentMethod(method.id)}
                            title="Edit payment method"
                        >
                            <div class="w-4 h-4">
                                <FaEdit />
                            </div>
                        </button>
                        <button
                            class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                            on:click={() => deletePaymentMethod(method.id)}
                            title="Delete payment method"
                        >
                            <div class="w-4 h-4">
                                <FaRegTrashAlt />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        {/each}
    </div>

    {#if paymentMethods.length === 0}
        <div class="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div class="w-16 h-16 mx-auto mb-4 text-gray-400">
                <FaCreditCard />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
                No payment methods
            </h3>
            <p class="text-gray-600 mb-6">
                Add a payment method to get started with transactions.
            </p>
            <button
                class="bg-teal-600 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 hover:bg-teal-700"
                on:click={addPaymentMethod}
            >
                Add Your First Payment Method
            </button>
        </div>
    {/if}
</div>
