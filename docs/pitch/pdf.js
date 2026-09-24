#!/usr/bin/env node
// Prints the built deck to PDF, one slide per 1280 x 720 page.
//
// Opens critter-crumbs.html with ?print, which makes the deck lay every slide
// out in order (see the script at the end of the deck), waits for the two
// webfonts, and prints with the page size the stylesheet declares. Uses the
// Playwright Chromium the e2e suite already installs; no new dependency.
//
//   ./docs/pitch/build.sh && node docs/pitch/pdf.js
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, "critter-crumbs.html");
const out = process.argv[2] || path.join(here, "critter-crumbs.pdf");

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto("file://" + src + "?print", { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() =>
      [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family + " " + f.weight).sort());
    const wanted = ["Atkinson Hyperlegible 400", "Atkinson Hyperlegible 700", "Shippori Mincho 500", "Shippori Mincho 700"];
    const missing = wanted.filter((w) => !loaded.includes(w));
    if (missing.length) throw new Error("webfonts did not load: " + missing.join(", ") + " (is the network up?)");
    const pages = await page.evaluate(() => document.querySelectorAll(".page").length);
    // let every decoded image settle before the print pass
    await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
    await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
    console.log(`wrote ${path.relative(process.cwd(), out)}: ${pages} slides`);
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
