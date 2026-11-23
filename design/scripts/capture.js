// Captures 390 px (DPR 2) + contrôle des cibles tactiles >= 48 px.
const { chromium } = require('playwright');
const path = require('path');
const dir = path.resolve(__dirname, '..');
const pages = ['signaler', 'suivre', 'detail'];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'fr-FR' });
  let failures = 0, total = 0;
  for (const name of pages) {
    const page = await ctx.newPage();
    await page.goto('file://' + path.join(dir, name + '.html'));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    // Agrandit le viewport à la hauteur du document pour que la barre fixe reste en bas.
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: 390, height: h });
    await page.screenshot({ path: path.join(dir, 'captures', name + '.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    const res = await page.evaluate(() => {
      const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [tabindex]:not([tabindex="-1"])';
      const out = [];
      for (const el of document.querySelectorAll(sel)) {
        // Contrôle masqué visuellement (radio, fichier) : on mesure son libellé visible.
        let target = el;
        const r0 = el.getBoundingClientRect();
        if ((el.type === 'radio' || el.type === 'checkbox' || el.type === 'file') && (getComputedStyle(el).opacity === '0' || r0.width <= 1)) {
          target = (el.id && document.querySelector(`label[for="${el.id}"]`)) || el.closest('label') || el;
        }
        const r = target.getBoundingClientRect();
        const label = (el.getAttribute('aria-label') || el.textContent || el.name || el.id || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
        out.push({ tag: el.tagName.toLowerCase() + (el.type ? '[' + el.type + ']' : ''), label, h: Math.round(r.height * 10) / 10, w: Math.round(r.width) });
      }
      const overflow = document.documentElement.scrollWidth > window.innerWidth;
      return { out, overflow, sw: document.documentElement.scrollWidth };
    });
    const bad = res.out.filter(e => e.h < 48);
    total += res.out.length; failures += bad.length;
    console.log(`\n${name}.html : ${res.out.length} éléments cliquables, ${bad.length} sous 48 px, min = ${Math.min(...res.out.map(e => e.h))} px, débordement horizontal : ${res.overflow ? 'OUI (' + res.sw + ')' : 'non'}`);
    for (const e of bad) console.log('  ÉCHEC', e);
    await page.close();
  }
  console.log(`\nTOTAL : ${total} éléments, ${failures} échec(s)`);
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
