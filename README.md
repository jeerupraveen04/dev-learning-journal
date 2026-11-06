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
│   ├── November/
│   │   └── 2026-11-06/     ← one folder per day that has an entry
│   │       └── javascript-numeric-separators.md
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

**One rule:** the date folder is the single source of truth. Each entry lives in exactly one place — `YYYY/Month/YYYY-MM-DD/topic-name.md`. The `Topics/` folders hold index links, not copies, so notes never drift out of sync.

**Folder convention:** every day you write something gets its own folder named after the full date.

```
2026/November/2026-11-06/javascript-numeric-separators.md
             └─ date folder    └─ topic filename
```

**Every entry ships in two formats**, side by side in the same date folder:

| File | Purpose |
|---|---|
| `topic-name.md` | The canonical record. Git-friendly, diffable, indexable. |
| `topic-name.html` | Self-contained reading copy, cream-and-orange theme. No build step, no external CSS/JS. |

The HTML is a presentation layer, not a second source of truth. **Edit the Markdown, then regenerate the HTML** — never hand-edit the HTML and let the Markdown drift. If the two ever disagree, the Markdown wins.

**Filename convention:** `topic-name.md` / `topic-name.html`, all lowercase, hyphen-separated, no date prefix — the folder already carries the date. Example: `javascript-numeric-separators.md`.

Why a folder per day rather than a flat month folder:

- The date is readable in isolation. `06-javascript-numeric-separators.md` loses its meaning the moment it's copied out of `November/`.
- A day that produces multiple notes, a screenshot, or a small runnable sample has somewhere to put them together.
- Sorting stays chronological, because `YYYY-MM-DD` is lexicographically ordered.

Only days with entries get folders. Don't pre-create empty ones for the month.

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
| 2026-11-06 | [JavaScript Numeric Separators](2026/November/2026-11-06/javascript-numeric-separators.md) | JavaScript | Why `_` in numeric literals is purely lexical — and why it does nothing for floating-point precision in money code | [Read](2026/November/2026-11-06/javascript-numeric-separators.md) · [HTML](2026/November/2026-11-06/javascript-numeric-separators.html) |

<!--
When adding an entry, insert a row above this comment, newest first:

| 2026-11-06 | [JavaScript Numeric Separators](2026/November/2026-11-06/javascript-numeric-separators.md) | JavaScript | How `_` improves readability without changing runtime values | [Read](2026/November/2026-11-06/javascript-numeric-separators.md) · [HTML](2026/November/2026-11-06/javascript-numeric-separators.html) |

Keep the Topic cell as a link — it makes the table scannable and clickable
without needing a separate Link column.
-->

---

## Adding a New Entry

1. Create today's folder under the current month: `2026/November/2026-11-06/`
2. Add the entry as `topic-name.md` inside it.
3. Generate the companion `topic-name.html` from the Markdown.
4. Add a row to the [Index](#index) above, newest first.
5. Link it from the matching `Topics/<Category>/README.md` hub.

Only create a date folder for a day that actually has an entry.

## HTML Version

Each entry also ships as a single self-contained HTML file in the same folder.

- **Zero dependencies.** All CSS and JS are inline. It opens from the filesystem, emails cleanly, and needs no build step.
- **Cream-and-orange theme.** Warm paper background (`#FDF6EC`), burnt-orange accents (`#C1570F`), dark espresso code blocks.
- **Reading aids.** Sticky table of contents with scroll-spy, reading-progress bar, copy button on every code block, and a print stylesheet that inverts code blocks to black-on-white.
- **Accessible.** Semantic landmarks, visible focus rings, `prefers-reduced-motion` support, and no horizontal overflow at mobile widths.

Open it by double-clicking, or preview it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/2026/November/2026-11-06/javascript-numeric-separators.html
```

`file://` URLs work too — there is nothing to fetch.

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
