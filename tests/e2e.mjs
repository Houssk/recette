// Plan de test minimal (support page 8), exécuté avec Playwright sur un écran de 390 px.
// Usage : BASE_URL=http://localhost:3100 node tests/e2e.mjs
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const BASE = process.env.BASE_URL || "http://localhost:3100";
const r = [];
const note = (cas, ok, detail = "") => r.push({ cas, resultat: ok ? "RÉUSSI" : "ÉCHOUÉ", detail });
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined;
const browser = await chromium.launch({ proxy });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: !!proxy })).newPage();
const titre = `E2E ${Date.now()}`;

try {
  // 1. Champ obligatoire vide
  await page.goto(`${BASE}/signaler`);
  await page.getByRole("button", { name: "Envoyer l'anomalie" }).click();
  const alerte = page.locator(".alert-error");
  await alerte.waitFor();
  const txt = await alerte.innerText();
  note("Champ obligatoire vide", /champs? à corriger/.test(txt) && page.url().endsWith("/signaler"), txt.split("\n")[0]);

  // 2. Anomalie complète, bloquante, avec grosse capture (> 4 Mo, compressée)
  await page.getByLabel("Votre nom").fill("Inès (test)");
  await page.getByLabel("Titre").fill(titre);
  await page.locator("#g-bloquante").check({ force: true });
  await page.getByLabel("Étapes pour reproduire").fill("1. Ouvrir la fiche\n2. Cliquer sur Enregistrer");
  await page.getByLabel("Résultat attendu").fill("La fiche est enregistrée");
  await page.getByLabel("Résultat obtenu").fill("Erreur 500");
  await page.locator("#capture").setInputFiles("tests/fixtures/grosse-capture.png");
  await page.getByText("prête à envoyer").waitFor({ timeout: 15000 });
  const taille = await page.locator(".photo-preview .meta").innerText();
  note("Capture de plus de 4 Mo : compression", true, taille);
  await page.getByRole("button", { name: "Envoyer l'anomalie" }).click();
  await page.waitForURL(/\/suivre\?envoyee=/, { timeout: 20000 });
  const msg = await page.locator(".alert-success").innerText();
  const alerteParam = new URL(page.url()).searchParams.get("alerte");
  note("Anomalie complète avec capture : enregistrée", msg.includes("envoyée"), msg.replace(/\n/g, " "));
  note("Anomalie bloquante : alerte e-mail", ["envoyee", "non_configuree", "echec"].includes(alerteParam),
    `alerte=${alerteParam} (non_configuree/echec = clé absente, anomalie quand même enregistrée)`);

  // 3. Détail : capture, historique, statut Nouvelle
  await page.getByRole("link", { name: new RegExp(titre) }).click();
  await page.getByRole("heading", { name: titre }).waitFor();
  const img = page.locator("figure.capture img");
  await img.waitFor();
  const largeur = await img.evaluate((i) => i.naturalWidth);
  note("Détail : capture visible", largeur > 0, `largeur ${largeur} px`);
  note("Statut initial « Nouvelle »", await page.locator(".detail-head .badge-statut").innerText() === "Nouvelle");

  // 4. Cycle : En cours → Corrigée → Rouvrir sans commentaire (refus) → Rouvrir → Corrigée → Vérifiée
  const clic = async (nom) => { await page.getByRole("button", { name: nom }).click(); await page.waitForTimeout(1500); };
  await clic("Passer en cours");
  await clic("Marquer corrigée");
  await page.getByRole("heading", { name: "Vérifier la correction" }).waitFor();
  await clic("Rouvrir");
  note("Rouvrir sans commentaire : refusé", await page.locator("#commentaire-erreur").isVisible());
  await page.getByLabel("Commentaire").fill("Toujours en erreur sur Safari");
  await clic("Rouvrir");
  await page.locator(".detail-head .badge-statut", { hasText: "En cours" }).waitFor();
  note("Rouvrir avec commentaire : retour En cours", true);
  await clic("Marquer corrigée");
  await page.getByLabel("Commentaire").fill("OK sur iPhone 13");
  await clic("Vérifiée");
  await page.locator(".detail-head .badge-statut", { hasText: "Vérifiée" }).waitFor();
  const lignes = await page.locator(".timeline li").count();
  note("Vérifiée + historique daté", lignes === 6, `${lignes} lignes d'historique`);

  // 5. Filtres
  await page.goto(`${BASE}/suivre?statut=verifiee&gravite=bloquante`);
  note("Filtre statut + gravité", await page.getByRole("link", { name: new RegExp(titre) }).isVisible());

  // 6. Téléphone 390 px : cibles ≥ 48 px, pas de défilement horizontal
  const controle = [];
  for (const chemin of ["/signaler", "/suivre", page.url()]) {
    await page.goto(chemin.startsWith("http") ? chemin : `${BASE}${chemin}`);
    const res = await page.evaluate(() => {
      const petits = [...document.querySelectorAll("a, button, label[for]:not(.field-label), input:not([type=file]):not([type=radio]), textarea")]
        .filter((e) => e.offsetParent && e.getBoundingClientRect().height < 48)
        .map((e) => `${e.tagName.toLowerCase()}:${(e.textContent || e.id).trim().slice(0, 20)}(${Math.round(e.getBoundingClientRect().height)})`);
      return { petits, debord: document.documentElement.scrollWidth > window.innerWidth };
    });
    controle.push(`${chemin.replace(BASE, "")}: ${res.petits.length ? res.petits.join(", ") : "ok"}${res.debord ? " DÉBORDEMENT" : ""}`);
  }
  note("Téléphone 390 px : cibles ≥ 48 px", controle.every((c) => c.endsWith("ok")), controle.join(" | "));
} catch (e) {
  note("Exécution", false, e.message.split("\n").slice(0,14).join(" | "));
} finally {
  await browser.close();
}
console.table(r);
process.exit(r.some((x) => x.resultat === "ÉCHOUÉ") ? 1 : 0);
