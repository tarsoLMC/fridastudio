/* WebKit (Safari engine) visual/behavior regression for Frida's conversion path.
   Tests fallback border-radius, real multiple-choice handling, and WA URL content.
   Does not click external WhatsApp links or transmit personal information. */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { webkit } from "playwright";

const origin = process.env.FRIDA_TEST_URL || "http://127.0.0.1:4173/";
const output = "artifacts/frida-qa";
await mkdir(output,{recursive:true});
const browser=await webkit.launch({headless:true});
try {
  for (const width of [390,1440]) {
    const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
    const errors=[];
    page.on("pageerror",e=>errors.push(e.message));
    const response=await page.goto(origin,{waitUntil:"domcontentloaded"});
    assert.equal(response?.status(),200);
    await page.locator('#guide-form').waitFor({state:"visible"});
    await page.locator('.guide-choice--area:has(input[value="brows"])').click();
    await page.locator('.guide-choice--area:has(input[value="makeup"])').click();
    await page.locator('[data-guide-step="area"] [data-guide-next]').click();
    assert.equal(await page.locator("[data-goal-area]").count(),2);
    await page.locator('[data-goal-area="brows"] input[value="0"]').check();
    await page.locator('[data-goal-area="brows"] input[value="2"]').check();
    await page.locator('[data-goal-area="makeup"] input[value="1"]').check();
    assert.equal(await page.locator('[data-goal-area="brows"] input:checked').count(),2);
    await page.locator('[data-guide-step="goal"] [data-guide-next]').click();
    const names=await page.locator("[data-guide-picks] li strong").allInnerTexts();
    assert.deepEqual(names,["Design de sobrancelhas","Nano Fios","Maquiagem Express"]);
    const link=page.locator("[data-guide-whatsapp]");
    assert.equal(await link.innerText(),"Agendar no WhatsApp");
    const href=await link.getAttribute("href");
    assert(href.startsWith("https://wa.me/5561995027800?text="));
    const message=new URL(href).searchParams.get("text");
    for(const part of [...names,"Definir o formato","Preencher falhas","Uma produção rápida"]) {
      assert(message.includes(part),"Missing in WhatsApp handoff: "+part);
    }
    const style=await page.evaluate(()=>{
      const cta=getComputedStyle(document.querySelector(".guide-whatsapp-primary"));
      const box=getComputedStyle(document.querySelector(".guide-result-contact"));
      return {
        ctaBackground:cta.backgroundColor, ctaText:cta.color,
        innerRadius:parseFloat(cta.borderTopLeftRadius),
        outerRadius:parseFloat(box.borderTopLeftRadius),
        topCTA:document.querySelector(".guide-result-contact").getBoundingClientRect().top,
        topList:document.querySelector("[data-guide-picks]").getBoundingClientRect().top,
        documentWidth:document.documentElement.scrollWidth,
        viewportWidth:window.innerWidth,
        cssSquircleSupport:CSS.supports("corner-shape","squircle")
      };
    });
    assert.equal(style.ctaBackground,"rgb(8, 117, 71)");
    assert.equal(style.ctaText,"rgb(255, 253, 252)");
    assert(Math.abs(style.outerRadius-(style.innerRadius+12))<.7,
      "Concentric geometry must be outer=inner+12px: "+JSON.stringify(style));
    assert(style.topCTA<style.topList);
    assert(style.documentWidth<=style.viewportWidth+2,"WebKit horizontal overflow: "+JSON.stringify(style));
    assert.equal(errors.length,0,"JavaScript errors: "+errors.join(" | "));
    await page.locator("#guide-form").screenshot({path:output+"/frida-webkit-whatsapp-"+width+".png",animations:"disabled"});
    console.log("PASS WebKit "+width+"px: all choices, contrast, concentric fallback, WhatsApp link.");
    await page.close();
  }
} finally {
  await browser.close();
}
