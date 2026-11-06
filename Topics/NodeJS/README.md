# NodeJS

Runtime internals, streams, module resolution, and the standard library.

## Entries

| Date | Topic | Link |
|---|---|---|
| — | *No entries yet* | — |

---

## High-Value Areas to Cover

- How `require` resolves a path (and why `node_modules` lookup walks upward)
- ESM vs CommonJS: interop pitfalls, `__dirname` in ESM
- Streams: backpressure, `pipeline()` vs `pipe()`
- The libuv threadpool: default size 4, and what runs on it
- `Buffer` vs `Uint8Array`
- `cluster` vs `worker_threads` vs child processes
- `--max-old-space-size`, heap snapshots, memory leaks
- Graceful shutdown: `SIGTERM`, in-flight requests, draining connections
- `npm` lockfiles, semver ranges, and `overrides`
