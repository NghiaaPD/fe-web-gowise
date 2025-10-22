<script lang="ts">
  export let title: string = "";
  export let contributors: number = 0;
  export let timeAgo: string = "";
  export let currentAmount: number = 0;
  export let goalAmount: number = 0;
  export let status: "active" | "completed" | "pending" = "active";
  export let description: string = "";
</script>

<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
  <h3 class="text-lg font-bold text-gray-800 mb-2">{title}</h3>
  <p class="text-sm text-gray-600">{description}</p>
</div>
