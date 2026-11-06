#!/usr/bin/env node
/**
 * Builds a static site into ./public from the dated entry folders.
 *
 *   node scripts/build-site.mjs
 *
 * Why a build step instead of a checked-in public/ folder:
 * the entry HTML in YYYY/Month/YYYY-MM-DD/ is the single source of truth.
 * Copying it by hand into a deploy folder guarantees the two drift apart.
 *
 * The generated public/ is disposable — delete it any time and rebuild.
 */

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public");

/* Where the Markdown originals live once published. Relative .md links
   inside the HTML would 404 on Vercel, so they point at GitHub instead.

   BRANCH must match this repo's default branch — it is master, not main.
   GitHub 404s on /blob/main/ when the branch does not exist. */
const REPO = "https://github.com/jeerupraveen04/dev-learning-journal";
const BRANCH = "master";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Walk 20xx/Month/YYYY-MM-DD/ and collect html entries, newest first. */
function discover() {
  const entries = [];

  for (const year of readdirSync(ROOT)) {
    if (!/^\d{4}$/.test(year)) continue;
    const yearDir = join(ROOT, year);
    if (!statSync(yearDir).isDirectory()) continue;

    for (const month of readdirSync(yearDir)) {
      const monthDir = join(yearDir, month);
      if (!statSync(monthDir).isDirectory()) continue;
      if (!MONTHS.includes(month)) continue;

      for (const day of readdirSync(monthDir)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
        const dayDir = join(monthDir, day);

        for (const file of readdirSync(dayDir)) {
          if (!file.endsWith(".html")) continue;

          const abs = join(dayDir, file);
          const rel = relative(ROOT, abs).split("\\").join("/");
          const slug = `${day}-${file.replace(/\.html$/, "")}`;
          const raw = readFileSync(abs, "utf8");

          entries.push({
            abs,
            rel,
            slug,
            date: day,
            month,
            year,
            title: extract(raw, /<title>([\s\S]*?)<\/title>/i) || file,
            heading: extract(raw, /<h1[^>]*>([\s\S]*?)<\/h1>/i) || file,
            standfirst: extract(raw, /<p class="standfirst">([\s\S]*?)<\/p>/i),
            category: extract(raw, /<li>([A-Za-z-]+)<\/li>/) || "",
          });
        }
      }
    }
  }

  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
  return entries;
}

const deent = (s) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

function extract(html, re) {
  const m = html.match(re);
  return m ? deent(m[1]) : "";
}

/** Rewrite links that only work on the filesystem into GitHub links.
    Produces two distinct targets: the .md original, and the README index. */
function rewriteLinks(html, entry) {
  const mdPath = `${REPO}/blob/${BRANCH}/${entry.rel.replace(/\.html$/, ".md")}`;
  const readme = `${REPO}/blob/${BRANCH}/README.md`;

  return html
    /* "All entries" / index links point at README, not at the entry itself.
       Run this first, then the generic rule must skip absolute URLs. */
    .replace(/href="(?:\.\.\/)*README\.md"/g, `href="${readme}"`)
    .replace(/href="(?!https?:)[^"]*\.md"/g, `href="${mdPath}"`);
}

