import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:5173";
const outDir = path.join(process.cwd(), "test-results", "screenshots");
const viewports = [
  { name: "mobile-320", width: 320, height: 690 },
  { name: "mobile-360", width: 360, height: 740 },
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-393", width: 393, height: 852 },
  { name: "mobile-412", width: 412, height: 915 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-short", width: 390, height: 640 },
  { name: "mobile-landscape", width: 844, height: 390 },
  { name: "mobile-large-text", width: 390, height: 844, textScale: 1.22 }
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

const check = async (name, fn) => {
  try {
    await fn();
    results.push({ name, ok: true });
  } catch (error) {
    results.push({ name, ok: false, error: error.message });
  }
};

const warmLazyImages = async (page) => {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 420) {
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await page.waitForTimeout(55);
  }
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(80);
};

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const messages = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      messages.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`));

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  if (viewport.textScale) {
    await page.addStyleTag({ content: `html { font-size: ${viewport.textScale * 100}% !important; }` });
  }
  await warmLazyImages(page);
  await page.screenshot({ path: path.join(outDir, `${viewport.name}.png`), fullPage: true });

  await check(`${viewport.name}: body has content`, async () => {
    const text = await page.locator("body").innerText();
    if (text.trim().length < 500) throw new Error("body text is unexpectedly short");
  });

  await check(`${viewport.name}: homepage avoids internal caveat copy`, async () => {
    const text = await page.locator("main").innerText();
    const forbidden = ["Version 1", "nicht verifizierte", "Firmenbuchbeschreibung"];
    const hit = forbidden.find((phrase) => text.includes(phrase));
    if (hit) throw new Error(`found forbidden phrase: ${hit}`);
  });

  await check(`${viewport.name}: no horizontal overflow`, async () => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) throw new Error(`horizontal overflow ${overflow}px`);
  });

  await check(`${viewport.name}: hero image visible`, async () => {
    const box = await page.locator(".hero-media img").boundingBox();
    if (!box || box.width < viewport.width * 0.95 || box.height < Math.min(320, viewport.height * 0.55)) {
      throw new Error(`hero image box ${JSON.stringify(box)}`);
    }
  });

  await check(`${viewport.name}: primary actions visible`, async () => {
    const call = page.locator(".hero-actions a[href='tel:+436644638568']");
    const mail = page.locator(".hero-actions a[href='mailto:office@fermax.at']");
    if (!(await call.isVisible()) || !(await mail.isVisible())) throw new Error("hero actions missing");
  });

  await check(`${viewport.name}: active hero candidate is optimized`, async () => {
    const currentSrc = await page.locator(".hero-media img").evaluate((img) => img.currentSrc);
    if (!/hero.*\.(avif|webp)$/.test(currentSrc)) throw new Error(`unexpected hero src ${currentSrc}`);
    if (viewport.width < 700 && !currentSrc.includes("hero-mobile")) {
      throw new Error(`mobile viewport loaded desktop hero ${currentSrc}`);
    }
    if (viewport.width >= 700 && currentSrc.includes("hero-mobile")) {
      throw new Error(`desktop viewport loaded mobile hero ${currentSrc}`);
    }
  });

  await check(`${viewport.name}: project images loaded`, async () => {
    const unloaded = await page.locator(".project-gallery img, .service-layout img, .about-image img").evaluateAll((images) =>
      images
        .filter((img) => !img.complete || img.naturalWidth < 100)
        .map((img) => img.currentSrc || img.getAttribute("src"))
    );
    if (unloaded.length) throw new Error(`unloaded images: ${unloaded.join(", ")}`);
  });

  if (viewport.width < 820) {
    await check(`${viewport.name}: mobile nav toggles and closes`, async () => {
      const toggle = page.locator(".nav-toggle");
      await toggle.click();
      const nav = page.locator("#site-nav");
      if ((await nav.getAttribute("data-open")) !== "true") throw new Error("nav did not open");
      if ((await nav.getAttribute("aria-hidden")) === "true") throw new Error("nav hidden while open");
      await page.keyboard.press("Escape");
      if ((await nav.getAttribute("data-open")) !== "false") throw new Error("nav did not close on Escape");
    });

    await check(`${viewport.name}: mobile action bar visible`, async () => {
      const bar = page.locator(".mobile-action-bar");
      if (!(await bar.isVisible())) throw new Error("mobile action bar missing");
      const box = await bar.boundingBox();
      if (!box || box.height < 54) throw new Error(`mobile action bar too small: ${JSON.stringify(box)}`);
    });
  }

  await check(`${viewport.name}: console clean`, async () => {
    const relevant = messages.filter((entry) => !entry.includes("favicon"));
    if (relevant.length) throw new Error(relevant.join("; "));
  });

  await page.close();
}

const pages = [
  { path: "/", title: "FERMAX KG | Bauwerksabdichtung in Linz" },
  { path: "/impressum/", title: "Impressum | Fermax KG" },
  { path: "/datenschutz/", title: "Datenschutz | Fermax KG" }
];

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const item of pages) {
  await page.goto(`${baseUrl}${item.path}`, { waitUntil: "networkidle" });
  await check(`${item.path}: title`, async () => {
    const title = await page.title();
    if (title !== item.title) throw new Error(`got ${title}`);
  });
  await check(`${item.path}: no horizontal overflow`, async () => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) throw new Error(`horizontal overflow ${overflow}px`);
  });
}

await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
await check("jump link aligns below sticky header", async () => {
  if (await page.locator(".nav-toggle").isVisible()) {
    await page.locator(".nav-toggle").click();
  }
  await page.locator("a[href='#leistungen']").click();
  await page.waitForTimeout(250);
  const top = await page.locator("#leistungen").evaluate((node) => node.getBoundingClientRect().top);
  if (top < 62) throw new Error(`section top too high at ${top}px`);
});

await check("contact links are exact", async () => {
  const hrefs = await page.locator("a[href^='tel:'], a[href^='mailto:'], a[href*='instagram.com/fermax.dach']").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href"))
  );
  if (!hrefs.includes("tel:+436644638568")) throw new Error("phone link missing");
  if (!hrefs.includes("mailto:office@fermax.at")) throw new Error("email link missing");
  if (!hrefs.includes("https://www.instagram.com/fermax.dach/")) throw new Error("instagram link missing");
});

await check("instagram links include svg icons", async () => {
  const count = await page.locator("a[href='https://www.instagram.com/fermax.dach/'] svg").count();
  if (count < 2) throw new Error(`expected instagram svg icons, got ${count}`);
});

await check("keyboard focus reaches nav and CTAs", async () => {
  await page.keyboard.press("Home");
  for (let i = 0; i < 9; i += 1) await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.textContent || document.activeElement?.getAttribute("aria-label"));
  if (!focused || focused.trim().length === 0) throw new Error("no readable focused element");
});

await page.close();
await browser.close();

const failed = results.filter((result) => !result.ok);
console.table(results);
if (failed.length) {
  console.error(`QA failed: ${failed.length} checks`);
  process.exit(1);
}
