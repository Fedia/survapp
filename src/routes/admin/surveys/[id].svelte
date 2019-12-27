<script context="module">
  import { stores, goto } from "@sapper/app";
  import ShareModal from "../_components/ShareModal.svelte";

  const req = {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  };

  export async function preload(page, session) {
    const { path } = page;
    let { id } = page.params;
    const endpoint = `${path}.json`;
    let survey = null;
    if (id === "new") {
      id = null;
      survey = {
        owner: session.email,
        title: "",
        body: ""
      };
    } else {
      const res = await this.fetch(endpoint, req);
      if (res.ok) {
        survey = await res.json();
      }
    }
    return survey
      ? { id, survey, endpoint, path }
      : this.redirect(302, `${path}/../..`);
  }
</script>

<script>
  import { writable } from "svelte/store";
  export let path;
  export let id;
  export let survey;
  export let endpoint;

  const { session } = stores();

  const readonly = survey.owner !== $session.email;

  const title = writable(survey.title);
  const body = writable(survey.body);
  let dirty = false;

  title.subscribe(val => (dirty = dirty || val !== survey.title));
  body.subscribe(val => (dirty = dirty || val !== survey.body));

  let saving = false;
  async function save() {
    if (readonly) return;
    saving = true;
    const res = await fetch(endpoint, {
      ...req,
      method: "POST",
      body: JSON.stringify({
        title: $title,
        body: $body
      })
    });
    saving = false;
    if (res.ok) {
      survey = await res.json();
      $title = survey.title;
      $body = survey.body;
      dirty = false;
    } else {
      window.alert("Error while saving, sorry");
    }
  }

  function confirm(e) {
    if (dirty) {
      if (!window.confirm("Discard changes?")) e.preventDefault();
    }
  }

  let share_survey = null;

  function share() {
    share_survey = survey;
  }

  async function reload() {
    const res = await fetch(endpoint, req);
    survey = res.ok ? await res.json() : {};
  }
</script>

<style lang="scss">
  @import "styles/variables";

  .editor {
    flex: 1;
    display: flex;
    width: 100%;
  }
  .editor textarea {
    flex: 1;
    resize: none;
    border: 0;
    outline: none;
    background: transparent;
  }
  .title-input {
    flex: 1;
    outline: none;
    border: 0;
    font: inherit;
    color: inherit;
    background: transparent;
  }
  .title-input:focus {
    background-color: $secondary-color;
  }
</style>

<div class="container p-0 h-100">

  <header class="navbar navbar-shadow p-1">
    <section class="navbar-section">
      <a href="{path}/../.." class="btn btn-link" on:click={confirm}>
        <i class="icon icon-back" />
      </a>
      <input
        class="title-input m-1"
        type="text"
        placeholder="Survey Title"
        bind:value={$title} />
    </section>
    <section class="navbar-section">
      {#if !readonly && dirty}
        <button on:click={save} class="btn btn-primary" class:loading={saving}>
          Save
        </button>
      {/if}
      {#if readonly}
        <a class="text-gray" href="mailto:{survey.owner}">{survey.owner}</a>
      {/if}
      {#if id}
        <div class="dropdown dropdown-right ml-1">
          <button class="btn btn-link dropdown-toggle" tabindex="0">
            <i class="icon icon-more-vert" />
          </button>
          <ul class="menu">
            <li class="menu-item">
              {#if !readonly}
                <a href="javascript:" on:click={share}>Share</a>
              {/if}
              <a href="{path}.csv">Download results</a>
            </li>
          </ul>
        </div>
      {/if}
    </section>
  </header>

  <div class="editor">
    <textarea class="p-2" bind:value={$body} placeholder="# Survey Markdown" />
  </div>

</div>

<ShareModal survey={share_survey} path={endpoint} on:save={reload} />
