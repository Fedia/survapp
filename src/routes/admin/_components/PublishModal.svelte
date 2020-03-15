<script>
  import { writable } from "svelte/store";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let path = "";
  export let survey;

  let url = writable("");
  let published = writable(false);
  $: can_publish = ($url && validURL($url)) || (!$url && !$published);
  $: url_error = $url && !validURL($url);

  let url_exists = false;
  url.subscribe(() => (url_exists = false));

  $: if (survey) {
    url_exists = false; // need to reset the state here because $url won't trigger update if the previous value was the same
    $url = survey.url;
    $published = !!survey.published_at;
  }

  function close() {
    survey = null;
  }

  function validURL(url) {
    return typeof url === "string" && url.match(/^[a-z][a-z0-9-]*$/i);
  }

  let saving = false;
  async function save() {
    if (!can_publish) return;
    saving = true;
    const res = await fetch(`${path}surveys/${survey.id}.json`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        url: $url,
        published_at: $published ? new Date() : null
      })
    });
    saving = false;
    if (res.ok) {
      close();
      dispatch("save");
    } else {
      if (res.status === 403) {
        url_exists = true;
      } else {
        window.alert("Error while saving, sorry");
      }
    }
  }
</script>

{#if survey}
  <div class="modal modal-sm active">
    <a
      href="javascript:"
      on:click={close}
      class="modal-overlay"
      aria-label="Close" />
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title h5">{survey.title || 'Untitled'}</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <div class="form-group" class:has-error={url_error || url_exists}>
            <label class="form-label" for="survey-url">URL</label>
            <input
              class="form-input"
              type="text"
              id="survey-url"
              placeholder="my-survey"
              bind:value={$url} />
            {#if url_error}
              <p class="form-input-hint">
                Use only latin letters, digits and a dash. Should start with a
                letter.
              </p>
            {/if}
            {#if url_exists}
              <p class="form-input-hint">
                Another survey is published on this URL.
              </p>
            {/if}
          </div>
          <div class="form-group">
            <label class="form-switch is-error">
              <input type="checkbox" bind:checked={$published} />
              <i class="form-icon" />
              Published
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" on:click={close}>Cancel</button>
        <button
          class="btn btn-primary"
          on:click={save}
          disabled={!can_publish}
          class:loading={saving}>
          Save
        </button>
      </div>
    </div>
  </div>
{/if}
