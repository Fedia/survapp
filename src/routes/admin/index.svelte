<script context="module">
  import { stores } from "@sapper/app";
  import PublishModal from "./_components/PublishModal.svelte";

  const APP_NAME = process.env.APP_NAME;

  const req = {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  };

  function formatDate(dt) {
    const d = new Date(dt);
    return d.toLocaleString();
  }

  export async function preload(page, session) {
    const { path } = page;
    const endpoint = `${path}surveys.json`;
    let surveys = [];
    if (session) {
      const res = await this.fetch(endpoint, req);
      if (res.ok) {
        surveys = await res.json();
      }
    }
    return { surveys, endpoint, path };
  }
</script>

<script>
  export let surveys;
  export let endpoint;
  export let path;

  const { session } = stores();

  let sortby = null;

  $: surveys_sorted = sortby ? surveys.slice().sort(sorter) : surveys;

  function sorter(a, b) {
    return a[sortby] > b[sortby] ? 1 : a[sortby] < b[sortby] ? -1 : 0;
  }

  async function load() {
    const res = await fetch(endpoint, req);
    return res.ok ? res.json() : {};
  }

  /*  async function load(page = 0) {
    const res = await fetch(`${endpoint}?page=${page}`, req);
    return res.ok ? res.json() : {};
  }*/

  async function reload() {
    surveys = await load();
  }

  async function trash(survey) {
    if (window.confirm(`Delete ${survey.title}?`)) {
      const res = await fetch(`${path}surveys/${survey.id}.json`, {
        ...req,
        method: "DELETE"
      });
      if (res.ok) {
        reload();
      }
    }
  }

  let publish_survey = null;

  function publish_modal(survey) {
    publish_survey = survey ? { ...survey } : null;
  }
</script>

<style>
  .right {
    text-align: right;
  }
  .surveys .column {
    align-self: center;
  }
  .navbar {
    position: sticky;
    z-index: 2;
    top: 0;
    background-color: rgba(255, 255, 255, 0.9);
  }
  .sortby .btn {
    min-width: 2.5em;
    max-width: 2.5em;
  }
  .no-overflow {
    overflow: hidden;
  }
</style>

<div class="container p-0">
  <header class="navbar p-1">
    <section class="navbar-section">
      <a class="btn btn-action btn-primary" href="{path}surveys/new">
        <i class="icon icon-plus" />
      </a>
    </section>
    <section class="navbar-center hide-xs">
      <a href="/" class="navbar-brand text-bold mx-2">{APP_NAME}</a>
    </section>
    <section class="navbar-section">
      {#if surveys.length}
        <a class="btn btn-link mx-2" href="{path}trash">
          <i class="icon icon-delete" />
        </a>
        <div class="sortby btn-group">
          <button
            class="btn"
            class:active={!sortby}
            on:click={() => (sortby = null)}>
            <i class="icon icon-time" />
          </button>
          <button
            class="btn"
            class:active={sortby === 'title'}
            on:click={() => (sortby = 'title')}>
            a-z
          </button>
        </div>
      {/if}
    </section>
  </header>
  <div class="surveys main-width container my-2">
    {#each surveys_sorted as survey (survey.id + survey.published_at)}
      <div class="columns py-2">
        <div class="column col-5 no-overflow">
          <a href="{path}surveys/{survey.id}">{survey.title || 'Untitled'}</a>
        </div>
        <div class="column right text-gray">
          {#if survey.published_at}
            <i class="icon icon-link" />
            <a href="/{survey.url}" target="_blank">{survey.url}</a>
          {/if}
        </div>
        <div class="column col-3 right text-gray hide-xs">
          {formatDate(survey.updated_at)}
        </div>
        <div class="column col-2 right">
          <div class="dropdown dropdown-right">
            <button class="btn btn-link dropdown-toggle" tabindex="0">
              <i class="icon icon-more-vert" />
            </button>
            <ul class="menu">
              {#if survey.owner === $session.email}
                <li class="menu-item">
                  <a href="javascript:" on:click={() => publish_modal(survey)}>
                    Publish
                  </a>
                </li>
                <li class="menu-item">
                  <a href="javascript:" on:click={() => trash(survey)}>
                    Delete
                  </a>
                </li>
              {/if}
              <li class="menu-item">
                <a href="{path}surveys/{survey.id}.csv">Download results</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    {:else}
      <div class="empty">
        <p class="empty-title h5">You have no surveys yet</p>
        <p class="empty-subtitle">Click the button to create one.</p>
        <div class="empty-action">
          <a class="btn btn-primary" href="{path}surveys/new">New survey</a>
        </div>
      </div>
    {/each}
  </div>
</div>

<PublishModal survey={publish_survey} {path} on:save={reload} />
