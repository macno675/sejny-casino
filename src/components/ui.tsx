import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "neon" | "claim";
}) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition duration-300 disabled:cursor-not-allowed disabled:opacity-40",
        variant === "primary" &&
          "bg-white/10 text-[var(--cream)] ring-1 ring-white/15 hover:bg-white/15",
        variant === "neon" &&
          "neon-ring bg-[linear-gradient(120deg,rgba(255,93,154,0.2),rgba(124,108,255,0.25))] text-[var(--cream)] hover:brightness-110",
        variant === "claim" &&
          "bg-[linear-gradient(120deg,#2dd4a8,#5bb8ff)] text-[#041018] shadow-[0_0_28px_rgba(45,212,168,0.35)] hover:brightness-105",
        variant === "ghost" &&
          "border border-white/10 bg-transparent text-[var(--muted)] hover:border-white/20 hover:text-[var(--cream)]",
        variant === "danger" && "bg-[#ff5d7a]/20 text-[#ff8da2] hover:bg-[#ff5d7a]/30",
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-[var(--cream)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--violet)]/60 focus:ring-2 focus:ring-[var(--violet)]/20",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]"
    >
      {children}
    </label>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-3xl p-5", className)}>{children}</div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.05]"
    >
      <span>
        <span className="block text-sm font-medium text-[var(--cream)]">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs text-[var(--muted)]">
            {description}
          </span>
        )}
      </span>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition",
          checked ? "bg-[var(--cyan)]" : "bg-white/15",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition",
            checked && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
