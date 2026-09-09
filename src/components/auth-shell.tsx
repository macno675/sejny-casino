"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AmbientBackground } from "@/components/ambient-background";
import { Panel } from "@/components/ui";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <AmbientBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative z-10 w-full max-w-md"
      >
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#7c6cff,#ff5d9a)] text-sm font-bold text-white">
            S
          </span>
          <span className="font-[family-name:var(--font-display)] text-xl tracking-[0.18em] text-white">
            SEJNY
          </span>
        </Link>
        <Panel>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
            {title}
          </h1>
          <p className="mb-6 mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
          {children}
        </Panel>
      </motion.div>
    </div>
  );
}
