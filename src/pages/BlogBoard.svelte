<script lang="ts">
    import BlogCard from "../components/BlogCard.svelte";
    import FaSearch from "svelte-icons/fa/FaSearch.svelte";
    import FaPlus from "svelte-icons/fa/FaPlus.svelte";
    import FaFilter from "svelte-icons/fa/FaFilter.svelte";
    import IoMdGrid from "svelte-icons/io/IoMdGrid.svelte";
    import IoMdList from "svelte-icons/io/IoMdList.svelte";
    import FaPencilAlt from "svelte-icons/fa/FaPencilAlt.svelte";

    // Blog posts data
    let blogPosts = [
        {
            title: "Ultimate Guide to Tokyo Street Food",
            description:
                "Discover the best street food experiences in Tokyo, from ramen alleys to conveyor belt sushi. A complete guide to must-try dishes and hidden gems.",
            author: "Sarah Johnson",
            readTime: "5 min read",
            publishDate: "1/25/2024",
            likes: 234,
            views: 1543,
            imageUrl: "/static/tokyo-street-food.jpg",
            category: "Food & Culture",
            featured: true,
        },
        {
            title: "Budget Travel Tips for Southeast Asia",
            description:
                "Learn how to explore Southeast Asia on a budget with these insider tips and tricks. Save money while experiencing amazing adventures.",
            author: "Mike Chen",
            readTime: "7 min read",
            publishDate: "1/22/2024",
            likes: 189,
            views: 987,
            imageUrl: "/static/southeast-asia.jpg",
            category: "Budget Travel",
            featured: false,
        },
        {
            title: "Hidden Gems in European Cities",
            description:
                "Explore lesser-known attractions and local favorites in major European destinations. Discover authentic experiences beyond tourist traps.",
            author: "Emma Rodriguez",
            readTime: "6 min read",
            publishDate: "1/20/2024",
            likes: 156,
            views: 743,
            imageUrl: "/static/europe-hidden.jpg",
            category: "City Guide",
            featured: false,
        },
        {
            title: "Solo Female Travel Safety Guide",
            description:
                "Essential tips and strategies for women traveling alone. Stay safe while exploring the world with confidence and independence.",
            author: "Lisa Wang",
            readTime: "8 min read",
            publishDate: "1/18/2024",
            likes: 312,
            views: 1205,
            imageUrl: "/static/solo-female-travel.jpg",
            category: "Travel Safety",
            featured: true,
        },
        {
            title: "Photography Tips for Travel Bloggers",
            description:
                "Master the art of travel photography with these professional tips. Capture stunning images that tell your travel story perfectly.",
            author: "David Park",
            readTime: "10 min read",
            publishDate: "1/15/2024",
            likes: 278,
            views: 892,
            imageUrl: "/static/travel-photography.jpg",
            category: "Photography",
            featured: false,
        },
        {
            title: "Sustainable Travel Practices",
            description:
                "Learn how to travel responsibly and minimize your environmental impact. Make a positive difference while exploring the world.",
            author: "Anna Green",
            readTime: "6 min read",
            publishDate: "1/12/2024",
            likes: 145,
            views: 634,
            imageUrl: "/static/sustainable-travel.jpg",
            category: "Eco Travel",
            featured: false,
        },
    ];

    // Filter and search state
    let searchQuery = "";
    let selectedCategory = "all";
    let viewMode = "grid"; // grid or list
    let sortBy = "date"; // date, popularity, likes

    // Available categories
    let categories = [
        "all",
        "Food & Culture",
        "Budget Travel",
        "City Guide",
        "Travel Safety",
        "Photography",
        "Eco Travel",
    ];

    // Computed filtered posts
    $: filteredPosts = blogPosts
        .filter((post) => {
            const matchesSearch =
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                post.author.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory =
                selectedCategory === "all" ||
                post.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === "date") {
                return (
                    new Date(b.publishDate).getTime() -
                    new Date(a.publishDate).getTime()
                );
            } else if (sortBy === "popularity") {
                return b.views - a.views;
            } else if (sortBy === "likes") {
                return b.likes - a.likes;
            }
            return 0;
        });

    // Statistics
    $: stats = {
        total: blogPosts.length,
        featured: blogPosts.filter((p) => p.featured).length,
        totalViews: blogPosts.reduce((sum, p) => sum + p.views, 0),
        totalLikes: blogPosts.reduce((sum, p) => sum + p.likes, 0),
    };

    function handleWritePost() {
        console.log("Write new post");
    }

    function handleReadMore(event: CustomEvent) {
        console.log("Read more post:", event.detail);
        // TODO: Implement read more functionality
    }

    function handleLike(event: CustomEvent) {
        console.log("Like post:", event.detail);
        // TODO: Implement like functionality
    }

    function formatNumber(num: number): string {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "k";
        }
        return num.toString();
    }
</script>

