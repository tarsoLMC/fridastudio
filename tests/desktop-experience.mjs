/** Frida Desktop V2 — browser isolation and experience contract.
 * Desktop enhancement MUST NOT load on mobile or on reduced-motion/save-data.
 * Does not send WhatsApp messages or modify account data.
 */
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";

const origin=process.env.FRIDA_TEST_URL || "http://127.0.0.1:4173/";
const output="artifacts/frida-qa";
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});

function collectDesktopAssets(page) {
  const requests=[];
  page.on("request",req=>{
    if (/\/desktop-experience\.(?:css|js)/.test(req.url())) requests.push(req.url());
  });
  return requests;
}
const widthSet=[320,390,600,768,1024];
let total=0;
try {
  for(const width of widthSet) {
    const page=await browser.newPage({viewport:{width,height:844}});
    const requests=collectDesktopAssets(page);
    try {
      const response=await page.goto(origin,{waitUntil:"networkidle"});
      assert.equal(response?.status(),200);
      assert.equal(requests.length,0,"No desktop assets should be downloaded at "+width+"px");
      assert.equal(await page.locator("html.frida-desktop-mode").count(),0,"Mobile class must never activate");
      assert.equal(await page.locator(".fd-desktop-chapters").count(),0,"No desktop rail in mobile DOM");
      assert.equal(await page.locator(".fd-desktop-revealed").count(),0,"No desktop entry animation classes");
      const metrics=await page.evaluate(()=>({
        bodyWidth:document.documentElement.scrollWidth,
        viewport:innerWidth,
        dock:getComputedStyle(document.querySelector(".mobile-dock")).display,
        rootLinks:document.querySelectorAll(".catalog-tab").length,
        guideChoices:document.querySelectorAll('#guide-form input[name="area"]').length
      }));
      assert(metrics.bodyWidth<=width+2,"Global overflow: "+JSON.stringify(metrics));
      assert.equal(metrics.rootLinks,5);
      assert.equal(metrics.guideChoices,5);
      if(width<=600)assert.notEqual(metrics.dock,"none","Original mobile dock must remain visible");
      else assert.equal(metrics.dock,"none");
      if(width===390) {
        await page.evaluate(()=>document.fonts.ready);
        await page.screenshot({path:output+"/stable1-mobile-unchanged-390.png",fullPage:true,animations:"disabled"});
      }
      console.log("PASS mobile preserved "+width+"px: no desktop resources, UI and layout retained");
      total++;
    } finally {await page.close();}
  }

  for(const width of [1100,1280,1440,1600]) {
    const page=await browser.newPage({viewport:{width,height:900}});
    const requested=collectDesktopAssets(page);
    const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    try {
      const response=await page.goto(origin,{waitUntil:"domcontentloaded"});
      assert.equal(response?.status(),200);
      await page.waitForFunction(()=>document.documentElement.classList.contains("frida-desktop-mode"));
      assert.equal(requested.filter(x=>x.includes("desktop-experience.css")).length,1);
      assert.equal(requested.filter(x=>x.includes("desktop-experience.js")).length,1);
      assert.equal(await page.locator(".fd-desktop-chapter").count(),7);
      const chapterDisplay=await page.locator(".fd-desktop-chapters").evaluate(el=>getComputedStyle(el).display);
      assert.equal(chapterDisplay,width>=1360?"grid":"none");
      const hero=page.locator(".hero--cinematic .hero-media");
      await hero.scrollIntoViewIfNeeded();
      const b=await hero.boundingBox();
      assert(b&&b.width>0);
      await page.mouse.move(b.x+b.width*.8,b.y+b.height*.65);
      await page.waitForFunction(()=>{
        const e=document.querySelector(".hero--cinematic .hero-media");
        return Math.abs(parseFloat(e.style.getPropertyValue("--fd-hero-depth-x")))>=2;
      });
      await page.mouse.move(0,0);
      await page.waitForFunction(()=>{
        const e=document.querySelector(".hero--cinematic .hero-media");
        return e.style.getPropertyValue("--fd-hero-depth-x")==="0px";
      });
      await page.locator("#galeria").scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector(".gallery-heading").classList.contains("fd-desktop-revealed"));
      if(width===1440) {
        const urlBefore=new URL(page.url());
        await page.locator('.fd-desktop-chapter[href="#guia"]').click();
        await page.waitForURL(urlBefore.origin+urlBefore.pathname+"#guia");
        await page.waitForFunction(()=>document.querySelector('.fd-desktop-chapter[href="#guia"]').getAttribute("aria-current")==="location");
        await page.screenshot({path:output+"/frida-desktop-chapters-1440.png",animations:"disabled"});
      }
      const layout=await page.evaluate(()=>({
        viewport:innerWidth,
        documentWidth:document.documentElement.scrollWidth,
        count:document.querySelectorAll(".fd-desktop-revealed").length
      }));
      assert(layout.documentWidth<=layout.viewport+2,"Desktop horizontal overflow "+JSON.stringify(layout));
      assert(layout.count>0,"Desktop reveals never activated");
      assert.equal(errors.length,0,"JS errors: "+errors.join(" | "));
      console.log("PASS desktop "+width+"px: cinematic layer, pointer depth, navigation, no overflow");
      total++;
    } finally {await page.close();}
  }

  const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:"reduce"});
  const reducedRequests=collectDesktopAssets(reduced);
  try {
    await reduced.goto(origin,{waitUntil:"networkidle"});
    assert.equal(reducedRequests.length,0,"Reduced-motion users must not download desktop animations");
    assert.equal(await reduced.locator("html.frida-desktop-mode").count(),0);
    assert.equal(await reduced.locator(".fd-desktop-chapters").count(),0);
    console.log("PASS reduced motion: original static desktop retained without extra assets");
    total++;
  } finally {await reduced.close();}

  const dataContext=await browser.newContext({viewport:{width:1440,height:900}});
  await dataContext.addInitScript(()=>{
    Object.defineProperty(navigator,"connection",{value:{saveData:true},configurable:true});
  });
  const savePage=await dataContext.newPage();
  const saveRequests=collectDesktopAssets(savePage);
  try {
    await savePage.goto(origin,{waitUntil:"networkidle"});
    assert.equal(saveRequests.length,0,"Data saver must not download desktop animation files");
    assert.equal(await savePage.locator("html.frida-desktop-mode").count(),0);
    console.log("PASS save-data: no desktop enhancement downloads");
    total++;
  } finally {await dataContext.close();}

  const resize=await browser.newPage({viewport:{width:1440,height:900}});
  try {
    await resize.goto(origin,{waitUntil:"domcontentloaded"});
    await resize.waitForFunction(()=>document.documentElement.classList.contains("frida-desktop-mode"));
    await resize.setViewportSize({width:390,height:844});
    await resize.waitForFunction(()=>!document.documentElement.classList.contains("frida-desktop-mode"));
    assert.equal(await resize.locator(".fd-desktop-chapters").count(),0);
    assert.equal(await resize.locator(".fd-desktop-revealed").count(),0);
    const active=await resize.evaluate(()=>getComputedStyle(document.querySelector(".mobile-dock")).display);
    assert.notEqual(active,"none");
    console.log("PASS desktop-to-mobile resize: all desktop changes torn down");
    total++;
  } finally {await resize.close();}

} finally {
  await browser.close();
}
console.log("FRIDA DESKTOP V2: all "+total+" isolated experience checks passed");
