<script context="module">
  import { stores } from "@sapper/app";

  const req = {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  };

  function formatDate(dt) {
    const d = new Date(dt);
    return d.toLocaleString();
  }

  function dirname(path) {
    return path.replace(/[^\/]+\/*$/, "");
  }

  export async function preload(page, session) {
    let { path } = page;
    path = dirname(path);
    const endpoint = `${path}surveys.json?deleted`;
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

  async function reload() {
    surveys = await load();
  }

  async function restore(survey) {
    const res = await fetch(`${path}surveys/${survey.id}.json`, {
      ...req,
      method: "POST",
      body: JSON.stringify({
        deleted_at: null,
        published_at: null
      })
    });
    if (res.ok) {
      reload();
    }
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
      <a href={path} class="btn btn-link">
        <i class="icon icon-back" />
      </a>
    </section>
    <section class="navbar-section">
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
    </section>
  </header>
  <div class="surveys main-width container my-2">
    {#each surveys_sorted as survey (survey.id)}
      <div class="columns py-2">
        <div class="column no-overflow">
          <a href="{path}surveys/{survey.id}">{survey.title || 'Untitled'}</a>
        </div>
        <div class="column col-3 right text-gray hide-xs">
          {formatDate(survey.deleted_at)}
        </div>
        <div class="column col-sm-4 col-2 right">
          <button on:click={() => restore(survey)} class="btn btn-link">
            <i class="icon icon-refresh" />
          </button>
          <div class="dropdown dropdown-right">
            <button class="btn btn-link dropdown-toggle" tabindex="0">
              <i class="icon icon-more-vert" />
            </button>
            <ul class="menu">
              <li class="menu-item">
                <a href="{path}surveys/{survey.id}.csv">Download results</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    {:else}
      <div class="empty">
        <p class="empty-title h5">No surveys to restore</p>
        <p class="empty-subtitle">Deleted surveys will be moved here.</p>
        <div class="empty-action">
          <a class="btn" href={path}>OK</a>
        </div>
      </div>
    {/each}
  </div>
</div>
