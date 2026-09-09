"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { AmbientBackground } from "@/components/ambient-background";
import { Button } from "@/components/ui";
import { selectPlayer, useCasinoStore } from "@/store/casino-store";

export default function HomePage() {
  const router = useRouter();
  const player = useCasinoStore(selectPlayer);
  const hydrated = useCasinoStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && player) router.replace("/lobby");
  }, [hydrated, player, router]);

  return (
    <div className="relative min-h-screen overflow-hidden text-[var(--cream)]">
      <AmbientBackground />
      <motion.div
        aria-hidden
        className="absolute top-[18%] right-[8%] h-64 w-64 rounded-full border border-white/10"
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-[12%] left-[10%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,93,154,0.35),transparent_70%)] blur-2xl"
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-[var(--muted)] backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]" />
          Live lobby
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.05 }}
          className="max-w-3xl font-[family-name:var(--font-display)] text-6xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl"
        >
          SEJNY
          <span className="mt-3 block bg-[linear-gradient(120deg,#f5c542,#ff5d9a,#7c6cff)] bg-clip-text text-3xl tracking-[0.2em] text-transparent sm:text-4xl">
            CASINO
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-lg"
        >
          Glass tables, a daily chest, and cinematic collectible cards — paced
          for the long evening.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link href="/register">
            <Button variant="claim">Create account</Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
