<script>
  const APP_NAME = process.env.APP_NAME;

  export let path = "";

  const fromLogin = process.browser && location.search === "?login";

  let email = "";
  let error = false;
  let loading = false;
  let done = false;

  const req = {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  };

  async function submit() {
    done = false;
    error = false;
    if (!email.includes("@")) return;
    loading = true;
    const res = await fetch(`${path}login`, {
      ...req,
      method: "POST",
      body: JSON.stringify({ email })
    });
    loading = false;
    done = res.ok;
    error = !done;
    if (done) {
      checkLogin();
    }
  }

  async function checkLogin() {
    const res = await fetch(`${path}login`, req);
    if (res.ok) {
      location.reload(true);
    } else {
      setTimeout(checkLogin, 5000);
    }
  }
</script>

<style>
  .login-form {
    max-width: 400px;
    margin: auto;
  }
  .centered {
    display: flex;
    justify-content: center;
    height: 100vh;
  }
  .login-form .column {
    padding: 0.4rem;
  }
  .email {
    min-width: 14em;
  }
</style>

<div class="centered container">
  <div class="columns">
    <form
      class="login-form column form-horizontal"
      class:has-error={error}
      class:has-success={done}
      on:submit|preventDefault={submit}>
      <h4 class="text-center">Welcome to {APP_NAME}</h4>
      {#if fromLogin}
        <p>Logged in! Please check your other browser or device.</p>
      {:else}
        <div class="form-group">
          <div class="column col-xs-12">
            <input
              bind:value={email}
              class="form-input email"
              type="email"
              placeholder="Email"
              tabindex="0" />
          </div>
          <div class="column col-auto col-xs-12">
            <button
              type="submit"
              class="btn btn-primary col-xs-12"
              class:loading>
              Send link
            </button>
          </div>
        </div>
      {/if}
      {#if error}
        <p class="form-input-hint px-2">
          Sign in error. Please contact the administrator.
        </p>
      {/if}
      {#if done}
        <p class="form-input-hint px-2">Link sent to {email}!</p>
      {/if}
    </form>
  </div>
</div>
