import "server-only";
import { Resend } from "resend";
import type { Anomalie } from "./domaine";

export type ResultatAlerte = "envoyee" | "echec" | "non_configuree" | "non_requise";

const echapper = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Envoie l'alerte e-mail d'une anomalie bloquante. Ne lève jamais : renvoie un statut. */
export async function envoyerAlerte(a: Anomalie, lien: string): Promise<ResultatAlerte> {
  if (a.gravite !== "bloquante") return "non_requise";
  const cle = process.env.RESEND_API_KEY;
  const destinataire = process.env.ALERTE_EMAIL;
  if (!cle || !destinataire) {
    console.error("[alerte] RESEND_API_KEY ou ALERTE_EMAIL absente : e-mail non envoyé", { id: a.id });
    return "non_configuree";
  }
  try {
    const resend = new Resend(cle);
    const { error } = await resend.emails.send({
      from: process.env.ALERTE_EXPEDITEUR || "Recette <onboarding@resend.dev>",
      to: destinataire.split(",").map((s) => s.trim()).filter(Boolean),
      subject: `[Bloquante] ${a.titre}`,
      text: `Nouvelle anomalie bloquante signalée par ${a.auteur}.\n\n${a.titre}\n\nÉtapes :\n${a.etapes}\n\nAttendu :\n${a.attendu}\n\nObtenu :\n${a.obtenu}\n\nVoir l'anomalie : ${lien}`,
      html: `<p>Nouvelle anomalie <strong>bloquante</strong> signalée par ${echapper(a.auteur)}.</p>
<h2 style="font-size:18px">${echapper(a.titre)}</h2>
<p><strong>Étapes</strong><br>${echapper(a.etapes).replace(/\n/g, "<br>")}</p>
<p><strong>Attendu</strong><br>${echapper(a.attendu).replace(/\n/g, "<br>")}</p>
<p><strong>Obtenu</strong><br>${echapper(a.obtenu).replace(/\n/g, "<br>")}</p>
<p><a href="${echapper(lien)}">Voir l'anomalie</a></p>`,
    });
    if (error) {
      console.error("[alerte] échec Resend", { id: a.id, error });
      return "echec";
    }
    return "envoyee";
  } catch (e) {
    console.error("[alerte] exception Resend", { id: a.id, e });
    return "echec";
  }
}
