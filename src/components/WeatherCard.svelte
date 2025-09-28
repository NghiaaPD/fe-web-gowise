<script lang="ts">
    import FaCloudSun from "svelte-icons/fa/FaCloudSun.svelte";
    import FaCloud from "svelte-icons/fa/FaCloud.svelte";
    import IoIosWater from "svelte-icons/io/IoIosWater.svelte";
    import IoIosEye from "svelte-icons/io/IoIosEye.svelte";
    import FaWind from "svelte-icons/fa/FaWind.svelte";
    import FaSun from "svelte-icons/fa/FaSun.svelte";

    // Props để tái sử dụng component
    export let location: string = "Tokyo, Japan";
    export let temperature: number = 22;
    export let temperatureUnit: string = "°C";
    export let condition: string = "Sunny";
    export let humidity: number = 65;
    export let visibility: number = 10;
    export let visibilityUnit: string = "km";
    export let windSpeed: number = 12;
    export let windUnit: string = "km/h";
    export let uvIndex: number = 6;
    export let backgroundColor: string = "#A7F3D0"; // emerald-200
    export let textColor: string = "#064E3B"; // emerald-900

    // Function để lấy icon weather phù hợp
    function getWeatherIcon(condition: string) {
        const lowerCondition = condition.toLowerCase();
        if (
            lowerCondition.includes("sunny") ||
            lowerCondition.includes("clear")
        ) {
            return FaCloudSun;
        } else if (lowerCondition.includes("cloud")) {
            return FaCloud;
        } else if (lowerCondition.includes("rain")) {
            return FaWind; // có thể thay bằng rain icon
        } else {
            return FaCloudSun; // default
        }
    }

    $: weatherIcon = getWeatherIcon(condition);
</script>

<div
    class="rounded-2xl p-6 text-white relative overflow-hidden transform transition-all duration-300"
    style="background-color: {backgroundColor}; color: {textColor};"
>
    <!-- Header: Location và Temperature -->
    <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
            <!-- Weather Icon -->
            <div class="w-8 h-8">
                <svelte:component this={weatherIcon} />
            </div>
            <!-- Location -->
            <h3 class="text-lg font-semibold">
                {location}
            </h3>
        </div>

        <!-- Temperature -->
        <div class="text-3xl font-bold">
            {temperature}{temperatureUnit}
        </div>
    </div>

    <!-- Weather Condition -->
    <div class="mb-6">
        <p class="text-base opacity-80">
            {condition}
        </p>
    </div>

    <!-- Weather Stats Grid -->
    <div class="grid grid-cols-2 gap-4 text-sm">
        <!-- Left Column -->
        <div class="space-y-3">
            <!-- Humidity -->
            <div class="flex items-center space-x-2">
                <div class="w-4 h-4 opacity-70">
                    <IoIosWater />
                </div>
                <span class="opacity-80">{humidity}%</span>
            </div>

            <!-- Visibility -->
            <div class="flex items-center space-x-2">
                <div class="w-4 h-4 opacity-70">
                    <IoIosEye />
                </div>
                <span class="opacity-80">{visibility} {visibilityUnit}</span>
            </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-3">
            <!-- Wind Speed -->
            <div class="flex items-center space-x-2">
                <div class="w-4 h-4 opacity-70">
                    <FaWind />
                </div>
                <span class="opacity-80">{windSpeed} {windUnit}</span>
            </div>

            <!-- UV Index -->
            <div class="flex items-center space-x-2">
                <div class="w-4 h-4 opacity-70">
                    <FaSun />
                </div>
                <span class="opacity-80">UV {uvIndex}</span>
            </div>
        </div>
    </div>

    <!-- Decorative background pattern (optional) -->
    <div class="absolute top-0 right-0 w-24 h-24 opacity-10 overflow-hidden">
        <div
            class="w-full h-full transform rotate-12 translate-x-6 -translate-y-6"
        >
            <svelte:component this={weatherIcon} />
        </div>
    </div>
</div>
