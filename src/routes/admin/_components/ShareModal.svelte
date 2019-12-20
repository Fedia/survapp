<script>
  import { writable } from "svelte/store";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let path = "";
  export let survey;

  let readers = writable("");

  const sepRx = /[\s\n]+/;

  $: if (survey) {
    $readers = survey.readers
      ? survey.readers
          .split(sepRx)
          .filter(Boolean)
          .join("\n")
      : "";
  }

  function close() {
    survey = null;
  }

  let saving = false;
  async function save() {
    saving = true;
    const res = await fetch(path, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({
        readers:
          " " +
          $readers
            .split(sepRx)
            .filter(Boolean)
            .join(" ") +
          " "
      })
    });
    saving = false;
    if (res.ok) {
      close();
      dispatch("save");
    } else {
      window.alert("Error while saving, sorry");
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
        <div class="modal-title h5">Share {survey.title || 'Untitled'}</div>
      </div>
      <div class="modal-body">
        <div class="content">
          <div class="form-group">
            <label class="form-label" for="survey-readers">
              Give read access to:
            </label>
            <textarea
              class="form-input"
              id="survey-readers"
              placeholder="user@email"
              rows="5"
              bind:value={$readers} />
            <p class="form-input-hint">One email per line.</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" on:click={close}>Cancel</button>
        <button class="btn btn-primary" on:click={save} class:loading={saving}>
          Save
        </button>
      </div>
    </div>
  </div>
{/if}
