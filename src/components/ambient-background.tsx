"use client";

export function AmbientBackground() {
  return (
    <div className="ambient-root" aria-hidden>
      <div className="ambient-grid" />
      <div
        className="ambient-orb"
        style={{
          width: 320,
          height: 320,
          top: "6%",
          left: "6%",
          background: "rgba(139,92,246,0.35)",
          animationDelay: "0s",
        }}
      />
      <div
        className="ambient-orb"
        style={{
          width: 260,
          height: 260,
          top: "52%",
          right: "4%",
          background: "rgba(240,193,74,0.16)",
          animationDelay: "2.5s",
        }}
      />
      <div
        className="ambient-orb"
        style={{
          width: 200,
          height: 200,
          bottom: "4%",
          left: "38%",
          background: "rgba(45,212,168,0.12)",
          animationDelay: "5s",
        }}
      />
    </div>
  );
}
