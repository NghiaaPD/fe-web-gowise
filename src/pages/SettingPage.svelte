<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import NavigatorSetting from "../components/NavigatorSetting.svelte";
  import ProfilePage from "./ProfilePage.svelte";
  import SecurityPage from "./SecurityPage.svelte";
  import PreferancesPage from "./PreferancesPage.svelte";
  import PaymentConfigPage from "./PaymentConfigPage.svelte";
  import HelpPage from "./HelpPage.svelte";

  const dispatch = createEventDispatcher();
  let selectedItem = "profile";

  function handleItemSelected(event: CustomEvent) {
    selectedItem = event.detail.itemId;
    console.log("Selected:", selectedItem);
  }

  function handleProfileUpdated() {
    dispatch("profileUpdated");
  }

  function getPageTitle(itemId: string): string {
    const titles: Record<string, string> = {
      profile: "Profile",
      security: "Account & Security",
      preferences: "Preferences",
      payment: "Payment Methods",
      help: "Help & Support",
    };
    return titles[itemId] || "Settings";
  }
</script>

<div class="setting-page">
  <div class="sidebar">
    <NavigatorSetting
      activeItem={selectedItem}
      on:itemSelected={handleItemSelected}
    />
  </div>

  <div class="content">
    <div class="content-header">
      <h1>{getPageTitle(selectedItem)}</h1>
    </div>

    <div class="content-body">
      {#if selectedItem === "profile"}
        <ProfilePage on:profileUpdated={handleProfileUpdated} />
      {:else if selectedItem === "security"}
        <SecurityPage />
      {:else if selectedItem === "preferences"}
        <PreferancesPage />
      {:else if selectedItem === "payment"}
        <PaymentConfigPage />
      {:else if selectedItem === "help"}
        <HelpPage />
      {/if}
    </div>
  </div>
</div>

<style>
  .setting-page {
    display: flex;
    gap: 24px;
    padding: 24px;
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .sidebar {
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e9ecef;
    overflow: hidden;
  }

  .content-header {
    padding: 24px 24px 0 24px;
    border-bottom: 1px solid #e9ecef;
    margin-bottom: 24px;
  }

  .content-header h1 {
    margin: 0 0 24px 0;
    font-size: 24px;
    font-weight: 600;
    color: #212529;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif;
  }

  .content-body {
    padding: 0 24px 24px 24px;
  }
</style>
