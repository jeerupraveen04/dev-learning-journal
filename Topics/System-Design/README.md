# System Design

Scalability, caching, queues, consistency, and failure modes.

## Entries

| Date | Topic | Link |
|---|---|---|
| — | *No entries yet* | — |

---

## High-Value Areas to Cover

- **Idempotency in distributed systems** (not just payments)
- **CAP and PACELC** — what "choose two" actually means in practice
- **Cache invalidation** — TTL, write-through vs write-behind, stampedes
- **Queues** — at-least-once vs exactly-once delivery, and why exactly-once is a myth in most setups
- **Backpressure** — bounded queues vs unbounded memory growth
- **Retries and jitter** — exponential backoff, thundering herds
- **Circuit breakers** — failure isolation and half-open state
- **Consistent hashing** — sharding and rebalancing cost
- **Outbox pattern** — atomic DB write + event publish
- **Graceful degradation** — what to turn off first under load
