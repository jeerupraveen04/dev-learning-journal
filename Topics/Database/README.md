# Database

SQL and NoSQL internals, indexing, transactions, and query planning.

## Entries

| Date | Topic | Link |
|---|---|---|
| — | *No entries yet* | — |

---

## High-Value Areas to Cover

- B-tree vs hash indexes; why a leading-column rule exists in composite indexes
- `EXPLAIN ANALYZE`: reading a plan, seq scan vs index scan
- Isolation levels and the anomalies each one allows
- MVCC: how Postgres keeps readers from blocking writers
- `SELECT ... FOR UPDATE` and lost-update prevention
- N+1 queries and eager loading
- Connection pooling: why the pool size is small, not large
- Migrations: reversible, lock-aware, and safe on large tables
- `EXPLAIN` on a `LIKE '%term%'` — why the index is ignored
