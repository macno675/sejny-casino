"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { Button, Input, Label } from "@/components/ui";
import { useCasinoStore } from "@/store/casino-store";

export default function RegisterPage() {
  const router = useRouter();
  const register = useCasinoStore((s) => s.register);
  const sessionUser = useCasinoStore((s) => s.sessionUser);
  const hydrated = useCasinoStore((s) => s.hydrated);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (hydrated && sessionUser) router.replace("/lobby");
  }, [hydrated, sessionUser, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await register(username, password, displayName);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/lobby");
  }

  return (
    <AuthShell
      title="Join the house"
      subtitle="Start with 2,500 coins, a welcome crest card, and an empty chest streak."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Optional"
          />
        </div>
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
            autoComplete="new-password"
            required
          />
        </div>
        {error && <p className="text-sm text-[#e08a96]">{error}</p>}
        <Button type="submit" variant="claim" className="w-full" disabled={pending}>
          {pending ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        Already registered?{" "}
        <Link href="/login" className="text-[var(--brass)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
