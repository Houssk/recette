"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Tabbar() {
  const chemin = usePathname();
  const params = useSearchParams();
  const [aVerifier, setAVerifier] = useState<number | null>(null);

  useEffect(() => {
    supabase()
      .from("anomalies")
      .select("id", { count: "exact", head: true })
      .eq("statut", "corrigee")
      .then(({ count }) => setAVerifier(count ?? null));
  }, [chemin, params]);

  const surVerifier = chemin === "/suivre" && params.get("statut") === "corrigee";
  const courant = (actif: boolean) => (actif ? ("page" as const) : undefined);

  return (
    <nav className="tabbar" aria-label="Navigation principale">
      <Link className="tab" href="/signaler" aria-current={courant(chemin === "/signaler")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
        Signaler
      </Link>
      <Link className="tab" href="/suivre" aria-current={courant(chemin === "/suivre" && !surVerifier)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1.2" fill="currentColor" /><circle cx="4" cy="12" r="1.2" fill="currentColor" /><circle cx="4" cy="18" r="1.2" fill="currentColor" /></svg>
        Suivre
      </Link>
      <Link className="tab" href="/suivre?statut=corrigee" aria-current={courant(surVerifier)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" /></svg>
        À vérifier
        {aVerifier ? (
          <span className="tab-count">
            {aVerifier}
            <span className="visually-hidden"> en attente</span>
          </span>
        ) : null}
      </Link>
    </nav>
  );
}
