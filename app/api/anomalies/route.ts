import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { envoyerAlerte } from "@/lib/alerte";
import { CHEMIN_CAPTURE, GRAVITES, LIMITES, estUuid, type Anomalie, type Gravite } from "@/lib/domaine";

export const dynamic = "force-dynamic";

type Corps = {
  id?: unknown;
  titre?: unknown;
  gravite?: unknown;
  etapes?: unknown;
  attendu?: unknown;
  obtenu?: unknown;
  auteur?: unknown;
  captures?: unknown;
};

const texte = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Crée une anomalie (la capture est déjà déposée dans Storage par le navigateur), puis alerte si bloquante. */
export async function POST(req: Request) {
  let corps: Corps;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ erreur: "Requête illisible" }, { status: 400 });
  }

  const champs = {
    titre: texte(corps.titre),
    etapes: texte(corps.etapes),
    attendu: texte(corps.attendu),
    obtenu: texte(corps.obtenu),
    auteur: texte(corps.auteur),
  };
  const erreurs: Record<string, string> = {};
  if (champs.titre.length < 3) erreurs.titre = "Le titre doit faire au moins 3 caractères.";
  if (!GRAVITES.includes(corps.gravite as Gravite)) erreurs.gravite = "Choisissez une gravité.";
  if (!champs.etapes) erreurs.etapes = "Décrivez les étapes pour reproduire.";
  if (!champs.attendu) erreurs.attendu = "Indiquez le résultat attendu.";
  if (!champs.obtenu) erreurs.obtenu = "Indiquez le résultat obtenu.";
  if (!champs.auteur) erreurs.auteur = "Indiquez votre nom.";
  for (const [k, max] of Object.entries(LIMITES)) {
    const v = champs[k as keyof typeof champs];
    if (v && v.length > max) erreurs[k] = `${max} caractères maximum.`;
  }
  if (!estUuid(corps.id)) erreurs.id = "Identifiant invalide.";
  const captures = Array.isArray(corps.captures) ? corps.captures : [];
  if (captures.length > 3 || !captures.every((c) => typeof c === "string" && CHEMIN_CAPTURE.test(c) && c.startsWith(`${corps.id}/`))) {
    erreurs.capture = "Capture invalide.";
  }
  if (Object.keys(erreurs).length) {
    return NextResponse.json({ erreur: "Formulaire incomplet", champs: erreurs }, { status: 422 });
  }

  const db = supabase();
  const { data, error } = await db
    .from("anomalies")
    .insert({ id: corps.id, gravite: corps.gravite, ...champs })
    .select()
    .single<Anomalie>();
  if (error || !data) {
    console.error("[anomalies] insertion impossible", error);
    const doublon = error?.code === "23505";
    return NextResponse.json(
      { erreur: doublon ? "Cette anomalie a déjà été envoyée." : "Enregistrement impossible, réessayez." },
      { status: doublon ? 409 : 500 },
    );
  }

  let captureOk = true;
  if (captures.length) {
    const { error: e } = await db
      .from("captures")
      .insert(captures.map((chemin) => ({ anomalie_id: data.id, chemin })));
    if (e) {
      captureOk = false;
      console.error("[anomalies] capture non rattachée", { id: data.id, e });
    }
  }

  const origine = new URL(req.url).origin;
  const alerte = await envoyerAlerte(data, `${origine}/anomalies/${data.id}`);

  return NextResponse.json({ id: data.id, alerte, captureOk }, { status: 201 });
}
