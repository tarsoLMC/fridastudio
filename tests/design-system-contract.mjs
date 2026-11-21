/* Frida Atelier contract checks: palette roles, WCAG pairs, isolation and CSS hygiene. */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const read = path => readFileSync(path,"utf8");
const tokens=read("assets/tokens.css");
const css=read("design-system/components.css");
const html=read("design-system/index.html");
const previewJS=read("design-system/preview.js");
const primitiveColors={};
for(const match of tokens.matchAll(/--(fd-palette-[\w-]+):\s*(#[a-f0-9]{6})\s*;/gi)) {
  assert(!Object.hasOwn(primitiveColors,match[1]),"duplicate primitive: "+match[1]);
  primitiveColors[match[1]]=match[2];
}
const expected={
  "fd-palette-paper":"#F8F5F0",
  "fd-palette-ivory":"#FFFDFC",
  "fd-palette-stone":"#EDE7E3",
  "fd-palette-ink":"#2F282C",
  "fd-palette-muted":"#5E5358",
  "fd-palette-plum":"#603748",
  "fd-palette-plum-hover":"#492634",
  "fd-palette-rose-soft":"#EEDDE0",
  "fd-palette-rose-ink":"#743D53",
  "fd-palette-line-soft":"#D7C9C6",
  "fd-palette-line-control":"#8F6775",
  "fd-palette-bronze-decoration":"#A88772"
};
assert.equal(Object.keys(primitiveColors).length,Object.keys(expected).length);
for(const [role,color] of Object.entries(expected))assert.equal(primitiveColors[role].toUpperCase(),color);
const rgb=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16)/255).map(y=>y<=.04045?y/12.92:((y+.055)/1.055)**2.4);
const lum=color=>{const [r,g,b]=rgb(color);return .2126*r+.7152*g+.0722*b};
const contrast=(a,b)=>{const x=lum(expected[a]),y=lum(expected[b]);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
for(const [a,b] of [
  ["fd-palette-ink","fd-palette-paper"],
  ["fd-palette-muted","fd-palette-paper"],
  ["fd-palette-ink","fd-palette-ivory"],
  ["fd-palette-ivory","fd-palette-plum"],
  ["fd-palette-ivory","fd-palette-plum-hover"],
  ["fd-palette-rose-ink","fd-palette-rose-soft"],
  ["fd-palette-muted","fd-palette-stone"],
  ["fd-palette-plum","fd-palette-rose-soft"]
]) {
  const ratio=contrast(a,b);
  assert(ratio>=4.5, `text color pair ${a}/${b} fails AA: ${ratio.toFixed(2)}`);
  console.log("PASS contrast "+a+" / "+b+": "+ratio.toFixed(2)+":1");
}
assert(contrast("fd-palette-bronze-decoration","fd-palette-paper")<4.5,
  "Bronze must remain a decorative-only color unless its contrast is reviewed");
assert(contrast("fd-palette-line-soft","fd-palette-ivory")<3,
  "Soft line must never be the sole boundary of an interactive control");
assert(contrast("fd-palette-line-control","fd-palette-ivory")>=3,
  "Control border must be visible against surface");
assert(!/#[0-9a-f]{3,8}\b/i.test(css),"Component CSS must not introduce any literal colors");
for(const role of [
  "--fd-bg-page","--fd-bg-surface","--fd-bg-selection","--fd-text-primary",
  "--fd-text-secondary","--fd-action-bg","--fd-action-text","--fd-border-focus",
  "--fd-border-control","--fd-font-display","--fd-font-body","--fd-space-4",
  "--fd-radius-card","--fd-motion-medium","--fd-touch-min"
])assert(tokens.includes(role+":"),"Missing token: "+role);
const balanced=(s)=>{
  let n=0;
  for(const ch of s.replace(/\/\*[\s\S]*?\*\//g,"")) {
    if(ch==="{")n++;
    else if(ch==="}")n--;
    if(n<0)return false;
  }
  return n===0;
};
assert(balanced(tokens)&&balanced(css),"CSS blocks should be balanced");
assert(html.includes('data-fd-preview'),"Preview must be isolated");
assert(html.includes('name="robots" content="noindex,nofollow"'),"Preview should not be indexed");
for(const path of ["./tokens.css","./components.css","./preview.js"])assert(html.includes(path),"Missing preview asset "+path);
assert(html.includes("../assets/images/hero-frida.webp"),"Preview must use existing local photography");
assert(!/wa\.me|https:\/\/api\./.test(previewJS),"No outbound preview requests");
assert(previewJS.includes('aria-pressed'),"Selected controls need explicit state");
console.log("FRIDA ATELIER: token contract passed, 8 WCAG AA text pairs + component hygiene");
