export function SignalMark({
  lit = "cycle",
  size = 28,
}: {
  lit?: "red" | "wait" | "go" | "cycle";
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className={`signal-mark ${lit === "cycle" ? "is-cycle" : ""}`}
      data-lit={lit}
      style={{ width: size, height: Math.round(size * 1.72) }}
    >
      <i className="signal-lamp is-stop" />
      <i className="signal-lamp is-wait" />
      <i className="signal-lamp is-go" />
    </span>
  );
}

export function BrandMark({
  size = 28,
  word = true,
}: {
  size?: number;
  word?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <SignalMark size={size} />
      {word ? (
        <span className="font-display text-lg leading-none text-white md:text-xl">
          SmartTrafic
        </span>
      ) : null}
    </span>
  );
}
