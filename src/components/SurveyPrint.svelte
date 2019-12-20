<script>
  import { createFunction } from "./expressions";
  export let context;
  export let node;
  
  let print = createFunction(node.expr);

  let print_value = "";
  $: try {
    print_value = print(context);
  } catch (e) {
    print_value = "";
  }
</script>

{print_value}
