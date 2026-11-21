/**
 * Frida Studio V3.2 — actual-browser smoke and responsive QA.
 * Run against a local static server: FRIDA_TEST_URL=http://127.0.0.1:4173 node tests/browser-smoke.mjs
 * Only read-only actions: never sends a WhatsApp message or submits reservations.
 */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseURL = process.env.FRIDA_TEST_URL || "http://127.0.0.1:4173";
const widths = [320, 375, 390, 600, 768, 1024, 1440];
const errors = [];
const report = [];
const artifactDir = "artifacts/frida-qa";
await mkdir(artifactDir, { recursive:true });

const browser = await chromium.launch({ headless:true });
async function check(name, action) {
  try {
    await action();
    report.push({ name, status:"PASS" });
    process.stdout.write("PASS " + name + "\n");
  } catch (error) {
    errors.push({ name, error:error.stack || String(error) });
    report.push({ name, status:"FAIL", error:String(error.message || error) });
    process.stderr.write("FAIL " + name + ": " + String(error.message || error) + "\n");
  }
}

try {
  for (const width of widths) {
    await check("responsive " + width + "px", async () => {
      const page = await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      try {
        const response = await page.goto(baseURL, { waitUntil:"domcontentloaded", timeout:30000 });
        assert.equal(response?.status(), 200, "home status should be 200");
        await page.locator(".hero--cinematic").waitFor({state:"visible"});
        await page.locator("#booking-form").waitFor({state:"visible"});
        await page.locator("#guide-form").waitFor({state:"visible"});

        const metrics = await page.evaluate(() => ({
          viewport:window.innerWidth,
          docWidth:document.documentElement.scrollWidth,
          h1s:document.querySelectorAll("h1").length,
          dockDisplay:getComputedStyle(document.querySelector(".mobile-dock")).display,
          storyMediaDisplay:getComputedStyle(document.querySelector(".cinema-story-media")).display,
          storyLayout:getComputedStyle(document.querySelector(".cinema-story-layout")).gridTemplateColumns,
          manifesto:getComputedStyle(document.querySelector(".cinema-manifesto")).minHeight
        }));
        assert.equal(metrics.h1s, 1, "expected one H1");
        assert(metrics.docWidth <= metrics.viewport + 2, "horizontal overflow: " + JSON.stringify(metrics));
        assert.equal(metrics.dockDisplay !== "none", width <= 600, "mobile dock visibility");
        assert.equal(metrics.storyMediaDisplay === "none", width <= 760, "story desktop frame should be hidden on mobile");
        assert.equal(pageErrors.length, 0, "uncaught page exceptions: " + pageErrors.join(" | "));
        // Emulate natural reading before full-page capture: trigger lazy images and reveal chapters.
        await page.evaluate(async () => {
          const images = Array.from(document.querySelectorAll('img[loading="lazy"]'));
          images.forEach((img) => { img.loading = "eager"; });
          // Avoid CSS scroll-behavior:smooth masking intersections in headless QA.
          const previousBehavior = document.documentElement.style.scrollBehavior;
          document.documentElement.style.scrollBehavior = "auto";
          const total = document.documentElement.scrollHeight;
          const step = Math.max(350, Math.floor(window.innerHeight * .78));
          for (let y = 0; y <= total; y += step) {
            window.scrollTo({top:y, behavior:"instant"});
            await new Promise((resolve) => setTimeout(resolve, 55));
          }
          // Make sure both narrative reveals actually intersect the viewport.
          for (const reveal of document.querySelectorAll("[data-cinema-reveal]")) {
            reveal.scrollIntoView({behavior:"instant", block:"center"});
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          await Promise.all(Array.from(document.images).map((img) => img.decode().catch(() => {})));
          window.scrollTo({top:0, behavior:"instant"});
          document.documentElement.style.scrollBehavior = previousBehavior;
          await new Promise((resolve) => setTimeout(resolve, 100));
        });
        const artDirection = await page.evaluate(() => {
          const heading = getComputedStyle(document.querySelector(".hero--cinematic h1"));
          const intro = getComputedStyle(document.querySelector(".hero--cinematic .hero-intro"));
          const booking = getComputedStyle(document.querySelector(".booking"));
          const form = getComputedStyle(document.querySelector(".booking-card"));
          const card = getComputedStyle(document.querySelector(".highlight-card"));
          const photos = [...document.querySelectorAll(".cinema-story-mobile-picture img")];
          return {
            headingPx:parseFloat(heading.fontSize),
            introPx:parseFloat(intro.fontSize),
            serif:heading.fontFamily,
            bookingBackground:booking.backgroundImage,
            formBackground:form.backgroundColor,
            highlightShadow:card.boxShadow,
            imagesLoaded:photos.filter(x=>x.complete && x.naturalWidth>0).length,
            revealVisible:[...document.querySelectorAll("[data-cinema-reveal]")].every(el=>el.classList.contains("is-visible"))
          };
        });
        assert(artDirection.headingPx >= 34 && artDirection.headingPx <= 58,"Hero typography escapes scale: "+JSON.stringify(artDirection));
        assert(artDirection.introPx >= 14 && artDirection.introPx <= 18,"Body readability: "+JSON.stringify(artDirection));
        assert(artDirection.serif.includes("Instrument Serif"),"Editorial heading font missing");
        assert(artDirection.bookingBackground.includes("linear-gradient"),"Distinct booking section should be deep plum");
        assert.equal(artDirection.formBackground, "rgb(255, 252, 250)","Booking form should have solid ivory");
        assert(artDirection.imagesLoaded===3,"Story images were not loaded before screenshot");
        assert(artDirection.revealVisible,"Editorial story reveal did not become visible after scrolling");
        await page.screenshot({path:artifactDir + "/frida-" + width + ".png",fullPage:true,animations:"disabled"});
      } finally {
        await page.close();
      }
    });
  }

  const page = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  page.on("pageerror", (error) => errors.push({name:"interactive page exception",error:error.message}));
  try {
    await page.goto(baseURL, {waitUntil:"domcontentloaded"});
    await check("navigation structure", async () => {
      assert.equal(await page.locator(".mobile-dock .dock-link").count(), 5);
      for (const id of ["inicio","procedimentos","galeria","guia","agendamento","estudio","visita"]) {
        assert.equal(await page.locator("#" + id).count(), 1, id);
      }
      const open = await page.locator('.mobile-dock .dock-link--booking').getAttribute("href");
      assert(open.startsWith("https://wa.me/5561995027800?text="));
    });

    await check("glass and orbit widgets are present without covering core content", async () => {
      assert.equal(await page.locator("[data-motion-orbit]").count(),2);
      assert.equal(await page.locator("[data-booking-lens]").count(),1);
      assert.equal(await page.locator("[data-booking-lens-choice]").innerText(),"Seu ritual, no seu tempo");
      assert.equal(await page.locator(".hero--cinematic h1").isVisible(),true);
      assert.equal(await page.locator("#booking-form").isVisible(),true);
      const geometry=await page.locator(".frida-hero-orbit").boundingBox();
      const hero=await page.locator(".hero-media").boundingBox();
      assert(geometry && hero && geometry.width<=hero.width*.48, "hero orbit obscures too much of mobile portrait");
    });

    await check("gallery category filters", async () => {
      await page.locator('[data-gallery-filter="cilios"]').click();
      assert.equal(await page.locator('[data-gallery-item]:not([hidden])').count(),1);
      assert.equal(await page.locator('[data-gallery-filter="cilios"]').getAttribute("aria-pressed"),"true");
      await page.locator('[data-gallery-filter="todas"]').click();
      assert.equal(await page.locator('[data-gallery-item]:not([hidden])').count(),5);
    });

    await check("gallery lightbox and keyboard Escape", async () => {
      await page.locator("[data-gallery-item]").first().click();
      assert.equal(await page.locator("#gallery-dialog").evaluate(el=>el.open),true);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#gallery-dialog").evaluate(el=>el.open),false);
      await page.locator("[data-gallery-item]").nth(1).click();
      await page.locator("[data-gallery-close]").click();
      assert.equal(await page.locator("#gallery-dialog").evaluate(el=>el.open),false);
    });

    await check("gallery results are not invented", async () => {
      assert.equal(await page.locator("[data-gallery-comparisons]").isVisible(),false);
      assert(await page.locator(".gallery-disclaimer").innerText().then(t=>t.includes("ilustrativas")));
    });

    await check("service explorer: 12 dossier buttons, eight goal shortcuts", async () => {
      await page.locator("[data-service-intents]").waitFor({state:"visible"});
      assert.equal(await page.locator("[data-service-intent]").count(),8);
      assert.equal(await page.locator(".service-view").count(),12);
      assert.equal(await page.locator("#service-dialog").evaluate(el=>el.open),false);
    });

    await check("service intent switches category and opens illustrated sheet", async () => {
      await page.locator('[data-service-intent="Lash Lifting"]').click();
      assert.equal(await page.locator("#categoria-cilios").isVisible(),true);
      assert.equal(await page.locator("#service-dialog").evaluate(el=>el.open),true);
      assert.equal(await page.locator("[data-service-title]").innerText(),"Lash Lifting");
      assert((await page.locator("[data-service-description]").innerText()).includes("cílios naturais"));
      assert((await page.locator("[data-service-image]").getAttribute("src")).endsWith("/cilios.webp"));
      assert((await page.locator(".service-dialog-disclaimer").innerText()).includes("valores"));
      const bounds=await page.locator("#service-dialog").boundingBox();
      const viewport=page.viewportSize();
      assert(bounds && viewport && bounds.x>=-1 && bounds.x+bounds.width<=viewport.width+1,"Service sheet overflows horizontally");
      await page.screenshot({path:artifactDir + "/service-sheet-390.png",animations:"disabled"});
    });

    await check("service chooser preselects correct procedure and WhatsApp", async () => {
      await page.locator("[data-service-book]").click();
      assert.equal(await page.locator("#service-dialog").evaluate(el=>el.open),false);
      assert.equal(await page.locator("#booking-procedure").inputValue(),"Lash Lifting");
      assert.equal(await page.locator("[data-service-selection-name]").innerText(),"Lash Lifting");
      const url=await page.locator("[data-booking-link]").getAttribute("href");
      assert(new URL(url).searchParams.get("text").includes("Lash Lifting"));
    });

    await check("service detail opens directly from category and Escape closes", async () => {
      await page.locator("#tab-sobrancelhas").click();
      await page.locator('#categoria-sobrancelhas .service-view[aria-label="Conhecer Brow Lamination"]').click();
      assert.equal(await page.locator("[data-service-title]").innerText(),"Brow Lamination");
      assert((await page.locator("[data-service-whatsapp]").getAttribute("href")).includes("wa.me/5561995027800"));
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#service-dialog").evaluate(el=>el.open),false);
    });

    await check("service selection can be cleared without losing catalogue", async () => {
      await page.locator("[data-service-change]").click();
      assert.equal(await page.locator("[data-service-selection]").isVisible(),false);
      assert.equal(await page.locator("#booking-procedure").inputValue(),"");
      assert.equal(await page.locator(".service-view").count(),12);
    });

    await check("highlight photo opens corresponding service without extra search", async () => {
      await page.locator('.highlight-card[href="#categoria-labios"]').click();
      assert.equal(await page.locator("#service-dialog").evaluate(el=>el.open),true);
      assert.equal(await page.locator("[data-service-title]").innerText(),"Hydra Gloss");
      assert.equal(await page.locator("#categoria-labios").isVisible(),true);
      await page.locator("[data-service-close]").click();
    });

    await check("guide: brows two steps and booking handoff", async () => {
      await page.locator('.guide-choice--area:has(input[value="brows"])').click();
      await page.locator('[data-guide-step="area"] [data-guide-next]').click();
      assert.equal(await page.locator('[data-guide-step="goal"]').isVisible(),true);
      await page.locator('#guide-goals .guide-choice').first().click();
      await page.locator('[data-guide-step="goal"] [data-guide-next]').click();
      assert.equal(await page.locator('[data-guide-step="result"]').isVisible(),true);
      assert((await page.locator("[data-guide-title]").innerText()).includes("Design"));
      await page.locator("[data-guide-to-booking]").click();
      assert.equal(await page.locator("#booking-procedure").inputValue(),"Design de sobrancelhas");
      assert.equal(await page.locator("[data-service-selection-name]").innerText(),"Design de sobrancelhas");
    });

    await check("guide: lashes skips redundant question", async () => {
      await page.locator("[data-guide-reset]").click();
      await page.locator('.guide-choice--area:has(input[value="lashes"])').click();
      await page.locator('[data-guide-step="area"] [data-guide-next]').click();
      assert.equal(await page.locator('[data-guide-step="result"]').isVisible(),true);
      assert((await page.locator("[data-guide-title]").innerText()).includes("Lash Lifting"));
    });

    await check("booking WhatsApp URL with selected service/date/time", async () => {
      await page.locator("#booking-procedure").selectOption("Hydra Gloss");
      await page.locator('.booking-period-options label:has(input[value="Tarde"])').click();
      await page.locator("#booking-date").fill("2030-01-22");
      const href = await page.locator("[data-booking-link]").getAttribute("href");
      const text = new URL(href).searchParams.get("text");
      assert(text.includes("Hydra Gloss"));
      assert(text.includes("Tarde"));
      assert(text.includes("22/01/2030"));
      assert(text.includes("disponibilidade e valores"));
      assert.equal(await page.locator("[data-booking-lens-choice]").innerText(),"Hydra Gloss");
      assert((await page.locator("[data-booking-lens-period]").innerText()).includes("tarde"));
      assert.equal(await page.locator("[data-booking-lens]").getAttribute("data-has-choice"),"true");
    });

    await check("glass booking lens resets with the actual service choice", async () => {
      await page.locator("#booking-procedure").selectOption("");
      assert.equal(await page.locator("[data-booking-lens-choice]").innerText(),"Seu ritual, no seu tempo");
      assert.equal(await page.locator("[data-booking-lens]").getAttribute("data-has-choice"),"false");
    });

    await check("cinematic story chapter keyboard switching", async () => {
      const steps = page.locator("[data-cinema-step]");
      assert.equal(await steps.count(),3);
      await steps.nth(2).focus();
      assert.equal(await page.locator("[data-cinema-frame].is-active").count(),1);
      assert((await page.locator("[data-cinema-counter]").innerText()).includes("03 / 03"));
      assert.equal(await page.locator("[data-orbit-chapter]").innerText(),"03");
    });

    await check("local image URLs return success", async () => {
      const imagePaths = await page.locator('img[src^="assets/images/"]').evaluateAll(imgs=>[...new Set(imgs.map(el=>el.getAttribute("src")))]);
      assert(imagePaths.length >= 7);
      for (const file of imagePaths) {
        const response = await page.request.get(new URL(file,baseURL).toString());
        assert(response.ok(),file + " returned " + response.status());
        assert((response.headers()["content-type"]||"").startsWith("image/"),file + " not served as image");
      }
    });
  } finally {
    await page.close();
  }

  await check("reduced motion has no hidden cinematic text", async () => {
    const page = await browser.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
    try {
      await page.goto(baseURL,{waitUntil:"domcontentloaded"});
      assert.equal(await page.locator("html.cinema-motion").count(),0);
      assert.equal(await page.locator(".cinema-manifesto-content").isVisible(),true);
      assert.equal(await page.locator(".cinema-story-step").count(),3);
      assert.equal(await page.locator(".cinema-story-mobile-picture").first().isVisible(),true);
      const orbiter=await page.locator(".frida-orbit-track--outer").evaluate(el=>getComputedStyle(el).animationName);
      assert.equal(orbiter,"none","reduced-motion users must not see orbital rotation");
      assert.equal(await page.locator("[data-motion-orbit].is-orbit-active").count(),0);
    } finally { await page.close(); }
  });
} finally {
  await browser.close();
  await writeFile(artifactDir + "/report.json", JSON.stringify({
    passed:report.filter(x=>x.status==="PASS").length,
    failed:errors.length,
    total:report.length,
    checks:report,
    errors
  },null,2));
}

if (errors.length) {
  console.error("\nFRIDA QA: " + errors.length + " failure(s)");
  process.exitCode = 1;
} else console.log("\nFRIDA QA: all " + report.length + " checks passed");
