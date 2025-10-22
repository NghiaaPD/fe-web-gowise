<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import FaUser from "svelte-icons/fa/FaUser.svelte";
  import FaShieldAlt from "svelte-icons/fa/FaShieldAlt.svelte";
  import FaAtlas from "svelte-icons/fa/FaAtlas.svelte";
  import IoMdHelpCircleOutline from "svelte-icons/io/IoMdHelpCircleOutline.svelte";

  const dispatch = createEventDispatcher();

  export let activeItem = "profile";

  const menuItems = [
    {
      id: "profile",
      label: "Hồ sơ",
      icon: FaUser,
    },
    {
      id: "security",
      label: "Tài khoản & Bảo mật",
      icon: FaShieldAlt,
    },
    {
      id: "preferences",
      label: "Tùy chọn",
      icon: FaAtlas,
    },
    {
      id: "help",
      label: "Trợ giúp & Hỗ trợ",
      icon: IoMdHelpCircleOutline,
    },
  ];

  function selectItem(itemId: string) {
    activeItem = itemId;
    dispatch("itemSelected", { itemId });
  }
</script>

<nav class="navigator-setting">
  <ul class="menu-list">
    {#each menuItems as item}
      <li class="menu-item">
        <button
          class="menu-button"
          class:active={activeItem === item.id}
          on:click={() => selectItem(item.id)}
        >
          <div class="menu-icon">
            <svelte:component this={item.icon} />
          </div>
          <span class="menu-label">{item.label}</span>
        </button>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .navigator-setting {
    width: 360px;
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e9ecef;
  }

  .menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .menu-item {
    margin-bottom: 2px;
  }

  .menu-button {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 12px 14px;
    background: none;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    color: #6c757d;
    font-size: 14px;
    font-weight: 400;
  }

  .menu-button:hover {
    background-color: #e9ecef;
    color: #495057;
  }

  .menu-button.active {
    background-color: #e6fffa;
    color: #0d9488;
    font-weight: 500;
  }

  .menu-icon {
    width: 18px;
    height: 18px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .menu-icon :global(svg) {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }

  .menu-label {
    flex: 1;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif;
  }
</style>
