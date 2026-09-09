"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { Button, Input, Label } from "@/components/ui";
import { useCasinoStore, selectPlayer } from "@/store/casino-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useCasinoStore((s) => s.login);
  const player = useCasinoStore(selectPlayer);
  const hydrated = useCasinoStore((s) => s.hydrated);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (hydrated && player) router.replace("/lobby");
  }, [hydrated, player, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await login(username, password);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/lobby");
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to return to the felt.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="text-sm text-[#e08a96]">{error}</p>}
        <Button type="submit" variant="claim" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        New to the house?{" "}
        <Link href="/register" className="text-[var(--brass)] hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
