import { Suspense } from "react";
import FormulaireSignaler from "@/components/FormulaireSignaler";
import Tabbar from "@/components/Tabbar";

export const metadata = { title: "Signaler une anomalie" };

export default function Signaler() {
  return (
    <>
      <header className="topbar">
        <span className="topbar-title">Recette</span>
      </header>
      <main className="page" id="contenu">
        <h1 className="page-title">Signaler une anomalie</h1>
        <p className="page-lead">
          Les champs marqués <span aria-hidden="true">*</span>
          <span className="visually-hidden">d&apos;un astérisque</span> sont obligatoires.
        </p>
        <FormulaireSignaler />
      </main>
      <Suspense><Tabbar /></Suspense>
    </>
  );
}
