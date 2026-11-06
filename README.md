# Dev Learning Journal

A public journal of everything I learn while building software — small discoveries, core technical concepts, debugging sessions, code experiments, and real-world engineering practices.

The goal is not to publish polished tutorials. It is to **document my actual learning process**, verify my assumptions, and leave behind notes that are useful to another developer reading them later.

---

## How This Repository Is Organized

```
dev-learning-journal/
├── README.md               ← you are here (index of all entries)
├── TEMPLATE.md             ← structure every entry follows
├── 2026/
│   ├── November/           ← entries filed by the date they were written
│   └── December/
├── Topics/                 ← reference hubs, grouped by category
│   ├── JavaScript/
│   ├── NodeJS/
│   ├── Database/
│   ├── Payment-Gateways/
│   ├── System-Design/
│   └── DevOps/
└── Resources/              ← bookmarks, cheatsheets, reading notes
```

**One rule:** the date folder is the single source of truth. Each entry lives in exactly one place — `YYYY/Month/DD-topic-name.md`. The `Topics/` folders hold index links, not copies, so notes never drift out of sync.

**Filename convention:** `DD-topic-name.md`, all lowercase, hyphen-separated. Example: `06-javascript-numeric-separators.md`.

---

## Categories

| Category | What belongs here |
|---|---|
| **JavaScript** | Language semantics, the event loop, async, types, coercion, modern syntax |
| **NodeJS** | Runtime internals, streams, modules, the standard library, package tooling |
| **Database** | SQL and NoSQL, indexes, transactions, query planning, migrations |
| **Payment-Gateways** | Stripe/Razorpay/PayU internals, idempotency, webhooks, reconciliation |
| **System-Design** | Scalability, caching, queues, consistency, failure modes |
| **DevOps** | Linux, containers, CI/CD, observability, deployment |

---

## Index

| Date | Topic | Category | Description | Link |
|---|---|---|---|---|
| — | *No entries yet* | — | — | — |

<!--
When adding an entry, insert a row above this comment, newest first:

| 2026-11-06 | [JavaScript Numeric Separators](2026/November/06-javascript-numeric-separators.md) | JavaScript | How `_` improves readability without changing runtime values | [Read](2026/November/06-javascript-numeric-separators.md) |

Keep the Topic cell as a link — it makes the table scannable and clickable
without needing a separate Link column.
-->

---

## Entry Template

Every entry follows the same ten sections so the journal stays consistent and easy to skim. See [`TEMPLATE.md`](TEMPLATE.md).

## Conventions Used in Entries

- **✅ Verified** — behaviour I confirmed myself (ran the code, read the spec, reproduced the bug).
- **📖 Documented** — stated in official docs, linked in the References section.
- **🤔 Assumption** — my working theory, not yet confirmed. Called out honestly so I don't mistake it for fact.
- Code blocks include the **expected output** so the note is reproducible without guessing.
- Version-sensitive claims state the version they were tested against.

## Why Keep This Public?

- Writing forces me to find the gaps in what I think I understand.
- A public record keeps me accountable to accuracy.
- Future-me debugging at 2 a.m. is the primary audience.
- If a note helps someone else, that's a bonus.
