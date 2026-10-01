/*
 * Contrast audit.
 *
 *   cd tools && npm install && npm run check
 *
 * Walks every element on the page that paints its own text, works out the
 * background actually painted behind it by climbing ancestors, and checks the
 * ratio against WCAG AA: 4.5:1 for body text, 3:1 for large or bold text.
 * It should report zero failures. Run it after any colour change.
 *
 * Audits ../index.html by default; pass a path or a URL to audit that instead.
 */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const arg = process.argv[2] || resolve(import.meta.dirname, '..', 'index.html');
const target = /^https?:\/\//.test(arg) ? arg : pathToFileURL(resolve(arg)).href;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
console.log('auditing', target);
await p.goto(target); await p.waitForTimeout(2000);
// open every disclosure so hidden text gets audited too
await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
await p.waitForTimeout(400);
const report = await p.evaluate(() => {
  // Chrome serializes color-mix() as color(srgb r g b / a) with 0-1 channels,
  // and plain colors as rgb(r g b) with 0-255. Handle both or every
  // translucent surface reads as near-black.
  const toRGB = c => {
    if (!c) return null;
    const sr = c.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (sr) return [sr[1],sr[2],sr[3]].map(v => Math.round(Number(v)*255));
    const m = c.match(/[\d.]+/g);
    return m ? m.slice(0,3).map(Number) : null;
  };
  const alphaOf = c => {
    const sr = c.match(/color\(srgb[^/)]*\/\s*([\d.]+)/);
    if (sr) return Number(sr[1]);
    const m = c.match(/[\d.]+/g);
    return (m && m.length > 3) ? Number(m[3]) : 1;
  };
  const lum = rgb => { const c = rgb.map(v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4); });
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; };
  const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((m,n)=>n-m); return (x+0.05)/(y+0.05); };
  const bgOf = el => {           // first ancestor that actually paints
    let n = el;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && c !== 'transparent' && alphaOf(c) > 0.5) return toRGB(c);
      n = n.parentElement;
    }
    return [255,255,255];
  };
  const bad = [];
  document.querySelectorAll('body *').forEach(el => {
    const own = [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim().length>1);
    if (!own) return;
    const cs = getComputedStyle(el);
    if (cs.visibility==='hidden' || cs.display==='none' || Number(cs.opacity) < 0.3) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const size = parseFloat(cs.fontSize), weight = Number(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3.0 : 4.5;
    const got = ratio(toRGB(cs.color), bgOf(el));
    if (got < need) bad.push({
      text: el.textContent.trim().slice(0,38), cls: (el.className||'').toString().split(' ')[0],
      color: cs.color, size: Math.round(size), got: +got.toFixed(2), need
    });
  });
  return { checked: document.querySelectorAll('body *').length, failures: bad };
});
console.log('js errors:', errs.length?errs:'none');
console.log('elements scanned:', report.checked);
console.log('contrast failures:', report.failures.length);
report.failures.slice(0,12).forEach(f => console.log('  ', JSON.stringify(f)));
await p.close(); await b.close();
process.exit(report.failures.length || errs.length ? 1 : 0);
