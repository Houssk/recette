"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { compresserImage } from "@/lib/image";
import { GRAVITES, LIBELLE_GRAVITE, LIMITES, type Gravite } from "@/lib/domaine";

type Champ = "titre" | "gravite" | "etapes" | "attendu" | "obtenu" | "auteur" | "capture";
const LIBELLES: Record<Champ, string> = {
  auteur: "Votre nom",
  titre: "Titre",
  gravite: "Gravité",
  etapes: "Étapes pour reproduire",
  attendu: "Résultat attendu",
  obtenu: "Résultat obtenu",
  capture: "Capture d'écran",
};
const FORME: Record<Gravite, string> = { bloquante: "▲", majeure: "◆", mineure: "▼" };
const CLE_NOM = "recette.nom";

export default function FormulaireSignaler() {
  const router = useRouter();
  const [valeurs, setValeurs] = useState({ auteur: "", titre: "", etapes: "", attendu: "", obtenu: "" });
  const [gravite, setGravite] = useState<Gravite | "">("");
  const [photo, setPhoto] = useState<{ blob: Blob; nom: string; apercu: string } | null>(null);
  const [erreurs, setErreurs] = useState<Partial<Record<Champ, string>>>({});
  const [erreurGenerale, setErreurGenerale] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [preparation, setPreparation] = useState(false);
  const resume = useRef<HTMLDivElement>(null);
  const idAnomalie = useRef<string>("");

  useEffect(() => {
    try {
      const nom = localStorage.getItem(CLE_NOM);
      if (nom) setValeurs((v) => ({ ...v, auteur: nom }));
    } catch {}
  }, []);

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.apercu); }, [photo]);

  const maj = (k: keyof typeof valeurs) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValeurs((v) => ({ ...v, [k]: e.target.value }));

  async function choisirPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setPreparation(true);
    setErreurs((x) => ({ ...x, capture: undefined }));
    try {
      const blob = await compresserImage(f);
      setPhoto({ blob, nom: f.name || "photo.jpg", apercu: URL.createObjectURL(blob) });
    } catch (err) {
      setPhoto(null);
      setErreurs((x) => ({ ...x, capture: (err as Error).message }));
    } finally {
      setPreparation(false);
    }
  }

  function valider(): Partial<Record<Champ, string>> {
    const e: Partial<Record<Champ, string>> = {};
    if (!valeurs.auteur.trim()) e.auteur = "Indiquez votre nom.";
    if (valeurs.titre.trim().length < 3) e.titre = "Indiquez un titre court (3 caractères minimum).";
    if (!gravite) e.gravite = "Choisissez une gravité.";
    if (!valeurs.etapes.trim()) e.etapes = "Décrivez les étapes pour reproduire.";
    if (!valeurs.attendu.trim()) e.attendu = "Indiquez le résultat attendu.";
    if (!valeurs.obtenu.trim()) e.obtenu = "Indiquez le résultat obtenu.";
    return e;
  }

  async function envoyer(ev: React.FormEvent) {
    ev.preventDefault();
    setErreurGenerale("");
    const e = { ...valider(), ...(erreurs.capture ? { capture: erreurs.capture } : {}) };
    setErreurs(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => resume.current?.focus());
      return;
    }
    setEnvoi(true);
    try {
      try { localStorage.setItem(CLE_NOM, valeurs.auteur.trim()); } catch {}
      if (!idAnomalie.current) idAnomalie.current = crypto.randomUUID();
      const id = idAnomalie.current;
      const captures: string[] = [];
      if (photo) {
        const chemin = `${id}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase().storage.from("captures").upload(chemin, photo.blob, {
          contentType: "image/jpeg",
          upsert: false,
        });
        if (error) throw new Error("La capture n'a pas pu être envoyée. Vérifiez la connexion et réessayez.");
        captures.push(chemin);
      }
      const rep = await fetch("/api/anomalies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, gravite, captures, ...valeurs }),
      });
      const corps = await rep.json().catch(() => ({}));
      if (!rep.ok) {
        if (corps.champs) {
          setErreurs(corps.champs);
          requestAnimationFrame(() => resume.current?.focus());
        }
        throw new Error(corps.erreur || "Enregistrement impossible, réessayez.");
      }
      idAnomalie.current = "";
      router.push(`/suivre?envoyee=${corps.id}&alerte=${corps.alerte}`);
      router.refresh();
    } catch (err) {
      setErreurGenerale((err as Error).message);
      requestAnimationFrame(() => resume.current?.focus());
      setEnvoi(false);
    }
  }

  const listeErreurs = Object.entries(erreurs).filter(([, m]) => m) as [Champ, string][];
  const aide = (k: Champ, ...autres: string[]) =>
    [...autres, erreurs[k] ? `${k}-erreur` : ""].filter(Boolean).join(" ") || undefined;
  const erreurDe = (k: Champ) =>
    erreurs[k] ? <p className="field-error" id={`${k}-erreur`}>{erreurs[k]}</p> : null;

  return (
    <>
      {(listeErreurs.length > 0 || erreurGenerale) && (
        <div className="alert alert-error" role="alert" tabIndex={-1} ref={resume} style={{ marginBottom: "var(--sp-5)" }}>
          <span className="alert-icon" aria-hidden="true">!</span>
          <div>
            <p className="alert-title">
              {listeErreurs.length
                ? `${listeErreurs.length} champ${listeErreurs.length > 1 ? "s" : ""} à corriger`
                : "Envoi impossible"}
            </p>
            {erreurGenerale && !listeErreurs.length && <p>{erreurGenerale}</p>}
            {listeErreurs.map(([k, m]) => (
              <p key={k}>
                <a className="alert-link" href={`#${k === "gravite" ? "g-bloquante" : k}`}>
                  {LIBELLES[k]} : {m}
                </a>
              </p>
            ))}
          </div>
        </div>
      )}

      <form className="stack" onSubmit={envoyer} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="auteur">
            Votre nom <span className="req" aria-hidden="true">*</span>
          </label>
          <input className="input" id="auteur" name="auteur" type="text" autoComplete="name" maxLength={LIMITES.auteur}
            value={valeurs.auteur} onChange={maj("auteur")} aria-required="true"
            aria-invalid={!!erreurs.auteur} aria-describedby={aide("auteur")} />
          {erreurDe("auteur")}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="titre">
            Titre <span className="req" aria-hidden="true">*</span>
          </label>
          <p className="field-hint" id="titre-aide">Ce qui ne marche pas, en une phrase.</p>
          <input className="input" id="titre" name="titre" type="text" maxLength={LIMITES.titre}
            value={valeurs.titre} onChange={maj("titre")} aria-required="true"
            aria-invalid={!!erreurs.titre} aria-describedby={aide("titre", "titre-aide")} />
          {erreurDe("titre")}
        </div>

        <fieldset className="segmented" aria-describedby={aide("gravite", "gravite-aide")}>
          <legend>
            Gravité <span className="req" aria-hidden="true" style={{ color: "var(--danger)" }}>*</span>
          </legend>
          <div className="segmented-options">
            {GRAVITES.map((g) => (
              <div key={g} className={`segmented-option is-${g}`}>
                <input type="radio" id={`g-${g}`} name="gravite" value={g} checked={gravite === g}
                  onChange={() => setGravite(g)} aria-invalid={!!erreurs.gravite} />
                <label htmlFor={`g-${g}`}>
                  <span className="shape" aria-hidden="true">{FORME[g]}</span>
                  {LIBELLE_GRAVITE[g]}
                </label>
              </div>
            ))}
          </div>
          <p className="field-hint" id="gravite-aide" style={{ marginTop: "var(--sp-2)" }}>
            Bloquante : impossible de continuer le test. L&apos;équipe est prévenue par e-mail.
          </p>
          {erreurDe("gravite")}
        </fieldset>

        <div className="field">
          <label className="field-label" htmlFor="etapes">
            Étapes pour reproduire <span className="req" aria-hidden="true">*</span>
          </label>
          <p className="field-hint" id="etapes-aide">Une étape par ligne.</p>
          <textarea className="textarea" id="etapes" name="etapes" rows={4} maxLength={LIMITES.etapes}
            value={valeurs.etapes} onChange={maj("etapes")} aria-required="true"
            aria-invalid={!!erreurs.etapes} aria-describedby={aide("etapes", "etapes-aide")} />
          {erreurDe("etapes")}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="attendu">
            Résultat attendu <span className="req" aria-hidden="true">*</span>
          </label>
          <textarea className="textarea" id="attendu" name="attendu" rows={3} maxLength={LIMITES.attendu}
            value={valeurs.attendu} onChange={maj("attendu")} aria-required="true"
            aria-invalid={!!erreurs.attendu} aria-describedby={aide("attendu")} />
          {erreurDe("attendu")}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="obtenu">
            Résultat obtenu <span className="req" aria-hidden="true">*</span>
          </label>
          <textarea className="textarea" id="obtenu" name="obtenu" rows={3} maxLength={LIMITES.obtenu}
            value={valeurs.obtenu} onChange={maj("obtenu")} aria-required="true"
            aria-invalid={!!erreurs.obtenu} aria-describedby={aide("obtenu")} />
          {erreurDe("obtenu")}
        </div>

        <div className="field">
          <span className="field-label" id="capture-label">
            Capture d&apos;écran <span className="muted" style={{ fontWeight: 400 }}>(facultatif)</span>
          </span>
          {photo ? (
            <div className="photo-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="thumb" src={photo.apercu} alt="Aperçu de la capture" style={{ objectFit: "cover" }} />
              <div className="grow">
                <p style={{ fontWeight: 600, overflowWrap: "anywhere" }}>{photo.nom}</p>
                <p className="meta">{(photo.blob.size / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo · prête à envoyer</p>
              </div>
              <button type="button" className="btn btn-danger" style={{ padding: "0 var(--sp-3)" }}
                onClick={() => setPhoto(null)} aria-label={`Retirer la photo ${photo.nom}`}>
                Retirer
              </button>
            </div>
          ) : (
            <div className="photo-input">
              <input type="file" id="capture" name="capture" accept="image/*" capture="environment"
                onChange={choisirPhoto} aria-labelledby="capture-label capture-btn"
                aria-invalid={!!erreurs.capture} aria-describedby={aide("capture")} />
              <label className="photo-drop" htmlFor="capture" id="capture-btn">
                <svg className="icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
                {preparation ? "Préparation de la photo…" : "Prendre une photo"}
              </label>
            </div>
          )}
          {erreurDe("capture")}
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={envoi || preparation} aria-busy={envoi}>
          {envoi ? (<><span className="spinner" aria-hidden="true" /> Envoi en cours…</>) : "Envoyer l'anomalie"}
        </button>
      </form>
    </>
  );
}
