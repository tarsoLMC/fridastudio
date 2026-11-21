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
          const card = getComputedStyle(document.querySelector(".highlight-card"));
          const photos = [...document.querySelectorAll(".cinema-story-mobile-picture img")];
          return {
            headingPx:parseFloat(heading.fontSize),
            introPx:parseFloat(intro.fontSize),
            serif:heading.fontFamily,
            highlightShadow:card.boxShadow,
            imagesLoaded:photos.filter(x=>x.complete && x.naturalWidth>0).length,
            revealVisible:[...document.querySelectorAll("[data-cinema-reveal]")].every(el=>el.classList.contains("is-visible"))
          };
        });
        assert(artDirection.headingPx >= 34 && artDirection.headingPx <= 58,"Hero typography escapes scale: "+JSON.stringify(artDirection));
        assert(artDirection.introPx >= 14 && artDirection.introPx <= 18,"Body readability: "+JSON.stringify(artDirection));
        assert(artDirection.serif.includes("Instrument Serif"),"Editorial heading font missing");
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
      for (const id of ["inicio","procedimentos","galeria","guia","estudio","visita"]) {
        assert.equal(await page.locator("#" + id).count(), 1, id);
      }
      const open = await page.locator('.mobile-dock .dock-link--booking').getAttribute("href");
      assert(open.startsWith("https://wa.me/5561995027800?text="));
    });

    await check("glass and orbit widgets are present without covering core content", async () => {
      assert.equal(await page.locator("[data-motion-orbit]").count(),2);
      assert.equal(await page.locator(".hero--cinematic h1").isVisible(),true);
      assert.equal(await page.locator("#booking-form").count(),0);
      assert.equal(await page.locator(".booking").count(),0);
      const geometry=await page.locator(".frida-hero-orbit").boundingBox();
      const hero=await page.locator(".hero-media").boundingBox();
      assert(geometry && hero && geometry.width<=hero.width*.48, "hero orbit obscures too much of mobile portrait");
    });

    await check("Frida Atelier palette is actually rendered in production components", async () => {
      const palette=await page.evaluate(()=>{
        const get=(selector,property)=>{
          const element=document.querySelector(selector);
          if(!element)throw new Error("Missing component "+selector);
          return getComputedStyle(element)[property];
        };
        return {
          body:get("body","backgroundColor"),
          primaryBg:get(".button-primary","backgroundColor"),
          primaryFg:get(".button-primary","color"),
          catalogBg:get(".catalog","backgroundColor"),
          panelBg:get(".catalog-panel","backgroundColor"),
          selectedBg:get(".catalog-tab.is-active","backgroundColor"),
          selectedBorder:get(".catalog-tab.is-active","borderTopColor"),
          guideFormBg:get(".guide-form","backgroundColor"),
          galleryBg:get(".gallery","backgroundColor"),
          serviceButtonFg:get(".service-view","color"),
          serviceButtonBg:get(".service-view","backgroundColor")
        };
      });
      const expected={
        body:"rgb(248, 245, 240)",
        primaryBg:"rgb(96, 55, 72)",
        primaryFg:"rgb(255, 253, 252)",
        catalogBg:"rgb(248, 245, 240)",
        panelBg:"rgb(255, 253, 252)",
        selectedBg:"rgb(238, 221, 224)",
        selectedBorder:"rgb(96, 55, 72)",
        guideFormBg:"rgb(255, 253, 252)",
        galleryBg:"rgb(237, 231, 227)",
        serviceButtonFg:"rgb(255, 253, 252)",
        serviceButtonBg:"rgb(96, 55, 72)"
      };
      assert.deepEqual(palette,expected,"Rendered component palette drifts from Frida Atelier");
      const rgba=text=>[...text.matchAll(/[\d.]+/g)].slice(0,3).map(x=>+x[0]);
      const lum=color=>{
        const [r,g,b]=rgba(color).map(x=>{const y=x/255;return y<=.04045?y/12.92:((y+.055)/1.055)**2.4});
        return .2126*r+.7152*g+.0722*b;
      };
      const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
      assert(contrast(palette.primaryBg,palette.primaryFg)>=4.5);
      assert(contrast(palette.serviceButtonBg,palette.serviceButtonFg)>=4.5);
      await page.locator("#procedimentos").screenshot({path:artifactDir+"/atelier-catalog-390.png",animations:"disabled"});
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

    await check("service catalog keeps 12 dossiers without redundant shortcut panel", async () => {
      assert.equal(await page.locator("[data-service-intents]").count(),0);
      assert.equal(await page.locator(".section-heading:has(#catalog-title)").count(),0);
      assert.equal(await page.locator("#catalog-title").count(),1);
      assert.equal(await page.locator(".catalog-tab").count(),5);
      assert.equal(await page.locator(".service-view").count(),12);
      assert.equal(await page.locator("#service-dialog").evaluate(el=>el.open),false);
    });

    await check("service category switches and opens illustrated dossier", async () => {
      await page.locator("#tab-cilios").click();
      await page.locator('#categoria-cilios .service-view[aria-label="Conhecer Lash Lifting"]').click();
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

    await check("service CTA opens contextual WhatsApp with no extra form", async () => {
      const url=await page.locator("[data-service-book]").getAttribute("href");
      assert(new URL(url).searchParams.get("text").includes("Lash Lifting"));
      await page.locator("[data-service-book]").evaluate(el=>{
        el.addEventListener("click",event=>event.preventDefault(),{once:true});
        el.click();
      });
      assert.equal(await page.locator("#service-dialog").evaluate(el=>el.open),false);
      assert.equal(await page.locator("[data-service-selection-name]").innerText(),"Lash Lifting");
      const selectedURL=await page.locator("[data-service-selection-book]").getAttribute("href");
      assert(new URL(selectedURL).searchParams.get("text").includes("Lash Lifting"));
    });

    await check("service detail opens directly from category and Escape closes", async () => {
      await page.locator("#tab-sobrancelhas").click();
      await page.locator('#categoria-sobrancelhas .service-view[aria-label="Conhecer Brow Lamination"]').click();
      assert.equal(await page.locator("[data-service-title]").innerText(),"Brow Lamination");
      assert((await page.locator("[data-service-book]").getAttribute("href")).includes("wa.me/5561995027800"));
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#service-dialog").evaluate(el=>el.open),false);
    });

    await check("service selection can be cleared without losing catalogue", async () => {
      await page.locator("[data-service-change]").click();
      assert.equal(await page.locator("[data-service-selection]").isVisible(),false);
      assert.equal(await page.locator(".service-view").count(),12);
    });

    await check("highlight photo opens corresponding service without extra search", async () => {
      await page.locator('.highlight-card[href="#categoria-labios"]').click();
      assert.equal(await page.locator("#service-dialog").evaluate(el=>el.open),true);
      assert.equal(await page.locator("[data-service-title]").innerText(),"Hydra Gloss");
      assert.equal(await page.locator("#categoria-labios").isVisible(),true);
      await page.locator("[data-service-close]").click();
    });

    await check("guide: single preference leads straight to green WhatsApp", async () => {
      await page.locator('.guide-choice--area:has(input[value="brows"])').click();
      await page.locator('[data-guide-step="area"] [data-guide-next]').click();
      assert.equal(await page.locator('[data-guide-step="goal"]').isVisible(),true);
      await page.locator('#guide-goals .guide-choice').first().click();
      await page.locator('[data-guide-step="goal"] [data-guide-next]').click();
      assert.equal(await page.locator('[data-guide-step="result"]').isVisible(),true);
      assert.deepEqual(await page.locator("[data-guide-picks] li strong").allInnerTexts(),["Design de sobrancelhas"]);
      const cta=page.locator("[data-guide-whatsapp]");
      assert.equal(await cta.innerText(),"Agendar no WhatsApp");
      const actualColor=await cta.evaluate(el=>({bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el).color}));
      assert.deepEqual(actualColor,{bg:"rgb(8, 117, 71)",fg:"rgb(255, 253, 252)"});
      assert.equal(await page.locator("[data-guide-to-booking]").count(),0);
      const url=await cta.getAttribute("href");
      assert(new URL(url).searchParams.get("text").includes("Definir o formato: Design de sobrancelhas"));
      const contactY=await page.locator(".guide-result-contact").evaluate(el=>el.getBoundingClientRect().top);
      const listY=await page.locator("[data-guide-picks]").evaluate(el=>el.getBoundingClientRect().top);
      assert(contactY<listY,"Primary WhatsApp CTA must appear before the results list");
    });

    await check("guide: lashes skips redundant question", async () => {
      await page.locator("[data-guide-reset]").click();
      await page.locator('.guide-choice--area:has(input[value="lashes"])').click();
      await page.locator('[data-guide-step="area"] [data-guide-next]').click();
      assert.equal(await page.locator('[data-guide-step="result"]').isVisible(),true);
      assert.deepEqual(await page.locator("[data-guide-picks] li strong").allInnerTexts(),["Lash Lifting"]);
    });

    await check("Guide Frida supports three care areas in one choice", async () => {
      await page.locator("[data-guide-reset]").click();
      assert.equal(await page.locator('[data-guide-step="area"] [data-guide-next]').isDisabled(),true);
      await page.locator('.guide-choice--area:has(input[value="brows"])').click();
      await page.locator('.guide-choice--area:has(input[value="lashes"])').click();
      await page.locator('.guide-choice--area:has(input[value="lips"])').click();
      assert.equal(await page.locator('#guide-form input[name="area"]:checked').count(),3);
      assert((await page.locator("[data-guide-area-summary]").innerText()).includes("3 áreas"));
      await page.locator("#guide-form").screenshot({path:artifactDir+"/guide-multi-areas-390.png",animations:"disabled"});
      await page.locator('[data-guide-step="area"] [data-guide-next]').click();
      assert.equal(await page.locator('[data-guide-step="goal"]').isVisible(),true);
      assert.equal(await page.locator("[data-goal-area]").count(),2);
      assert.equal(await page.locator('[data-goal-area="brows"] input:checked').count(),0);
      assert.equal(await page.locator('[data-goal-area="lips"] input:checked').count(),0);
      assert.equal(await page.locator('[data-goal-area="brows"] input[type="checkbox"]').count(),4);
      assert.equal(await page.locator('[data-goal-area="lips"] input[type="checkbox"]').count(),2);
    });

    await check("multi-care result lists every procedure and WhatsApp preserves all", async () => {
      await page.locator('[data-goal-area="brows"] input[value="2"]').check();
      await page.locator('[data-goal-area="lips"] input[value="1"]').check();
      await page.locator('[data-guide-step="goal"] [data-guide-next]').click();
      assert.equal(await page.locator('[data-guide-step="result"]').isVisible(),true);
      assert.equal(await page.locator("[data-guide-picks] li").count(),3);
      const recommendations=await page.locator("[data-guide-picks] li strong").allInnerTexts();
      assert.deepEqual(recommendations,["Nano Fios","Lash Lifting","Nano Lips"]);
      await page.locator("#guide-form").screenshot({path:artifactDir+"/guide-multi-result-390.png",animations:"disabled"});
      const url=await page.locator("[data-guide-whatsapp]").getAttribute("href");
      const text=new URL(url).searchParams.get("text");
      for(const name of recommendations)assert(text.includes(name),"Missing care in guide message: "+name);
      assert(text.includes("Preencher falhas"));
      assert(text.includes("Realçar a cor"));
      assert(text.includes("Áreas de interesse:"));
      assert.equal(await page.locator("[data-guide-to-booking]").count(),0);
    });



    await check("two single-procedure areas skip the redundant preferences step", async () => {
      await page.locator("[data-guide-reset]").click();
      await page.locator('.guide-choice--area:has(input[value="lashes"])').click();
      await page.locator('.guide-choice--area:has(input[value="face"])').click();
      await page.locator('[data-guide-step="area"] [data-guide-next]').click();
      assert.equal(await page.locator('[data-guide-step="result"]').isVisible(),true);
      assert.equal(await page.locator("[data-guide-picks] li").count(),2);
      assert.deepEqual(await page.locator("[data-guide-picks] li strong").allInnerTexts(),["Lash Lifting","Epilação facial"]);
      await page.locator("[data-guide-reset]").click();
      assert.equal(await page.locator('#guide-form input[name="area"]:checked').count(),0);
      assert.equal(await page.locator('[data-guide-step="area"] [data-guide-next]').isDisabled(),true);
    });

    await check("Guide Frida supports multiple preferences within the same area", async () => {
      await page.locator('.guide-choice--area:has(input[value="brows"])').click();
      await page.locator('.guide-choice--area:has(input[value="makeup"])').click();
      await page.locator('[data-guide-step="area"] [data-guide-next]').click();
      assert.equal(await page.locator("[data-goal-area]").count(),2);
      await page.locator('[data-goal-area="brows"] input[value="0"]').check();
      await page.locator('[data-goal-area="brows"] input[value="2"]').check();
      await page.locator('[data-goal-area="makeup"] input[value="0"]').check();
      await page.locator('[data-goal-area="makeup"] input[value="1"]').check();
      assert.equal(await page.locator('[data-goal-area="brows"] input:checked').count(),2);
      assert.equal(await page.locator('[data-goal-area="makeup"] input:checked').count(),2);
      await page.locator('[data-guide-step="goal"] [data-guide-next]').click();
      const names=await page.locator("[data-guide-picks] li strong").allInnerTexts();
      assert.deepEqual(names,["Design de sobrancelhas","Nano Fios","Maquiagem Social","Maquiagem Express"]);
      const message=new URL(await page.locator("[data-guide-whatsapp]").getAttribute("href")).searchParams.get("text");
      for(const name of names) assert(message.includes(name),"Missing: "+name);
      for(const preference of ["Definir o formato","Preencher falhas","Para uma ocasião","Uma produção rápida"]) assert(message.includes(preference));
      await page.locator("#guide-form").screenshot({path:artifactDir+"/guide-direct-whatsapp-390.png",animations:"disabled"});
    });

    await check("Guide Frida can return and keep multiple preference choices", async () => {
      await page.locator("[data-guide-reset]").click();
      await page.locator('.guide-choice--area:has(input[value="lips"])').click();
      await page.locator('[data-guide-step="area"] [data-guide-next]').click();
      await page.locator('[data-goal-area="lips"] input[value="0"]').check();
      await page.locator("[data-guide-back]").click();
      await page.locator('[data-guide-step="area"] [data-guide-next]').click();
      assert.equal(await page.locator('[data-goal-area="lips"] input[value="0"]').isChecked(),true);
      await page.locator('[data-guide-step="goal"] [data-guide-next]').click();
      assert.deepEqual(await page.locator("[data-guide-picks] li strong").allInnerTexts(),["Hydra Gloss"]);
    });

    await check("Guide Frida asks for orientation when no technique is picked", async () => {
      await page.locator("[data-guide-reset]").click();
      await page.locator('.guide-choice--area:has(input[value="lips"])').click();
      await page.locator('[data-guide-step="area"] [data-guide-next]').click();
      await page.locator('[data-guide-step="goal"] [data-guide-next]').click();
      assert.deepEqual(await page.locator("[data-guide-picks] li strong").allInnerTexts(),["Orientação para Lábios"]);
      const message=new URL(await page.locator("[data-guide-whatsapp]").getAttribute("href")).searchParams.get("text");
      assert(message.includes("Lábios: preciso de orientação"));
      assert(!message.includes("Hydra Gloss"),"No invented procedure without preference");
      await page.locator("[data-guide-reset]").click();
    });





    await check("all calls to action bypass the removed form", async () => {
      assert.equal(await page.locator("#booking-form,.booking,#booking-procedure,[data-booking-lens]").count(),0);
      assert.equal(await page.locator('a[href="#agendamento"]').count(),0);
      for (const selector of [
        "[data-service-selection-book]",
        "[data-service-book]",
        ".gallery-heading .text-link",
        ".mobile-dock .dock-link--booking"
      ]) {
        const href=await page.locator(selector).getAttribute("href");
        assert(href.startsWith("https://wa.me/5561995027800"),selector+" does not link to WhatsApp");
      }
      assert(!(await page.locator(".faq-list").innerText()).includes("formulário rápido"));
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

  await check("mobile horizontal collections explain swipe and move with controls", async () => {
    const mobile=await browser.newPage({viewport:{width:390,height:844}});
    try {
      const response=await mobile.goto(baseURL,{waitUntil:"domcontentloaded"});
      assert.equal(response?.status(),200);
      const highlight=mobile.locator('[data-rail-guide="highlights-rail"]');
      const categories=mobile.locator('[data-rail-guide="catalog-tabs"]');
      await highlight.waitFor({state:"visible"});
      await categories.waitFor({state:"visible"});
      assert.equal(await highlight.locator("[data-rail-instruction-text]").innerText(),"Deslize para ver mais");
      assert.equal(await categories.locator("[data-rail-instruction-text]").innerText(),"Deslize para ver mais");
      assert.equal(await highlight.locator("[data-rail-total]").innerText(),"04");
      assert.equal(await categories.locator("[data-rail-total]").innerText(),"05");
      assert.equal(await highlight.locator("[data-rail-prev]").isDisabled(),true);
      assert.equal(await categories.locator("[data-rail-next]").isEnabled(),true);
      await highlight.locator("[data-rail-next]").click();
      await mobile.waitForFunction(()=>document.querySelector('[data-rail-guide="highlights-rail"] [data-rail-current]').textContent.trim()!=="01");
      assert.equal(await highlight.locator("[data-rail-prev]").isEnabled(),true);
      assert.notEqual(await highlight.locator("[data-rail-current]").innerText(),"01");
      const indicatorWidth=await highlight.locator("[data-rail-fill]").evaluate(el=>parseFloat(el.style.width));
      assert(indicatorWidth>25,"Progress indicator should follow swipe");
      await mobile.locator(".highlights").screenshot({path:artifactDir+"/mobile-swipe-discovery-390.png",animations:"disabled"});
    } finally {await mobile.close();}
  });

  await check("catalog category rail and panel remain linked after horizontal scrolling", async () => {
    const mobile=await browser.newPage({viewport:{width:390,height:844}});
    try {
      await mobile.goto(baseURL,{waitUntil:"domcontentloaded"});
      const guide=mobile.locator('[data-rail-guide="catalog-tabs"]');
      await guide.waitFor({state:"visible"});
      await guide.locator("[data-rail-next]").click();
      await mobile.waitForFunction(()=>document.getElementById("catalog-tabs").scrollLeft>20);
      await mobile.locator("#tab-face").click();
      assert.equal(await mobile.locator("#tab-face").getAttribute("aria-selected"),"true");
      assert.equal(await mobile.locator("#categoria-face").isVisible(),true);
      await mobile.locator("#tab-sobrancelhas").click();
      assert.equal(await mobile.locator("#categoria-sobrancelhas").isVisible(),true);
      assert.equal(await mobile.locator('[data-rail-guide="catalog-tabs"] [data-rail-total]').innerText(),"05");
      const data=await mobile.evaluate(()=>({vw:innerWidth,documentWidth:document.documentElement.scrollWidth}));
      assert(data.documentWidth<=data.vw+2,"Global overflow from carousel UI");
      await mobile.locator("#procedimentos").screenshot({path:artifactDir+"/mobile-categories-discovery-390.png",animations:"disabled"});
    } finally {await mobile.close();}
  });

  await check("horizontal guides disappear when collections fit, and respect reduced motion", async () => {
    const desktop=await browser.newPage({viewport:{width:1440,height:900}});
    const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
    try {
      await desktop.goto(baseURL,{waitUntil:"domcontentloaded"});
      assert.equal(await desktop.locator('[data-rail-guide="highlights-rail"]').isVisible(),false);
      assert.equal(await desktop.locator('[data-rail-guide="catalog-tabs"]').isVisible(),false);
      await reduced.goto(baseURL,{waitUntil:"domcontentloaded"});
      const guide=reduced.locator('[data-rail-guide="highlights-rail"]');
      await guide.waitFor({state:"visible"});
      await guide.locator("[data-rail-next]").click();
      await reduced.waitForFunction(()=>document.getElementById("highlights-rail").scrollLeft>30);
      assert.notEqual(await guide.locator("[data-rail-current]").innerText(),"01");
      const duration=await guide.locator("[data-rail-fill]").evaluate(el=>getComputedStyle(el).transitionDuration);
      assert(duration==="0s","Progress animation should stop for reduced motion: "+duration);
    } finally {await desktop.close();await reduced.close();}
  });

  for (const width of [390, 1440]) {
    await check("Frida Atelier isolated visual prototype " + width + "px", async () => {
      const page = await browser.newPage({viewport:{width,height:850}});
      const jsErrors = [];
      page.on("pageerror", e => jsErrors.push(e.message));
      try {
        const address = new URL("design-system/",baseURL).toString();
        const response = await page.goto(address,{waitUntil:"networkidle"});
        assert.equal(response?.status(),200,"Design System preview must be served");
        assert.equal(await page.locator("body[data-fd-preview]").count(),1);
        assert.equal(await page.locator(".fd-swatch").count(),6);
        assert.equal(await page.locator(".fd-chip").count(),3);
        assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"),"noindex,nofollow");
        const style=await page.evaluate(()=>{
          const a=getComputedStyle(document.body);
          const b=getComputedStyle(document.querySelector(".fd-button--primary"));
          const max=document.documentElement.scrollWidth;
          return {bg:a.backgroundColor,btn:b.backgroundColor,fg:b.color,width:innerWidth,doc:max};
        });
        assert.equal(style.bg,"rgb(248, 245, 240)");
        assert.equal(style.btn,"rgb(96, 55, 72)");
        assert.equal(style.fg,"rgb(255, 253, 252)");
        assert(style.doc<=style.width+2,"Prototype horizontal overflow: "+JSON.stringify(style));
        await page.locator('[data-fd-service="Hydra Gloss"]').click();
        assert.equal(await page.locator('[data-fd-service="Hydra Gloss"]').getAttribute("aria-pressed"),"true");
        assert.equal(await page.locator('[data-fd-service="Design de sobrancelhas"]').getAttribute("aria-pressed"),"false");
        assert.equal(await page.locator("[data-fd-selected-name]").innerText(),"Hydra Gloss");
        assert.equal(await page.locator("[data-fd-preview-select]").inputValue(),"Hydra Gloss");
        await page.locator("[data-fd-preview-action]").click();
        assert((await page.locator("[data-fd-message-preview]").innerText()).includes("Hydra Gloss"));
        assert(!jsErrors.length,"Preview page errors: "+jsErrors.join(" | "));
        await page.screenshot({path:artifactDir + "/design-system-" + width + ".png",fullPage:true,animations:"disabled"});
      } finally {await page.close();}
    });
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
