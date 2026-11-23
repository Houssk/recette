import Link from "next/link";

export default function Introuvable() {
  return (
    <>
      <header className="topbar"><span className="topbar-title">Recette</span></header>
      <main className="page" id="contenu">
        <div className="empty">
          <p className="empty-title">Page introuvable</p>
          <p>Cette anomalie n&apos;existe pas ou le lien est incomplet.</p>
          <Link className="btn btn-primary" href="/suivre">Retour à la liste</Link>
        </div>
      </main>
    </>
  );
}
