import { test, expect, type Page } from "playwright/test";
import { readFile } from "node:fs/promises";
import { BASE_URL } from "../stack.js";
import { connectLocal, readJson } from "./session.js";
import { watchGameScreen, watchNextLoad } from "./watch.js";

async function submit(page: Page) {
  await page.getByRole("button", { name: "Scatter These", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Confirm your scatter" })
    .getByRole("button", { name: "Scatter These", exact: true })
    .click();
  await expect(page.locator(".dock-scattered")).toBeFocused();
}
for (const kind of ["people", "options"] as const)
  for (const simple of [true, false])
    test(`${kind} lifecycle in ${simple ? "Simple view" : "3D"} opens independently and exports the latest scatter`, async ({
      browser,
      request,
    }, testInfo) => {
      test.setTimeout(120000);
      const seeded = await request.post("/api/dev/seed", {
        data: { kind, phase: "gathering" },
      });
      expect(seeded.ok()).toBe(true);
      const { feasts } = await seeded.json(),
        feast = feasts[0];
      const contexts = await Promise.all(
        [1, 2].map(() =>
          browser.newContext({ baseURL: BASE_URL, viewport: { width: 375, height: 812 } })
        )
      );
      try {
        for (const context of contexts)
          await context.addInitScript(
            (value) => localStorage.setItem("cc.view.simple", value ? "1" : "0"),
            simple
          );
        const pages = await Promise.all(contexts.map((context) => context.newPage())),
          [first, second] = pages as [Page, Page],
          errors: string[] = [],
          requests: string[] = [];
        for (const page of pages) {
          page.on("pageerror", (error) => errors.push(error.message));
          page.on("request", (value) => requests.push(value.url()));
        }
        for (const [i, page] of pages.entries()) {
          await page.goto(`/feasts/${feast.id}`);
          await connectLocal(page, i + 1);
        }
        const text = "A concrete contribution for this rehearsal.\nhttps://example.com/notes";
        const editor = first.locator(".statement-editor textarea").first();
        await editor.fill(text);
        await first
          .locator(".statement-editor")
          .first()
          .getByRole("button", { name: "Save statement" })
          .click();
        await expect(first.getByText("Saved.", { exact: true }).first()).toBeVisible();
        await expect(
          second.getByText("A concrete contribution for this rehearsal.", { exact: false })
        ).toHaveCount(0);
        await first.request.post("/api/dev/time", { data: { now: feast.gatheringEndsAt } });
        await first.goto(`/feasts/${feast.id}/read`);
        await expect(first.locator(".phone-statement")).toBeVisible();
        for (
          let i = 0;
          i < feast.targets.findIndex((t: { name: string }) => t.name === "Moss");
          i++
        )
          await first.locator(".dock-turn").last().click();
        await expect(
          first.locator(".statement-text").filter({ hasText: "A concrete contribution" })
        ).toBeVisible();
        expect(requests.some((url) => /(?:\/three\/|\/three[-.]|@react-three)/.test(url))).toBe(
          false
        );
        const screens: Awaited<ReturnType<typeof watchGameScreen>>[] = [];
        for (const [i, page] of pages.entries()) {
          await page.goto(`/feasts/${feast.id}/scatter`);
          await page
            .getByRole("button", { name: "Your critter and settings", exact: true })
            .click();
          await page.getByRole("button", { name: "Disconnect", exact: true }).click();
          await connectLocal(page, i + 1);
          if (simple) await expect(page.locator("canvas")).toHaveCount(0);
          else {
            await expect(page.locator(".game-scene .portrait-v2").first()).toBeVisible();
            await expect(page.locator("canvas")).toHaveCount(0);
          }
          // From here to the feast, any moment with no game screen, or a screen with no floor, fails.
          screens.push(await watchGameScreen(page));
          const inputs = page.locator(".focus-count input");
          await inputs.nth(0).fill("100");
          await inputs.nth(0).press("Enter");
          await submit(page);
        }
        const inputs = first.locator(".focus-count input");
        await inputs.nth(0).fill("60");
        await inputs.nth(0).press("Enter");
        await first
          .getByRole("button", {
            name: new RegExp(
              `^${(kind === "people" ? "Fern" : feast.targets[1].name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}, \\d+ crumbs?$`
            ),
          })
          .click();
        await inputs.nth(0).fill("40");
        await inputs.nth(0).press("Enter");
        await submit(first);
        const { body: updated } = await readJson<{
          ownReceipts: unknown[];
          registration: { identity: string };
        }>(first, `/api/feasts/${feast.id}`);
        expect(updated.ownReceipts).toHaveLength(2);
        await first.screenshot({ path: testInfo.outputPath("scatter-375.png"), fullPage: true });
        for (const screen of screens) expect(await screen.lapses()).toEqual([]);
        await first.request.post("/api/dev/time", { data: { now: feast.scatteringEndsAt } });
        await first.request.post("/api/dev/release-key", {
          data: { identity: updated.registration.identity },
        });
        // from the reload's first screen on its floor through the feast to the results, any lapse fails
        for (const page of pages) {
          screens.push(await watchNextLoad(page));
          await page.reload();
          await expect(page.locator("[data-result-hash]")).toBeVisible();
          const skip = page.getByRole("button", { name: "Skip to results", exact: true });
          if (await skip.isVisible()) await skip.press("Enter");
          await expect(page.getByRole("heading", { name: "Results", exact: true })).toBeFocused();
          await expect(page.locator("h1")).toHaveCount(1);
        }
        for (const screen of screens.slice(-2)) {
          expect(await screen.states()).toContain("results");
          expect(await screen.lapses()).toEqual([]);
        }
        // the page behind Why nobody can peek, from the results, comes back to them settled, without playing the feast again
        await first.getByRole("link", { name: "Why nobody can peek", exact: true }).click();
        await expect(
          first.getByRole("heading", { level: 1, name: "Why nobody can peek", exact: true })
        ).toBeFocused();
        await first.getByRole("button", { name: "Got it", exact: true }).click();
        await expect(first.getByRole("heading", { name: "Results", exact: true })).toBeFocused();
        await expect(
          first.getByRole("button", { name: "Skip to results", exact: true })
        ).toHaveCount(0);
        const hash = await first.locator("[data-result-hash]").getAttribute("data-result-hash");
        expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
        await expect(second.locator("[data-result-hash]")).toHaveAttribute(
          "data-result-hash",
          hash!
        );
        await expect(
          first
            .locator(".results-list")
            .getByText("2 of 8 scattered · 200 crumbs in all", { exact: true })
        ).toBeVisible();
        // who did not scatter is named as the burrow knows them, in an options feast too, where nobody is a critter (QA lifecycle-04)
        const unscattered = first.locator(".results-sum").filter({ hasText: "didn't scatter." });
        await expect(unscattered).toContainText("Pebble");
        await expect(unscattered).not.toContainText("0x");
        const downloadPromise = first.waitForEvent("download");
        await first.getByRole("button", { name: "Download CSV", exact: true }).click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/^feast-.+-results\.csv$/);
        const path = await download.path();
        const csv = await readFile(path!, "utf8");
        expect(csv).toContain("critter,address,crumbs,share\r\n");
        expect(csv.trim().split("\r\n")).toHaveLength(feast.targets.length + 1);
        await first.screenshot({ path: testInfo.outputPath("results-375.png"), fullPage: true });
        expect(errors).toEqual([]);
      } finally {
        for (const context of contexts) await context.close();
      }
    });
