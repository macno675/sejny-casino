"use client";

import { useEffect } from "react";
import { useCasinoStore } from "@/store/casino-store";

export function StoreHydration({ children }: { children: React.ReactNode }) {
  const hydrated = useCasinoStore((s) => s.hydrated);
  const bootstrap = useCasinoStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--cream)]">
        <p className="font-[family-name:var(--font-display)] text-2xl tracking-[0.2em] text-[var(--gold)]">
          SEJNY
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
