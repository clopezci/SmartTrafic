"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/format";

export function Bento({
  children,
  className,
  span,
  glow,
}: {
  children: ReactNode;
  className?: string;
  span?: string;
  glow?: "green" | "amber" | "red" | "none";
}) {
  return (
    <section
      className={cn(
        "bento relative overflow-hidden p-5 md:p-6",
        span,
        glow === "green" && "shadow-[0_0_40px_-18px_rgba(61,255,138,0.55)]",
        glow === "amber" && "shadow-[0_0_40px_-18px_rgba(255,176,32,0.5)]",
        glow === "red" && "shadow-[0_0_40px_-18px_rgba(255,77,77,0.45)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="kicker">{children}</p>;
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="kicker">{label}</p>
      <p className="mt-2 font-display text-3xl tracking-tight text-white md:text-4xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-sm text-[var(--mute)]">{hint}</p> : null}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
}) {
  const map = {
    neutral: "bg-white/8 text-white/80",
    green: "bg-[rgba(61,255,138,0.12)] text-[var(--go)]",
    amber: "bg-[rgba(255,176,32,0.14)] text-[var(--wait)]",
    red: "bg-[rgba(255,77,77,0.14)] text-[var(--stop)]",
    blue: "bg-[rgba(110,168,255,0.14)] text-[var(--info)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  href,
  variant = "primary",
  type = "button",
  className,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  className?: string;
}) {
  const styles = {
    primary:
      "bg-[var(--go)] text-[#04210f] hover:brightness-110 shadow-[0_0_24px_-8px_rgba(61,255,138,0.8)]",
    ghost: "bg-white/6 text-white hover:bg-white/10 border border-white/10",
    danger: "bg-[var(--stop)] text-white hover:brightness-110",
  };
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition",
    styles[variant],
    className,
  );
  if (href) {
    if (href.startsWith("/")) {
      return (
        <Link className={cls} href={href}>
          {children}
        </Link>
      );
    }
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} type={type}>
      {children}
    </button>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  hint,
  readOnly,
  options,
  textarea,
  required,
}: {
  label: string;
  name?: string;
  defaultValue?: string;
  type?: string;
  hint?: string;
  readOnly?: boolean;
  options?: { value: string; label: string }[];
  textarea?: boolean;
  required?: boolean;
}) {
  const box =
    "w-full rounded-xl border border-white/10 bg-white/4 px-3 py-2.5 text-sm text-white outline-none ring-[var(--go)] focus:ring-2";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-[var(--mute)]">{label}</span>
      {options ? (
        <select
          className={box}
          defaultValue={defaultValue}
          disabled={readOnly}
          name={name}
          required={required}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          className={`${box} min-h-[88px]`}
          defaultValue={defaultValue}
          name={name}
          readOnly={readOnly}
          required={required}
        />
      ) : (
        <input
          className={box}
          defaultValue={defaultValue}
          name={name}
          readOnly={readOnly}
          required={required}
          type={type}
        />
      )}
      {hint ? (
        <span className="mt-1 block text-[11px] text-[var(--mute)]">{hint}</span>
      ) : null}
    </label>
  );
}

export function Light({
  color,
  size = 14,
}: {
  color: "red" | "amber" | "green" | "flashing_amber" | "off";
  size?: number;
}) {
  const bg =
    color === "green"
      ? "var(--go)"
      : color === "red"
        ? "var(--stop)"
        : color === "off"
          ? "#2a2f38"
          : "var(--wait)";
  const style: CSSProperties = {
    width: size,
    height: size,
    background: bg,
    animation: color === "flashing_amber" ? "pulse-dot 1s infinite" : undefined,
    boxShadow:
      color === "off" ? "none" : `0 0 ${Math.round(size * 1.2)}px ${bg}`,
  };
  return <span className="inline-block rounded-full" style={style} />;
}
