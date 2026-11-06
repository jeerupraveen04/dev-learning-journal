# Payment-Gateways

Gateway internals, idempotency, webhooks, reconciliation, and money-handling correctness.

## Entries

| Date | Topic | Link |
|---|---|---|
| — | *No entries yet* | — |

---

## High-Value Areas to Cover

- **Idempotency keys** — why retries without them create duplicate charges
- **Webhook signatures** — HMAC verification, replay windows, raw-body handling in Express
- **Money as integers** — minor units, floating-point rounding, currency exponents
- **Payment state machines** — authorized → captured → settled → refunded
- **Double-entry ledger** — why a `balance` column isn't enough
- **Reconciliation** — matching gateway settlement reports against internal records
- **PCI scope** — tokenization, hosted fields, and never storing PANs
- **3-D Secure / SCA** — the redirect flow and async confirmation
- **Retry semantics** — which failures are retryable, and which are terminal
- **Test vs live modes** — key prefixes and the cost of crossing them
