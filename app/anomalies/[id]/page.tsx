import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Tabbar from "@/components/Tabbar";
import ActionsStatut from "@/components/ActionsStatut";
import { BadgeGravite, BadgeStatut, FormeStatut } from "@/components/Badges";
import { supabase } from "@/lib/supabase";
import { LIBELLE_STATUT, estUuid, formaterDate, reference, type Anomalie, type Historique } from "@/lib/domaine";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const COULEUR_POINT: Record<string, string | undefined> = {
  en_cours: "var(--warning)",
  corrigee: "var(--success)",
  verifiee: "var(--success)",
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  if (!estUuid(id)) return { title: "Anomalie introuvable" };
  const { data } = await supabase().from("anomalies").select("numero, titre").eq("id", id).maybeSingle();
  return { title: data ? `${reference(data.numero)} ${data.titre}` : "Anomalie introuvable" };
}

export default async function Detail({ params }: Props) {
  const { id } = await params;
  if (!estUuid(id)) notFound();
  const db = supabase();
  const [{ data: a }, { data: caps }, { data: histo }] = await Promise.all([
    db.from("anomalies").select("*").eq("id", id).maybeSingle<Anomalie>(),
    db.from("captures").select("chemin, cree_le").eq("anomalie_id", id).order("cree_le"),
    db.from("historique").select("*").eq("anomalie_id", id).order("cree_le", { ascending: false }).returns<Historique[]>(),
  ]);
  if (!a) notFound();

  const captures = await Promise.all(
    (caps ?? []).map(async (c) => {
      const { data } = await db.storage.from("captures").createSignedUrl(c.chemin, 3600);
      return { ...c, url: data?.signedUrl ?? null };
    }),
  );
  const etapes = a.etapes.split("\n").map((l) => l.replace(/^\s*\d+[.)]\s*/, "").trim()).filter(Boolean);

  return (
    <>
      <header className="topbar">
        <Link className="topbar-back" href="/suivre">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          Liste
        </Link>
        <span className="topbar-title" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-base)" }}>
          {reference(a.numero)}
        </span>
      </header>

      <main className="page" id="contenu">
        <div className="detail-head">
          <h1 className="detail-title">{a.titre}</h1>
          <div className="badges">
            <BadgeGravite gravite={a.gravite} />
            <BadgeStatut statut={a.statut} />
          </div>
          <p className="meta">
            Signalée par {a.auteur} le <time dateTime={a.cree_le}>{formaterDate(a.cree_le)}</time>
          </p>
        </div>

        <ActionsStatut id={a.id} statut={a.statut} reference={reference(a.numero)} />

        {captures.length > 0 && (
          <section className="section" aria-labelledby="capture-titre">
            <h2 className="section-title" id="capture-titre">Capture</h2>
            {captures.map((c, i) => (
              <figure className="capture" style={{ margin: 0 }} key={c.chemin}>
                {c.url ? (
                  <a href={c.url} target="_blank" rel="noopener" aria-label={`Agrandir la capture ${i + 1}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.url} alt={`Capture ${i + 1} de l'anomalie ${reference(a.numero)}`} style={{ width: "100%", height: "auto", display: "block" }} />
                  </a>
                ) : (
                  <p className="muted">Capture indisponible.</p>
                )}
                <figcaption>Ajoutée le {formaterDate(c.cree_le)} · toucher pour agrandir</figcaption>
              </figure>
            ))}
          </section>
        )}

        <section className="section" aria-labelledby="desc-titre">
          <h2 className="section-title" id="desc-titre">Description</h2>
          <dl className="dl panel">
            <div>
              <dt>Étapes pour reproduire</dt>
              <dd>
                {etapes.length > 1 ? (
                  <ol className="steps">{etapes.map((e, i) => <li key={i}>{e}</li>)}</ol>
                ) : (
                  <p style={{ whiteSpace: "pre-wrap" }}>{a.etapes}</p>
                )}
              </dd>
            </div>
            <div>
              <dt>Résultat attendu</dt>
              <dd style={{ whiteSpace: "pre-wrap" }}>{a.attendu}</dd>
            </div>
            <div>
              <dt>Résultat obtenu</dt>
              <dd style={{ whiteSpace: "pre-wrap" }}>{a.obtenu}</dd>
            </div>
          </dl>
        </section>

        <section className="section" aria-labelledby="histo-titre">
          <h2 className="section-title" id="histo-titre">Historique</h2>
          <ol className="timeline">
            {(histo ?? []).map((h) => (
              <li key={h.id}>
                <span className="dot" aria-hidden="true" style={COULEUR_POINT[h.nouveau] ? { borderColor: COULEUR_POINT[h.nouveau] } : undefined} />
                <time dateTime={h.cree_le}>{formaterDate(h.cree_le)}</time>
                <p className="what">
                  {h.ancien ? "Passée en " : "Signalée "}
                  <strong><FormeStatut statut={h.nouveau} /> {LIBELLE_STATUT[h.nouveau]}</strong> par {h.auteur}
                </p>
                {h.commentaire && h.ancien && <p className="comment" style={{ whiteSpace: "pre-wrap" }}>{h.commentaire}</p>}
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Suspense><Tabbar /></Suspense>
    </>
  );
}
