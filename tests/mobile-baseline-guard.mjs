/** Frozen-mobile guard: the entire original Stable 1 markup/CSS/JS must
 * remain byte-for-byte identical, except for an isolated desktop bootstrap.
 * Run after: git fetch origin stable/v1 --depth=1
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";

const baseline=execFileSync("git",["show","FETCH_HEAD:index.html"],{encoding:"utf8"});
const current=readFileSync("index.html","utf8");
const injection=/\n  <!-- Separate desktop experience: no desktop CSS\/JS requests on mobile\.[\s\S]*?\n  <\/script>/;
assert(injection.test(current),"Desktop bootstrap must be present and uniquely delimited");
const normalized=current.replace(injection,"");
assert.equal(normalized,baseline,
  "The Stable 1 HTML has changed outside the desktop-only bootstrap. Mobile is frozen.");

const changed=execFileSync("git",["diff","--name-only","FETCH_HEAD","HEAD"],{encoding:"utf8"}).trim().split("\n").filter(Boolean);
const allowed=new Set([
  "index.html",
  "assets/desktop-experience.css",
  "assets/desktop-experience.js",
  "tests/desktop-experience.mjs",
  "tests/mobile-baseline-guard.mjs",
  ".github/workflows/frida-qa.yml",
  "design-system/DESKTOP-MOBILE-STRATEGY.md"
]);
const illegal=changed.filter(p=>!allowed.has(p));
assert.deepEqual(illegal,[],"Stable 1 sources were changed: "+illegal.join(", "));
assert(changed.includes("assets/desktop-experience.css") && changed.includes("assets/desktop-experience.js"));
console.log("PASS Stable 1 frozen: original HTML, CSS, JS and media assets are unchanged");
console.log("PASS Delta is isolated to new desktop CSS/JS, opt-in loader, documentation and tests");
