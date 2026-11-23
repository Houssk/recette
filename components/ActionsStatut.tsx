"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LIMITES, type Statut } from "@/lib/domaine";

const CLE_NOM = "recette.nom";

type Props = { id: string; statut: Statut; reference: string };

/** Bloc d'actions du détail : prise en charge, correction, vérification ou réouverture. */
export default function ActionsStatut({ id, statut, reference }: Props) {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [erreurs, setErreurs] = useState<{ nom?: string; commentaire?: string; general?: string }>({});
  const [succes, setSucces] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const zoneErreur = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try { setNom(localStorage.getItem(CLE_NOM) ?? ""); } catch {}
  }, []);
  useEffect(() => { setErreurs({}); }, [statut]);

  const commentaireRequis = statut === "corrigee" || statut === "verifiee";

  async function changer(nouveau: Statut, messageSucces: string) {
    const e: typeof erreurs = {};
    if (!nom.trim()) e.nom = "Indiquez votre nom.";
    if (commentaireRequis && !commentaire.trim()) {
      e.commentaire = nouveau === "verifiee"
        ? "Ajoutez un commentaire : ce que vous avez vérifié."
        : "Ajoutez un commentaire pour rouvrir l'anomalie.";
    }
    setErreurs(e);
    setSucces("");
    if (Object.keys(e).length) {
      if (e.commentaire) zoneErreur.current?.focus();
      return;
    }
    setEnvoi(true);
    try { localStorage.setItem(CLE_NOM, nom.trim()); } catch {}
    const { error } = await supabase().rpc("changer_statut", {
      p_anomalie: id,
      p_nouveau: nouveau,
      p_commentaire: commentaire.trim() || null,
      p_auteur: nom.trim(),
    });
    setEnvoi(false);
    if (error) {
      setErreurs({ general: error.message.startsWith("Transition") || error.message.startsWith("Un commentaire")
        ? error.message
        : "Changement impossible. Rechargez la page et réessayez." });
      return;
    }
    setCommentaire("");
    setSucces(messageSucces);
    router.refresh();
  }

  const champNom = (
    <div className="field">
      <label className="field-label" htmlFor="nom-action">Votre nom</label>
      <input className="input" id="nom-action" type="text" autoComplete="name" maxLength={LIMITES.auteur}
        value={nom} onChange={(e) => setNom(e.target.value)}
        aria-invalid={!!erreurs.nom} aria-describedby={erreurs.nom ? "nom-action-erreur" : undefined} />
      {erreurs.nom && <p className="field-error" id="nom-action-erreur">{erreurs.nom}</p>}
    </div>
  );

  const champCommentaire = (aide: string) => (
    <div className="field">
      <label className="field-label" htmlFor="commentaire">Commentaire</label>
      <p className="field-hint" id="commentaire-aide">{aide}</p>
      <textarea ref={zoneErreur} className="textarea" id="commentaire" rows={3} maxLength={LIMITES.commentaire}
        value={commentaire} onChange={(e) => setCommentaire(e.target.value)}
        aria-invalid={!!erreurs.commentaire}
        aria-describedby={["commentaire-aide", erreurs.commentaire ? "commentaire-erreur" : ""].filter(Boolean).join(" ")} />
      {erreurs.commentaire && <p className="field-error" id="commentaire-erreur">{erreurs.commentaire}</p>}
    </div>
  );

  const retour = (
    <>
      {succes && (
        <div className="alert alert-success" role="status" style={{ marginBottom: "var(--sp-4)" }}>
          <span className="alert-icon" aria-hidden="true">✓</span>
          <div><p className="alert-title">{reference} : {succes}</p></div>
        </div>
      )}
      {erreurs.general && (
        <div className="alert alert-error" role="alert" style={{ marginBottom: "var(--sp-4)" }}>
          <span className="alert-icon" aria-hidden="true">!</span>
          <div><p className="alert-title">{erreurs.general}</p></div>
        </div>
      )}
    </>
  );

  if (statut === "corrigee") {
    return (
      <section className="verify section" aria-labelledby="verifier-titre">
        <h2 className="section-title" id="verifier-titre">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" /></svg>
          Vérifier la correction
        </h2>
        <p className="muted" style={{ marginBottom: "var(--sp-4)" }}>
          Refaites les étapes ci-dessous, puis indiquez le résultat.
        </p>
        {retour}
        <form className="stack" onSubmit={(e) => e.preventDefault()} noValidate>
          {champNom}
          {champCommentaire("Obligatoire : ce que vous avez vérifié, ou ce qui ne marche toujours pas.")}
          <div className="btn-row">
            <button type="button" className="btn btn-danger" disabled={envoi} onClick={() => changer("en_cours", "anomalie rouverte, retour En cours")}>
              <span aria-hidden="true">↺</span> Rouvrir
            </button>
            <button type="button" className="btn btn-success" disabled={envoi} onClick={() => changer("verifiee", "anomalie vérifiée")}>
              <span aria-hidden="true">✓</span> Vérifiée
            </button>
          </div>
        </form>
      </section>
    );
  }

  const config = {
    nouvelle: { titre: "Prendre en charge", bouton: "Passer en cours", cible: "en_cours" as Statut, ok: "prise en charge", cls: "btn-primary" },
    en_cours: { titre: "Correction", bouton: "Marquer corrigée", cible: "corrigee" as Statut, ok: "marquée corrigée, à vérifier", cls: "btn-primary" },
    verifiee: { titre: "Problème revenu ?", bouton: "Rouvrir", cible: "en_cours" as Statut, ok: "anomalie rouverte, retour En cours", cls: "btn-danger" },
  }[statut];

  return (
    <section className="section" aria-labelledby="action-titre">
      <h2 className="section-title" id="action-titre">{config.titre}</h2>
      {retour}
      <form className="stack panel" onSubmit={(e) => e.preventDefault()} noValidate>
        {champNom}
        {statut === "verifiee"
          ? champCommentaire("Obligatoire pour rouvrir : dites ce qui ne marche plus.")
          : champCommentaire("Facultatif : version déployée, piste de correction…")}
        <button type="button" className={`btn ${config.cls} btn-block`} disabled={envoi} onClick={() => changer(config.cible, config.ok)}>
          {envoi ? "Enregistrement…" : config.bouton}
        </button>
      </form>
    </section>
  );
}