<div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header Section -->
    <div class="mb-8">
        <div
            class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
            <!-- Title and Description -->
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">
                    Travel Blog
                </h1>
                <p class="text-gray-600">
                    Discover amazing travel stories, tips, and guides from our
                    community ✈️
                </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
                <button
                    on:click={handleWritePost}
                    class="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                >
                    <div class="w-4 h-4">
                        <FaPencilAlt />
                    </div>
                    <span class="font-medium">Write Post</span>
                </button>

                <button
                    class="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-md"
                >
                    <div class="w-4 h-4">
                        <FaFilter />
                    </div>
                    <span class="font-medium">Filter</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 mb-1">Total Posts</p>
                    <p class="text-2xl font-bold text-gray-800">
                        {stats.total}
                    </p>
                </div>
                <div
                    class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
                >
                    <div class="w-5 h-5 text-blue-600">
                        <FaPencilAlt />
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 mb-1">Featured</p>
                    <p class="text-2xl font-bold text-yellow-600">
                        {stats.featured}
                    </p>
                </div>
                <div
                    class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"
                >
                    <div class="w-4 h-4 text-yellow-600">
                        <FaPencilAlt />
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 mb-1">Total Views</p>
                    <p class="text-2xl font-bold text-green-600">
                        {formatNumber(stats.totalViews)}
                    </p>
                </div>
                <div
                    class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"
                >
                    <div class="w-4 h-4 text-green-600">
                        <FaPencilAlt />
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 mb-1">Total Likes</p>
                    <p class="text-2xl font-bold text-red-600">
                        {formatNumber(stats.totalLikes)}
                    </p>
                </div>
                <div
                    class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"
                >
                    <div class="w-4 h-4 text-red-600">
                        <FaPencilAlt />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Filters and Search Section -->
    <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center gap-4">
            <!-- Search Bar -->
            <div class="flex-1 relative">
                <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                    <div class="w-4 h-4 text-gray-400">
                        <FaSearch />
                    </div>
                </div>
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Search posts by title, content, or author..."
                    class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                />
            </div>

            <!-- Category Filter -->
            <select
                bind:value={selectedCategory}
                class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
            >
                {#each categories as category}
                    <option value={category}>
                        {category === "all" ? "All Categories" : category}
                    </option>
                {/each}
            </select>

            <!-- Sort By -->
            <select
                bind:value={sortBy}
                class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
            >
                <option value="date">Latest First</option>
                <option value="popularity">Most Popular</option>
                <option value="likes">Most Liked</option>
            </select>

            <!-- View Mode Toggle -->
            <div class="relative flex bg-gray-100 rounded-lg p-1">
                <!-- Sliding background indicator -->
                <div
                    class="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out"
                    style="left: {viewMode === 'grid'
                        ? '4px'
                        : 'calc(50% + 2px)'}; width: calc(50% - 6px);"
                ></div>

                <button
                    on:click={() => (viewMode = "grid")}
                    class="relative z-10 flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-300 {viewMode ===
                    'grid'
                        ? 'text-teal-600'
                        : 'text-gray-500 hover:text-gray-700'}"
                >
                    <div class="w-4 h-4">
                        <IoMdGrid />
                    </div>
                </button>
                <button
                    on:click={() => (viewMode = "list")}
                    class="relative z-10 flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-300 {viewMode ===
                    'list'
                        ? 'text-teal-600'
                        : 'text-gray-500 hover:text-gray-700'}"
                >
                    <div class="w-4 h-4">
                        <IoMdList />
                    </div>
                </button>
            </div>
        </div>
    </div>

    <!-- Blog Posts Grid/List -->
    <div class="mb-8">
        {#if filteredPosts.length === 0}
            <!-- Empty State -->
            <div class="text-center py-16">
                <div
                    class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <div class="w-12 h-12 text-gray-400">
                        <FaSearch />
                    </div>
                </div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">
                    No posts found
                </h3>
                <p class="text-gray-600 mb-6">
                    Try adjusting your search or filters to find what you're
                    looking for.
                </p>
                <button
                    on:click={handleWritePost}
                    class="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors duration-300"
                >
                    Write Your First Post
                </button>
            </div>
        {:else}
            <!-- Posts Grid -->
            <div
                class="grid grid-cols-1 {viewMode === 'grid'
                    ? 'md:grid-cols-2 lg:grid-cols-3'
                    : ''} gap-6"
            >
                {#each filteredPosts as post, index}
                    <div
                        class="transform transition-all duration-300 hover:scale-102 {viewMode ===
                        'list'
                            ? 'max-w-none'
                            : ''}"
                    >
                        <BlogCard
                            title={post.title}
                            description={post.description}
                            author={post.author}
                            readTime={post.readTime}
                            publishDate={post.publishDate}
                            likes={post.likes}
                            views={post.views}
                            imageUrl={post.imageUrl}
                            category={post.category}
                            featured={post.featured}
                            on:readMore={handleReadMore}
                            on:like={handleLike}
                        />
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <!-- Results Summary -->
    {#if filteredPosts.length > 0}
        <div class="text-center text-gray-600">
            <p>Showing {filteredPosts.length} of {blogPosts.length} posts</p>
        </div>
    {/if}
</div>

<style>
    /* Custom styles for better animations */
    .hover\:scale-102:hover {
        transform: scale(1.02);
    }
</style>