/** Small self-contained index, same cream/orange palette as the entries. */
function indexPage(entries) {
  const cards = entries
    .map((e) => {
      const [, mm, dd] = e.date.split("-");
      const label = `${Number(dd)} ${MONTHS[Number(mm) - 1]} ${e.year}`;
      const blurb = e.standfirst || "";
      return `      <li class="card">
        <a href="/${e.slug}.html">
          <span class="date">${label}</span>
          <h2>${e.heading}</h2>
          <p>${blurb}</p>
          <span class="more">Read entry &rarr;</span>
        </a>
      </li>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dev Learning Journal</title>
<meta name="description" content="A public journal of things learned while building software.">
<meta name="color-scheme" content="light">
<style>
  :root{
    --cream-50:#FFFCF7; --cream-100:#FDF6EC; --cream-200:#F8EEE0;
    --rule:#E8D7C0; --orange-400:#F0904A; --orange-500:#E0711E; --orange-600:#C1570F;
    --orange-tint:rgba(224,113,30,.10);
    --ink:#2C2318; --ink-soft:#5B4B39; --ink-faint:#8B7862;
    --serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
    --sans:"Segoe UI",system-ui,-apple-system,Arial,sans-serif;
  }
  *{box-sizing:border-box}
  body{
    margin:0;background:var(--cream-100);color:var(--ink);
    font-family:var(--sans);font-size:17px;line-height:1.7;
    -webkit-font-smoothing:antialiased;
    min-height:100vh;display:flex;flex-direction:column;
  }
  main{flex:1 0 auto}
  header{
    border-bottom:1px solid var(--rule);padding:4rem 0 3rem;
    background:
      radial-gradient(900px 380px at 8% -30%, rgba(240,144,74,.28), transparent 62%),
      radial-gradient(700px 320px at 92% 0%, rgba(224,113,30,.14), transparent 60%),
      linear-gradient(180deg,#FFF8EE 0%, var(--cream-100) 100%);
  }
  .wrap{width:100%;max-width:960px;margin:0 auto;padding:0 1.5rem}
  .kicker{
    margin:0 0 1rem;font-size:.72rem;font-weight:700;letter-spacing:.22em;
    text-transform:uppercase;color:var(--orange-600);
  }
  h1{
    margin:0 0 1rem;font-family:var(--serif);font-weight:600;
    font-size:clamp(2rem,4.6vw,3.1rem);line-height:1.12;letter-spacing:-.018em;
  }
  header p{margin:0;max-width:56ch;color:var(--ink-soft)}
  main{padding:3rem 0 5rem;flex:1 0 auto}
  ul.entries{list-style:none;margin:0;padding:0;display:grid;gap:1rem}
  .card a{
    display:block;text-decoration:none;color:inherit;background:var(--cream-50);
    border:1px solid var(--rule);border-radius:14px;padding:1.4rem 1.5rem;
    transition:border-color .15s, transform .15s, box-shadow .15s;
  }
  .card a:hover{
    border-color:var(--orange-400);transform:translateY(-2px);
    box-shadow:0 14px 30px -24px rgba(60,40,20,.6);
  }
  .card .date{
    display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.08em;
    text-transform:uppercase;color:var(--orange-600);
    background:var(--orange-tint);border:1px solid #F6B27B;
    border-radius:999px;padding:.2rem .6rem;margin-bottom:.8rem;
  }
  .card h2{
    margin:0 0 .4rem;font-family:var(--serif);font-size:1.3rem;font-weight:600;line-height:1.3;
  }
  .card p{margin:0 0 .7rem;color:var(--ink-soft);font-size:.94rem}
  .card .more{font-size:.82rem;font-weight:700;color:var(--orange-600)}
  footer{
    border-top:1px solid var(--rule);background:var(--cream-200);
    padding:2rem 0;font-size:.82rem;color:var(--ink-faint);
    flex-shrink:0;
  }
  footer a{color:var(--orange-600);text-decoration:none;font-weight:600}
  @media (max-width:600px){body{font-size:16px}header{padding:3rem 0 2.4rem}}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <p class="kicker">Dev Learning Journal</p>
    <h1>Things I learned while building software</h1>
    <p>Small discoveries, core concepts, debugging sessions, and the parts that only made sense after I got them wrong.</p>
  </div>
</header>
<main class="wrap">
  <ul class="entries">
${cards}
  </ul>
</main>
<footer>
  <div class="wrap">
    <a href="${REPO}">Source on GitHub</a>
  </div>
</footer>
</body>
</html>`;
}

async function main() {
  const entries = discover();

  if (entries.length === 0) {
    console.error("No HTML entries found under YYYY/Month/YYYY-MM-DD/");
    process.exit(1);
  }

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  for (const e of entries) {
    const html = await readFile(e.abs, "utf8");
    await writeFile(join(OUT, `${e.slug}.html`), rewriteLinks(html, e), "utf8");
    console.log(`  entry  /${e.slug}.html`);
  }

  await writeFile(join(OUT, "index.html"), indexPage(entries), "utf8");
  console.log(`  index  /index.html (${entries.length} entr${entries.length === 1 ? "y" : "ies"})`);
  console.log(`\nBuilt ${entries.length} entry page(s) into public/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
