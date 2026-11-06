# Deploying to Vercel

The site is generated, not committed. `scripts/build-site.mjs` reads every
`YYYY/Month/YYYY-MM-DD/*.html` entry and emits `public/` (entry pages plus an
index). `public/` is gitignored, so it can never drift from the sources.

## One-time setup

```bash
cd dev-learning-journal
vercel login
vercel link          # creates .vercel/project.json (gitignored)
```

## Deploy

```bash
npm run build        # always build before deploying
vercel --prod        # or: vercel deploy --prebuilt --prod
```

Or push to the connected Git branch and let Vercel build it (see below).

## Project settings (Vercel dashboard)

| Setting | Value |
|---|---|
| Framework Preset | Other |
| Root Directory | `./` |
| Build Command | `node scripts/build-site.mjs` |
| Output Directory | `public` |
| Install Command | *(leave default / empty)* |

There are no dependencies to install — the build script uses only Node built-ins.
Leaving the install command empty keeps deploys to a few seconds.

## Why a build step at all

The alternative is committing `public/` with a copy of every entry. That means
two copies of each page, and the moment someone edits one, they diverge. The
build regenerates `public/` from the entry HTML every time, so the dated folder
stays the single source of truth.

## URL shape

Each entry is published at a flat, date-prefixed path:

```
/2026-11-06-javascript-numeric-separators.html
```

Flat rather than nested (`/2026/november/2026-11-06/...`) so the link is short
enough to paste into a comment or a post. The date is still in the slug, so it
stays self-describing.

## Links inside published pages

On disk, entry HTML links to sibling `.md` files. Those do not exist on Vercel,
so the build rewrites them to GitHub:

| On disk | Published |
|---|---|
| `javascript-numeric-separators.md` | `https://github.com/.../blob/master/.../javascript-numeric-separators.md` |
| `../../../README.md` | `https://github.com/.../blob/master/README.md` |

`BRANCH` in the build script must match this repo's default branch. It is
**master**, not `main` — GitHub returns 404 for `/blob/main/` on this repo.

## Verifying a deploy

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://<project>.vercel.app/
curl -s -o /dev/null -w "%{http_code}\n" https://<project>.vercel.app/2026-11-06-javascript-numeric-separators.html
```

Both should return `200`. Check one rewritten `.md` link and one `#section`
anchor too — those are the two things most likely to break.
