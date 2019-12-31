<script context="module">
  const headEntries = new Set();

  function appendHead(html) {
    if (process.browser && !headEntries.has(html)) {
      document.head.insertAdjacentHTML("beforeEnd", html);
      headEntries.add(html);
    }
  }

  function matchHead(html) {
    return html.match(/^<head>([\s\S]*)<\/head>$/i);
  }
</script>

<script>
  import SurveyQuestion from "./SurveyQuestion.svelte";
  import SurveyPrint from "./SurveyPrint.svelte";
  import { createFunction } from "./expressions";

  export let context;
  export let node;
  export let next = () => {};

  let cond = null;
  if (node.condition) {
    cond = createFunction(node.condition.expr);
  }

  let cond_value = false;
  $: try {
    cond_value = cond ? cond(context) : true;
  } catch (e) {
    cond_value = false;
  }

  let head = null;
  if (node.type === "html") {
    let m = matchHead(node.value);
    if (m) {
      head = m[1];
    }
  }

  $: if (cond_value && head) {
    appendHead(head);
  }
</script>

{#if cond_value}
  {#if head}
    <!-- head -->
  {:else if node.question}
    <SurveyQuestion {node} bind:context {next} />
  {:else if node.type === 'print'}
    <SurveyPrint {node} {context} />
  {:else if node.type === 'heading'}
    {#if node.depth === 1}
      <h1>
        {#each node.children as child}
          <svelte:self node={child} {context} {next} />
        {/each}
      </h1>
    {:else if node.depth === 2}
      <h2>
        {#each node.children as child}
          <svelte:self node={child} {context} {next} />
        {/each}
      </h2>
    {:else if node.depth > 2}
      <h3>
        {#each node.children as child}
          <svelte:self node={child} {context} {next} />
        {/each}
      </h3>
    {/if}
  {:else if node.type === 'paragraph'}
    <p>
      {#each node.children as child}
        <svelte:self node={child} {context} {next} />
      {/each}
    </p>
  {:else if node.type === 'list'}
    <ul>
      {#each node.children as child}
        <li>
          <svelte:self
            node={{ ...child.children[0], type: 'text' }}
            {context}
            {next} />
        </li>
      {/each}
    </ul>
  {:else if node.type === 'link'}
    {#if node.url === '+' || node.url === '-'}
      <a
        href="javascript:"
        class={node.url === '+' ? 'next' : 'back'}
        on:click={() => next(node.url)}>
        {#each node.children as child}
          <svelte:self node={child} {context} />
        {/each}
      </a>
    {:else}
      <a
        href={node.url}
        target={node.url.includes('//') ? '_blank' : '_self'}
        rel={node.url.includes('//') ? 'nofollow noopener' : false}>
        {#each node.children as child}
          <svelte:self node={child} {context} />
        {/each}
      </a>
    {/if}
  {:else if node.type === 'image'}
    <img src={node.url} alt={node.alt} />
  {:else if node.type === 'strong'}
    <b>
      {#each node.children as child}
        <svelte:self node={child} {context} {next} />
      {/each}
    </b>
  {:else if node.type === 'emphasis'}
    <i>
      {#each node.children as child}
        <svelte:self node={child} {context} {next} />
      {/each}
    </i>
  {:else if node.type === 'inlineCode'}
    <tt>{node.value}</tt>
  {:else if node.type === 'break'}
    <br />
  {:else if node.value}
    {@html node.value}
  {:else if node.children}
    {#each node.children as child}
      <svelte:self node={child} {context} {next} />
    {/each}
  {/if}
{/if}
