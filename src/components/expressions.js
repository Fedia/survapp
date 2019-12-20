export function createFunction(expr) {
  return new Function("_c", `with(_c) return ${expr}`);
}
