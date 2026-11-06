# JavaScript

Language semantics, the event loop, async patterns, type coercion, and modern syntax.

## Entries

| Date | Topic | Link |
|---|---|---|
| 2026-11-06 | [Numeric separators & floating-point precision](../../2026/November/2026-11-06/javascript-numeric-separators.md) | [Read](../../2026/November/2026-11-06/javascript-numeric-separators.md) · [HTML](../../2026/November/2026-11-06/javascript-numeric-separators.html) |

---

## High-Value Areas to Cover

- `this` binding: four rules, and why arrow functions break all of them
- The event loop: macrotasks, microtasks, and `process.nextTick` priority
- Type coercion: `==` vs `===`, the `+` operator, truthiness edge cases
- Numbers: IEEE-754, `0.1 + 0.2`, `Number.MAX_SAFE_INTEGER`, `BigInt` — ✅ [covered](../../2026/November/2026-11-06/javascript-numeric-separators.md)
- Closures, hoisting, and the temporal dead zone
- `structuredClone` vs `JSON.parse(JSON.stringify())`
- Promises vs async/await: error propagation and unhandled rejections
- Array methods that mutate vs return new arrays
