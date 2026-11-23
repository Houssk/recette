import Link from "next/link";
import { Suspense } from "react";
import Tabbar from "@/components/Tabbar";
import { BadgeGravite, BadgeStatut, FormeStatut } from "@/components/Badges";
import { supabase } from "@/lib/supabase";
import {
  GRAVITES, LIBELLE_GRAVITE, LIBELLE_STATUT, STATUTS, estUuid, formaterDate, reference,
  type Anomalie, type Gravite, type Statut,
} from "@/lib/domaine";

export const dynamic = "force-dynamic";
export const metadata = { title: "Suivre les anomalies" };

type Params = Promise<Record<string, string | string[] | undefined>>;

const un = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function lien(statut: string, gravites: Gravite[]) {
  const q = new URLSearchParams();
  if (statut) q.set("statut", statut);
  if (gravites.length) q.set("gravite", gravites.join(","));
  const s = q.toString();
  return s ? `/suivre?${s}` : "/suivre";
}

const MESSAGES_ALERTE: Record<string, string> = {
  envoyee: "L'équipe a été prévenue par e-mail.",
  echec: "L'e-mail d'alerte n'a pas pu partir ; l'anomalie est bien enregistrée.",
  non_configuree: "Alerte e-mail non configurée ; l'anomalie est bien enregistrée.",
};

export default async function Suivre({ searchParams }: { searchParams: Params }) {
  const sp = await searchParams;
  const statut = STATUTS.includes(un(sp.statut) as Statut) ? (un(sp.statut) as Statut) : "";
  const gravites = un(sp.gravite).split(",").filter((g): g is Gravite => GRAVITES.includes(g as Gravite));
  const envoyee = un(sp.envoyee);
  const alerte = un(sp.alerte);

  const db = supabase();
  let requete = db.from("anomalies").select("*").order("cree_le", { ascending: false }).limit(200);
  if (statut) requete = requete.eq("statut", statut);
  if (gravites.length) requete = requete.in("gravite", gravites);
  const [{ data, error }, { data: tous }] = await Promise.all([
    requete.returns<Anomalie[]>(),
    db.from("anomalies").select("statut, gravite").limit(5000).returns<Pick<Anomalie, "statut" | "gravite">[]>(),
  ]);
  const anomalies = data ?? [];
  const comptes: Record<string, number> = {};
  for (const a of tous ?? []) {
    if (gravites.length && !gravites.includes(a.gravite)) continue;
    comptes[a.statut] = (comptes[a.statut] ?? 0) + 1;
    comptes.tous = (comptes.tous ?? 0) + 1;
  }
  const nouvelle = estUuid(envoyee) ? anomalies.find((a) => a.id === envoyee) : undefined;

  const basculer = (g: Gravite) =>
    gravites.includes(g) ? gravites.filter((x) => x !== g) : [...gravites, g];
  const resume = [
    `${anomalies.length} anomalie${anomalies.length > 1 ? "s" : ""}`,
    statut ? LIBELLE_STATUT[statut].toLowerCase() : "",
    gravites.length ? gravites.map((g) => LIBELLE_GRAVITE[g].toLowerCase()).join(", ") : "",
    "plus récentes d'abord",
  ].filter(Boolean).join(" · ");

  return (
    <>
      <header className="topbar">
        <span className="topbar-title">Recette</span>
      </header>
      <main className="page" id="contenu">
        <h1 className="page-title">{statut === "corrigee" ? "À vérifier" : "Suivre les anomalies"}</h1>

        {envoyee && (
          <div className="alert alert-success" role="status" style={{ margin: "var(--sp-3) 0 var(--sp-5)" }}>
            <span className="alert-icon" aria-hidden="true">✓</span>
            <div>
              <p className="alert-title">Anomalie {nouvelle ? reference(nouvelle.numero) : ""} envoyée</p>
              <p>
                Elle apparaît en tête de liste avec le statut Nouvelle.
                {MESSAGES_ALERTE[alerte] ? ` ${MESSAGES_ALERTE[alerte]}` : ""}
              </p>
            </div>
          </div>
        )}

        <div className="filters">
          <fieldset className="filter-group">
            <legend>Statut</legend>
            <div className="chips">
              <Link className="chip" href={lien("", gravites)} aria-current={!statut ? "true" : undefined}>
                Tous <span className="count">{comptes.tous ?? 0}</span>
              </Link>
              {STATUTS.map((s) => (
                <Link key={s} className="chip" href={lien(s, gravites)} aria-current={statut === s ? "true" : undefined}>
                  <FormeStatut statut={s} /> {LIBELLE_STATUT[s]} <span className="count">{comptes[s] ?? 0}</span>
                </Link>
              ))}
            </div>
          </fieldset>
          <fieldset className="filter-group">
            <legend>Gravité</legend>
            <div className="chips">
              <Link className="chip" href={lien(statut, [])} aria-current={!gravites.length ? "true" : undefined}>
                Toutes
              </Link>
              {GRAVITES.map((g) => (
                <Link key={g} className="chip" href={lien(statut, basculer(g))} aria-current={gravites.includes(g) ? "true" : undefined}>
                  {LIBELLE_GRAVITE[g]}
                </Link>
              ))}
            </div>
          </fieldset>
        </div>

        {error ? (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon" aria-hidden="true">!</span>
            <div>
              <p className="alert-title">Liste indisponible</p>
              <p>Le service de données ne répond pas. Rechargez la page dans un instant.</p>
            </div>
          </div>
        ) : anomalies.length === 0 ? (
          <div className="empty">
            <p className="empty-title">Aucune anomalie</p>
            <p>{statut || gravites.length ? "Aucun résultat pour ces filtres." : "Rien à signaler pour l'instant."}</p>
            <Link className="btn btn-primary" href="/signaler">Signaler une anomalie</Link>
          </div>
        ) : (
          <>
            <p className="result-count" role="status">{resume}</p>
            <ul className="card-list">
              {anomalies.map((a) => (
                <li key={a.id}>
                  <Link className={`card${a.gravite === "bloquante" ? " is-bloquante" : ""}`} href={`/anomalies/${a.id}`}>
                    <div className="card-body">
                      <span className="card-id">{reference(a.numero)}</span>
                      <span className="card-title">{a.titre}</span>
                      <span className="badges">
                        <BadgeGravite gravite={a.gravite} />
                        <BadgeStatut statut={a.statut} />
                      </span>
                      <span className="meta">
                        {a.auteur} · <time dateTime={a.cree_le}>{formaterDate(a.cree_le)}</time>
                      </span>
                    </div>
                    <span className="card-chevron" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <Suspense><Tabbar /></Suspense>
    </>
  );
}
