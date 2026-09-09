"use client";

import { FormEvent, useMemo, useState } from "react";
import { AVATARS } from "@/lib/game-data";
import { formatCoins, xpForLevel, xpProgress } from "@/lib/utils";
import { selectPlayer, useCasinoStore } from "@/store/casino-store";
import { Button, Input, Label, Panel, Toggle } from "@/components/ui";

export default function SettingsPage() {
  const player = useCasinoStore(selectPlayer);
  const updateSettings = useCasinoStore((s) => s.updateSettings);
  const changePassword = useCasinoStore((s) => s.changePassword);
  const [tab, setTab] = useState<"profile" | "preferences" | "security">(
    "profile",
  );
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [currentPw, setCurrentPw] = useState("");
  const [nextPw, setNextPw] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  const name =
    nameDraft ?? player?.settings.displayName ?? player?.displayName ?? "";

  const progress = useMemo(
    () => (player ? xpProgress(player.xp, player.level) : 0),
    [player],
  );

  if (!player) return null;

  function saveProfile(e: FormEvent) {
    e.preventDefault();
    const next = name.trim() || player!.displayName;
    updateSettings({ displayName: next });
    setNameDraft(null);
    setSaved("Profile updated");
    window.setTimeout(() => setSaved(null), 2000);
  }

  async function onPassword(e: FormEvent) {
    e.preventDefault();
    const result = await changePassword(currentPw, nextPw);
    if (!result.ok) {
      setPwMsg(result.error);
      return;
    }
    setPwMsg("Password changed");
    setCurrentPw("");
    setNextPw("");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-white">
          Account
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Identity, preferences, and security for @{player.username}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["profile", "Profile"],
            ["preferences", "Preferences"],
            ["security", "Security"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              tab === id
                ? "bg-white/15 text-white"
                : "bg-white/5 text-[var(--muted)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <Panel>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={name}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder={player.displayName}
                />
              </div>
              <div>
                <Label>Avatar</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => updateSettings({ avatarId: avatar.id })}
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold text-[#061018] transition ${
                        player.settings.avatarId === avatar.id
                          ? "ring-2 ring-white scale-110"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      style={{ background: avatar.color }}
                      title={avatar.label}
                    >
                      {avatar.label.slice(0, 1)}
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" variant="claim">
                Save profile
              </Button>
              {saved && (
                <p className="text-sm text-[var(--cyan)]">{saved}</p>
              )}
            </form>
          </Panel>

          <Panel>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Progress
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-white">
              Level {player.level}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#7c6cff,#2dd4a8)]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {formatCoins(player.xp)} /{" "}
              {formatCoins(xpForLevel(player.level + 1))} XP
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <MiniStat label="Coins" value={formatCoins(player.coins)} />
              <MiniStat
                label="Cards"
                value={String(player.ownedCardIds.length)}
              />
              <MiniStat
                label="Games"
                value={String(player.stats.gamesPlayed)}
              />
              <MiniStat
                label="Biggest win"
                value={formatCoins(player.stats.biggestWin)}
              />
            </div>
          </Panel>
        </div>
      )}

      {tab === "preferences" && (
        <Panel className="space-y-3">
          <Toggle
            label="Sound cues"
            description="Soft feedback when you win or open the chest"
            checked={player.settings.sound}
            onChange={(sound) => updateSettings({ sound })}
          />
          <Toggle
            label="Haptic pulse"
            description="Subtle vibration cues on supported devices"
            checked={player.settings.haptics}
            onChange={(haptics) => updateSettings({ haptics })}
          />
          <Toggle
            label="Reduce motion"
            description="Shorten spins, deals, and floating effects"
            checked={player.settings.reducedMotion}
            onChange={(reducedMotion) => updateSettings({ reducedMotion })}
          />
          <Toggle
            label="Win toasts"
            description="Show brief celebrations after payouts"
            checked={player.settings.winToasts}
            onChange={(winToasts) => updateSettings({ winToasts })}
          />
          <Toggle
            label="Appear on leaderboard"
            description="Let other local players see your rank"
            checked={player.settings.publicOnLeaderboard}
            onChange={(publicOnLeaderboard) =>
              updateSettings({ publicOnLeaderboard })
            }
          />
        </Panel>
      )}

      {tab === "security" && (
        <Panel>
          <form onSubmit={onPassword} className="max-w-md space-y-4">
            <div>
              <Label htmlFor="current">Current password</Label>
              <Input
                id="current"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="next">New password</Label>
              <Input
                id="next"
                type="password"
                value={nextPw}
                onChange={(e) => setNextPw(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="neon">
              Update password
            </Button>
            {pwMsg && (
              <p
                className={`text-sm ${
                  pwMsg.includes("changed")
                    ? "text-[var(--cyan)]"
                    : "text-[var(--danger)]"
                }`}
              >
                {pwMsg}
              </p>
            )}
          </form>
          <p className="mt-6 text-xs text-[var(--muted)]">
            Accounts are stored in this browser. Clearing site data removes
            progress.
          </p>
        </Panel>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
