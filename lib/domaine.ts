export const GRAVITES = ["bloquante", "majeure", "mineure"] as const;
export type Gravite = (typeof GRAVITES)[number];

export const STATUTS = ["nouvelle", "en_cours", "corrigee", "verifiee"] as const;
export type Statut = (typeof STATUTS)[number];

export const LIBELLE_GRAVITE: Record<Gravite, string> = {
  bloquante: "Bloquante",
  majeure: "Majeure",
  mineure: "Mineure",
};

export const LIBELLE_STATUT: Record<Statut, string> = {
  nouvelle: "Nouvelle",
  en_cours: "En cours",
  corrigee: "Corrigée",
  verifiee: "Vérifiée",
};

export type Anomalie = {
  id: string;
  numero: number;
  titre: string;
  gravite: Gravite;
  etapes: string;
  attendu: string;
  obtenu: string;
  statut: Statut;
  auteur: string;
  cree_le: string;
  maj_le: string;
};

export type Historique = {
  id: number;
  anomalie_id: string;
  ancien: Statut | null;
  nouveau: Statut;
  commentaire: string | null;
  auteur: string;
  cree_le: string;
};

export const LIMITES = {
  titre: 200,
  etapes: 5000,
  attendu: 2000,
  obtenu: 2000,
  auteur: 100,
  commentaire: 2000,
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const estUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);
export const CHEMIN_CAPTURE = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function formaterDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(new Date(iso));
}

export const reference = (numero: number) => `A-${String(numero).padStart(3, "0")}`;
