<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import FaArrowLeft from 'svelte-icons/fa/FaArrowLeft.svelte';
    import FaCalendarAlt from 'svelte-icons/fa/FaCalendarAlt.svelte';
    import FaDollarSign from 'svelte-icons/fa/FaDollarSign.svelte';
    import FaMapMarkerAlt from 'svelte-icons/fa/FaMapMarkerAlt.svelte';
    import FaUsers from 'svelte-icons/fa/FaUsers.svelte';
    import FaStar from 'svelte-icons/fa/FaStar.svelte';
    import IoMdTime from 'svelte-icons/io/IoMdTime.svelte';
    import FaBed from 'svelte-icons/fa/FaBed.svelte';
    import FaUtensils from 'svelte-icons/fa/FaUtensils.svelte';

    const dispatch = createEventDispatcher();

    export let plan = {
        title: "Tokyo Adventure",
        location: "Japan",
        duration: "7 days",
        budget: "$2000",
        created: "1/15/2024",
        status: "active",
        description: "Experience the vibrant culture, cutting-edge technology, and incredible cuisine of Tokyo. From ancient temples to modern skyscrapers, this adventure covers the best of both traditional and contemporary Japan."
    };

    // Sample detailed data
    const planDetails = {
        activities: 2,
        itinerary: [
            {
                day: 1,
                date: "2024-03-01",
                title: "Shibuya & Harajuku",
                activities: [
                    "Arrive in Tokyo Airport",
                    "Check-in at hotel",
                    "Explore Shibuya Crossing",
                    "Dinner in Harajuku"
                ]
            },
            {
                day: 2,
                date: "2024-03-02",
                title: "Asakusa & Skytree",
                activities: [
                    "Visit Senso-ji Temple",
                    "Explore Asakusa district",
                    "Traditional sushi lunch",
                    "Tokyo Skytree observation"
                ]
            },
            {
                day: 3,
                date: "2024-03-03",
                title: "Central Tokyo",
                activities: [
                    "Tsukiji Outer Market",
                    "Imperial Palace gardens",
                    "Ginza shopping",
                    "Robot Restaurant show"
                ]
            },
            {
                day: 4,
                date: "2024-03-04",
                title: "Nikko",
                activities: [
                    "Day trip to Nikko",
                    "Toshogu Shrine",
                    "Lake Chuzenji",
                    "Traditional ryokan dinner"
                ]
            },
            {
                day: 5,
                date: "2024-03-05",
                title: "Shibuya & Shopping",
                activities: [
                    "Meiji Shrine visit",
                    "Omotesando shopping",
                    "Rooftop bar nightlife",
                    "Karaoke experience"
                ]
            }
        ],
        budgetBreakdown: [
            { category: "Round Trip Airfare", description: "International flights to/from Tokyo", amount: 800, percentage: 40 },
            { category: "Accommodation", description: "Hotel stay (7 nights)", amount: 700, percentage: 35 },
            { category: "Food & Dining", description: "Meals and restaurants", amount: 300, percentage: 15 },
            { category: "Local Transportation", description: "Trains, buses, and taxis", amount: 200, percentage: 10 },
            { category: "Activities & Tours", description: "Tours and experiences", amount: 400, percentage: 20 },
            { category: "Shopping & Souvenirs", description: "Souvenirs and personal items", amount: 200, percentage: 10 }
        ],
        totalBudget: 2800,
        accommodations: [
            {
                name: "Tokyo Grand Hotel",
                type: "Business Hotel",
                dates: "2024-03-01 - 2024-03-08",
                price: 700,
                rating: 4.5
            }
        ],
        specialActivities: [
            {
                name: "Sushi Making Class",
                description: "Learn to make traditional sushi with a master chef",
                duration: "2 hours",
                date: "2024-03-03",
                price: 80,
                type: "Culinary"
            },
            {
                name: "Tokyo Skytree Admission",
                description: "Visit the tallest structure in Japan!",
                duration: "3 hours",
                date: "2024-03-02",
                price: 25,
                type: "Sightseeing"
            }
        ]
    };

    function handleBackClick() {
        dispatch('back');
    }

    function getStatusColor(status: string): string {
        const colors: Record<string, string> = {
            active: "bg-green-100 text-green-800",
            draft: "bg-yellow-100 text-yellow-800", 
            completed: "bg-blue-100 text-blue-800"
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    }

    function formatCurrency(amount: number): string {
        return `$${amount.toLocaleString()}`;
    }
</script>

<div class="bg-gray-50 min-h-screen">
    <!-- Header with Back Button -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center">
            <button
                on:click={handleBackClick}
                class="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mr-4"
            >
                <div class="w-4 h-4 mr-2">
                    <FaArrowLeft />
                </div>
                Back to Plans
            </button>
        </div>
    </div>

    <div class="max-w-6xl mx-auto p-6">
        <!-- Plan Header -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mr-4">
                        <div class="w-6 h-6 text-teal-600">
                            <FaMapMarkerAlt />
                        </div>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 mb-1">{plan.title}</h1>
                        <p class="text-gray-600">{plan.location}</p>
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-sm font-medium {getStatusColor(plan.status)}">
                    {plan.status.toUpperCase()}
                </span>
            </div>

            <p class="text-gray-700 mb-6">{plan.description}</p>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                    <div class="flex items-center justify-center mb-2">
                        <div class="w-5 h-5 text-gray-600 mr-2">
                            <FaCalendarAlt />
                        </div>
                        <span class="text-sm text-gray-600">Duration</span>
                    </div>
                    <p class="text-lg font-semibold text-gray-800">{plan.duration}</p>
                </div>

                <div class="text-center">
                    <div class="flex items-center justify-center mb-2">
                        <div class="w-5 h-5 text-gray-600 mr-2">
                            <FaDollarSign />
                        </div>
                        <span class="text-sm text-gray-600">Budget</span>
                    </div>
                    <p class="text-lg font-semibold text-gray-800">{formatCurrency(planDetails.totalBudget)}</p>
                </div>

                <div class="text-center">
                    <div class="flex items-center justify-center mb-2">
                        <div class="w-5 h-5 text-gray-600 mr-2">
                            <FaCalendarAlt />
                        </div>
                        <span class="text-sm text-gray-600">Created</span>
                    </div>
                    <p class="text-lg font-semibold text-gray-800">{plan.created}</p>
                </div>

                <div class="text-center">
                    <div class="flex items-center justify-center mb-2">
                        <div class="w-5 h-5 text-gray-600 mr-2">
                            <FaUsers />
                        </div>
                        <span class="text-sm text-gray-600">Activities</span>
                    </div>
                    <p class="text-lg font-semibold text-gray-800">{planDetails.activities}</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-6">
                <!-- Itinerary -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">Itinerary</h2>
                    <div class="space-y-4">
                        {#each planDetails.itinerary as day}
                            <div class="border-l-4 border-teal-500 pl-4">
                                <div class="flex items-center mb-2">
                                    <span class="bg-teal-100 text-teal-800 text-sm font-medium px-2 py-1 rounded mr-3">
                                        Day {day.day}
                                    </span>
                                    <span class="text-sm text-gray-600">{day.date}</span>
                                </div>
                                <h3 class="font-semibold text-gray-800 mb-2">{day.title}</h3>
                                <ul class="space-y-1">
                                    {#each day.activities as activity}
                                        <li class="text-sm text-gray-600">• {activity}</li>
                                    {/each}
                                </ul>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Accommodations -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">Accommodations</h2>
                    {#each planDetails.accommodations as accommodation}
                        <div class="border border-gray-200 rounded-lg p-4">
                            <div class="flex items-start justify-between mb-2">
                                <div>
                                    <h3 class="font-semibold text-gray-800">{accommodation.name}</h3>
                                    <p class="text-sm text-gray-600">{accommodation.type}</p>
                                </div>
                                <div class="flex items-center">
                                    <div class="w-4 h-4 text-yellow-400 mr-1">
                                        <FaStar />
                                    </div>
                                    <span class="text-sm font-medium">{accommodation.rating}</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between text-sm text-gray-600">
                                <span>{accommodation.dates}</span>
                                <span class="font-semibold">{formatCurrency(accommodation.price)}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
                <!-- Budget Breakdown -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">Budget Breakdown</h2>
                    <div class="space-y-4">
                        {#each planDetails.budgetBreakdown as item}
                            <div class="flex items-center justify-between">
                                <div class="flex-1">
                                    <h3 class="font-medium text-gray-800">{item.category}</h3>
                                    <p class="text-sm text-gray-600">{item.description}</p>
                                    <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div 
                                            class="bg-teal-600 h-2 rounded-full transition-all duration-300"
                                            style="width: {item.percentage}%"
                                        ></div>
                                    </div>
                                </div>
                                <div class="text-right ml-4">
                                    <p class="font-semibold text-gray-800">{formatCurrency(item.amount)}</p>
                                    <p class="text-sm text-gray-600">{item.percentage}%</p>
                                </div>
                            </div>
                        {/each}
                        <div class="border-t pt-4 mt-4">
                            <div class="flex items-center justify-between">
                                <span class="text-lg font-bold text-gray-800">Total Budget</span>
                                <span class="text-2xl font-bold text-teal-600">{formatCurrency(planDetails.totalBudget)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Special Activities -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">Special Activities</h2>
                    <div class="space-y-4">
                        {#each planDetails.specialActivities as activity}
                            <div class="border border-gray-200 rounded-lg p-4">
                                <div class="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 class="font-semibold text-gray-800">{activity.name}</h3>
                                        <p class="text-sm text-gray-600">{activity.description}</p>
                                    </div>
                                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                        {activity.type}
                                    </span>
                                </div>
                                <div class="flex items-center justify-between text-sm text-gray-600">
                                    <div class="flex items-center">
                                        <div class="w-3 h-3 mr-1">
                                            <IoMdTime />
                                        </div>
                                        <span>{activity.duration}</span>
                                        <span class="mx-2">•</span>
                                        <span>{activity.date}</span>
                                    </div>
                                    <span class="font-semibold">{formatCurrency(activity.price)}</span>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
