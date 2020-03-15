<script>
  import { stores } from "@sapper/app";
  import LoginForm from "./_components/LoginForm.svelte";

  const { session } = stores();
  const APP_NAME = process.env.APP_NAME;
  const ADMIN_PATH = process.env.ADMIN_PATH + "/";
</script>

<style lang="scss" global>
  @import "styles/variables";
  @import "spectre.css/src/spectre";
  @import "spectre.css/src/spectre-icons";

  .main-width {
    max-width: 740px;
    margin: auto;
  }
  .h-100 {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .navbar-shadow {
    box-shadow: 0 0px 3px 1px rgba(0, 0, 0, 0.2);
    z-index: 2;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .container {
    animation: fade-in 0.2s;
  }
</style>

<svelte:head>
  <title>{APP_NAME}</title>
</svelte:head>

{#if $session}
  <slot />
{:else}
  <LoginForm path={ADMIN_PATH} />
{/if}
