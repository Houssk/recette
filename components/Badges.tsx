import { LIBELLE_GRAVITE, LIBELLE_STATUT, type Gravite, type Statut } from "@/lib/domaine";

const FORME_GRAVITE: Record<Gravite, string> = { bloquante: "▲", majeure: "◆", mineure: "▼" };

export function BadgeGravite({ gravite }: { gravite: Gravite }) {
  return (
    <span className={`badge badge-grave badge-grave-${gravite}`}>
      <span className="shape" aria-hidden="true">{FORME_GRAVITE[gravite]}</span>
      {LIBELLE_GRAVITE[gravite]}
    </span>
  );
}

export function FormeStatut({ statut }: { statut: Statut }) {
  if (statut === "verifiee") return <span aria-hidden="true">✓</span>;
  const cls = { nouvelle: "s-nouvelle", en_cours: "s-encours", corrigee: "s-corrigee" }[statut];
  return <span className={`shape ${cls}`} aria-hidden="true" />;
}

export function BadgeStatut({ statut }: { statut: Statut }) {
  const cls = statut === "en_cours" ? "en-cours" : statut;
  return (
    <span className={`badge badge-statut badge-statut-${cls}`}>
      {statut === "verifiee" ? <span className="shape" aria-hidden="true">✓</span> : <FormeStatut statut={statut} />}
      {LIBELLE_STATUT[statut]}
    </span>
  );
}
