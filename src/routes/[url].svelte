<script context="module">
  import SurveyNode from "../components/SurveyNode.svelte";
  import { createFunction } from "../components/expressions";

  // const APP_NAME = process.env.APP_NAME;

  export async function preload(page) {
    const { path } = page;
    const endpoint = `${path}.json`;
    const res = await this.fetch(endpoint);
    if (res.ok) {
      const survey = await res.json();
      return { survey, endpoint };
    }
    this.error(404, "Not found");
  }

  function slide(
    node,
    { out = false, back = false, delay = 0, duration = 600 }
  ) {
    const h = back ? -100 : 100;
    return {
      delay,
      duration,
      css: t =>
        `transform: translateY(${((out ? t - 1 : 1 - t) * h).toFixed(
          2
        )}vh); opacity: ${t.toFixed(2)};`
    };
  }

  /*
  function firstHeaderText(node) {
    const heading = node.children.find(n => n.type === "heading");
    return heading
      ? heading.children
          .filter(n => n.type === "text")
          .map(n => n.value)
          .join("")
      : "";
  }
*/

  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

  function uid() {
    let id = "";
    let size = 16;
    while (size--) id += chars[(Math.random() * 62) | 0];
    return id;
  }
</script>

<script>
  export let survey;

  const pages = survey.body;
  const alwaysTrue = () => true;
  const pageConditions = pages.map(p =>
    p.condition ? createFunction(p.condition.expr) : alwaysTrue
  );

  let context = {
    uid: uid(),
    started_at: new Date()
      .toISOString()
      .substring(0, 19)
      .replace("T", " ")
  };

  async function resp() {
    return fetch(`${survey.id}.json`, {
      method: "POST",
      body: JSON.stringify(context)
    });
  }

  if (process.browser) {
    window.survey_send = resp;
  }

  let pageIndex = 0;
  let viewport;
  let goBack = false;

  function next(url) {
    const lastIndex = pages.length - 1;
    goBack = url === "-";
    try {
      if (url === "-") {
        for (let i = pageIndex - 1; i > -1; i--) {
          if (pageConditions[i](context)) {
            pageIndex = i;
            break;
          }
        }
      } else {
        for (let i = pageIndex + 1; i < pages.length; i++) {
          if (pageConditions[i](context)) {
            pageIndex = i;
            break;
          }
        }
        if (pageIndex === lastIndex) {
          resp();
        }
      }
    } catch (e) {}
  }

  $: currentPage = pages[pageIndex];
</script>

<style lang="scss" global>
  @import "styles/public";
  .next,
  .back {
    padding: 0.2em 0.4em;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(0, 0, 0, 0.7);
    border-radius: 2px;
    color: inherit;
    text-decoration: none;
    cursor: pointer;
  }
</style>

<!-- svelte:head>
  <title>{firstHeaderText(page[0]) || APP_NAME}</title>
</svelte:head -->

<div class="viewport typo">
  {#each pages as page, i}
    {#if i === pageIndex}
      <div
        class="view"
        out:slide={{ out: true, back: goBack }}
        in:slide={{ duration: 800, back: goBack }}>
        <div class="view-body">
          {#each page.children as node}
            <SurveyNode {node} bind:context {next} />
          {/each}
        </div>
      </div>
    {/if}
  {/each}
</div>
