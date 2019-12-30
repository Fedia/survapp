<script context="module">
  function flatten(node) {
    return (node.children || [])
      .reduce((text, node) => text + " " + flatten(node), node.value || "")
      .trim();
  }

  function shuffleArray(array) {
    for (let i = array.length - 1, j; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
</script>

<script>
  import SurveyNode from "./SurveyNode.svelte";

  export let context;
  export let node;
  export let next = () => {};

  const { params } = node.question;
  if (node.type === "list" && params && params.shuffle) {
    shuffleArray(node.children);
  }
  const multi = node.type === "list" && params && (params.min || params.max);
  const textValues = node.children.map(flatten);

  let checked = {};
  const selected = context[node.question.name];

  if (selected === undefined) {
    context[node.question.name] = null;
  }

  if (Array.isArray(selected)) {
    textValues.forEach((v, i) => {
      checked[i] = selected.includes(v);
    });
  }

  function check(i) {
    if (multi) {
      if (checked[i]) {
        checked[i] = false;
      } else {
        const { max } = params;
        const count = Object.values(checked).filter(Boolean).length;
        if (max && count + 1 <= max) {
          checked[i] = true;
        }
      }
    } else {
      checked = { [i]: true };
    }
    const val = textValues.filter((v, i) => !!checked[i]);
    if (multi) {
      const min = params.min || 0;
      save(val.length >= min ? val : []);
    } else {
      save(val[0]);
    }
  }

  function save(val) {
    context[node.question.name] = val;
  }
</script>

<style>
  .single {
    list-style-type: none;
    padding-left: 0;
  }
  .single > li {
    cursor: pointer;
    margin: 0.4em 0;
  }
  .single > li:before {
    box-sizing: border-box;
    display: inline-block;
    content: "";
    vertical-align: middle;
    width: 0.8em;
    height: 0.8em;
    border: 1px solid rgba(0, 0, 0, 0.7);
    border-radius: 100%;
    margin-right: 0.5em;
  }
  .single > li.checked:before {
    background-color: rgba(0, 0, 0, 0.7);
    box-shadow: inset 0 0 0 0.1em #fff;
  }
  .multi {
    list-style-type: none;
    padding-left: 0;
  }
  .multi > li {
    cursor: pointer;
    margin: 0.4em 0;
  }
  .multi > li:before {
    box-sizing: border-box;
    display: inline-block;
    content: " ";
    vertical-align: middle;
    text-align: center;
    width: 0.8em;
    height: 0.8em;
    border: 1px solid rgba(0, 0, 0, 0.7);
    border-radius: 2px;
    margin-right: 0.5em;
    line-height: 0.4em;
  }
  .multi > li.checked:before {
    content: "✓";
  }
  .input input,
  .input textarea {
    display: block;
    font: inherit;
    font-size: inherit;
    line-height: inherit;
    padding: 0.2em;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(0, 0, 0, 0.7);
    border-radius: 2px;
  }
</style>

{#if node.type === 'list'}
  <ul class:multi class:single={!multi}>
    {#each node.children as child, i}
      <li
        on:click={() => check(i)}
        class:checked={checked[i]}
        role="checkbox"
        aria-checked={checked[i]}>
        <SurveyNode
          node={{ ...child.children[0], type: 'text' }}
          {context}
          {next} />
      </li>
    {/each}
  </ul>
{:else if node.type === 'paragraph'}
  <p class="input">
    {#if params.rows}
      <textarea
        rows={params.rows}
        placeholder={flatten(node)}
        bind:value={context[node.question.name]} />
    {:else}
      <input
        type="text"
        placeholder={flatten(node)}
        bind:value={context[node.question.name]} />
    {/if}
  </p>
{/if}
