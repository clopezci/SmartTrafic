"use client";

function niceMax(n: number) {
  if (n <= 10) return 10;
  const p = 10 ** Math.floor(Math.log10(n));
  return Math.ceil(n / p) * p;
}

export function Sparkline({
  data,
  color = "var(--go)",
}: {
  data: number[];
  color?: string;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const w = 88;
  const h = 28;
  const p = 2;
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = p + (i * (w - 2 * p)) / Math.max(data.length - 1, 1);
    const y = h - p - ((v - min) / span) * (h - 2 * p);
    return `${x},${y}`;
  });
  const area = `2,${h} ${pts.join(" ")} ${w - 2},${h}`;
  return (
    <svg className="block" height={h} viewBox={`0 0 ${w} ${h}`} width={w}>
      <polygon fill={color} fillOpacity="0.16" points={area} />
      <polyline
        fill="none"
        points={pts.join(" ")}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function StackedArea({
  cats,
  series,
}: {
  cats: string[];
  series: { key: string; color: string; values: number[] }[];
}) {
  const w = 640;
  const h = 188;
  const pl = 28;
  const pr = 8;
  const pt = 10;
  const pb = 22;
  const totals = cats.map((_, i) => series.reduce((s, row) => s + row.values[i], 0));
  const max = niceMax(Math.max(...totals, 1));
  const innerW = w - pl - pr;
  const innerH = h - pt - pb;
  const x = (i: number) => pl + (i * innerW) / Math.max(cats.length - 1, 1);
  const y = (v: number) => pt + innerH - (v / max) * innerH;

  const stacked = series.map((row, si) =>
    row.values.map((v, i) => v + series.slice(0, si).reduce((s, r) => s + r.values[i], 0)),
  );

  return (
    <svg className="h-[188px] w-full" viewBox={`0 0 ${w} ${h}`}>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line
            stroke="rgba(255,255,255,0.08)"
            x1={pl}
            x2={w - pr}
            y1={y(max * t)}
            y2={y(max * t)}
          />
          <text fill="#9aa0b4" fontSize="9" x="2" y={y(max * t) + 3}>
            {Math.round(max * t)}
          </text>
        </g>
      ))}
      {[...series].reverse().map((row, ri) => {
        const si = series.length - 1 - ri;
        const top = stacked[si];
        const bot = si === 0 ? cats.map(() => 0) : stacked[si - 1];
        const d = [
          ...top.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`),
          ...[...bot]
            .reverse()
            .map((v, i) => `L${x(bot.length - 1 - i)},${y(v)}`),
          "Z",
        ].join(" ");
        return <path d={d} fill={row.color} fillOpacity={0.55} key={row.key} />;
      })}
      {cats.map((c, i) =>
        i % 2 === 0 ? (
          <text fill="#9aa0b4" fontSize="9" key={c} textAnchor="middle" x={x(i)} y={h - 6}>
            {c}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export function Donut({
  slices,
}: {
  slices: { name: string; value: number; fill: string }[];
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 46;
  const ir = 28;
  const cx = 58;
  const cy = 58;
  let acc = 0;
  const tau = Math.PI * 2;
  const start = -Math.PI / 2;

  function arc(a0: number, a1: number, radius: number) {
    return [
      cx + radius * Math.cos(a0),
      cy + radius * Math.sin(a0),
      cx + radius * Math.cos(a1),
      cy + radius * Math.sin(a1),
    ];
  }

  return (
    <div className="flex items-center gap-4">
      <svg className="shrink-0" height="116" viewBox="0 0 116 116" width="116">
        {slices.map((s) => {
          const a0 = start + acc * tau;
          acc += s.value / total;
          const a1 = start + acc * tau;
          const large = a1 - a0 > Math.PI ? 1 : 0;
          const [x0, y0, x1, y1] = arc(a0, a1, r);
          const [ix0, iy0, ix1, iy1] = arc(a1, a0, ir);
          const d = `M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1} L${ix1} ${iy1} A${ir} ${ir} 0 ${large} 0 ${ix0} ${iy0} Z`;
          return <path d={d} fill={s.fill} key={s.name} />;
        })}
        <text fill="#f4f6fb" fontSize="13" fontWeight="700" textAnchor="middle" x={cx} y={cy - 2}>
          {total}%
        </text>
        <text fill="#9aa0b4" fontSize="8" textAnchor="middle" x={cx} y={cy + 12}>
          mix
        </text>
      </svg>
      <ul className="space-y-1.5 text-[11px]">
        {slices.map((s) => (
          <li className="flex items-center gap-2 text-white/80" key={s.name}>
            <span className="h-2 w-2 rounded-full" style={{ background: s.fill }} />
            <span className="w-[4.5rem]">{s.name}</span>
            <span className="font-medium text-white">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GroupedBars({
  rows,
}: {
  rows: { cruce: string; adaptativo: number; fijo: number }[];
}) {
  const max = 45;
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.cruce}>
          <div className="mb-1 flex justify-between text-[11px] text-white/70">
            <span>{r.cruce}</span>
            <span className="text-[var(--go)]">{r.adaptativo}s</span>
          </div>
          <div className="relative h-3.5 overflow-hidden rounded-full bg-white/6">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white/18"
              style={{ width: `${(r.fijo / max) * 100}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--go)]"
              style={{ width: `${(r.adaptativo / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
      <div className="flex gap-3 pt-1 text-[10px] text-[var(--mute)]">
        <span className="inline-flex items-center gap-1">
          <i className="h-1.5 w-3 rounded-full bg-[var(--go)]" /> adaptativo
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-1.5 w-3 rounded-full bg-white/25" /> ciclo fijo 45 s
        </span>
      </div>
    </div>
  );
}

export function MultiLine({
  cats,
  series,
}: {
  cats: string[];
  series: { key: string; color: string; values: number[] }[];
}) {
  const w = 520;
  const h = 168;
  const pl = 26;
  const pr = 8;
  const pt = 8;
  const pb = 22;
  const max = 100;
  const innerW = w - pl - pr;
  const innerH = h - pt - pb;
  const x = (i: number) => pl + (i * innerW) / Math.max(cats.length - 1, 1);
  const y = (v: number) => pt + innerH - (v / max) * innerH;

  return (
    <svg className="h-[168px] w-full" viewBox={`0 0 ${w} ${h}`}>
      {[0, 20, 40, 60, 80, 100].map((t) => (
        <g key={t}>
          <line
            stroke="rgba(255,255,255,0.07)"
            x1={pl}
            x2={w - pr}
            y1={y(t)}
            y2={y(t)}
          />
          {t % 40 === 0 ? (
            <text fill="#9aa0b4" fontSize="9" x="2" y={y(t) + 3}>
              {t}
            </text>
          ) : null}
        </g>
      ))}
      {series.map((row) => (
        <polyline
          fill="none"
          key={row.key}
          points={row.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
          stroke={row.color}
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      ))}
      {cats.map((c, i) => (
        <text fill="#9aa0b4" fontSize="8" key={c} textAnchor="middle" x={x(i)} y={h - 5}>
          {c.replace("Mar ", "")}
        </text>
      ))}
    </svg>
  );
}

export function Heatmap({
  hours,
  rows,
}: {
  hours: string[];
  rows: { cruce: string; vals: number[] }[];
}) {
  const color = (v: number) => {
    if (v < 0.35) return "color-mix(in srgb, var(--go) 42%, #12141c)";
    if (v < 0.65) return "color-mix(in srgb, var(--wait) 55%, #12141c)";
    return "color-mix(in srgb, var(--stop) 70%, #12141c)";
  };
  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `52px repeat(${hours.length}, minmax(14px, 1fr))` }}
      >
        <span />
        {hours.map((h) => (
          <span className="text-center text-[8px] text-[var(--mute)]" key={h}>
            {h}
          </span>
        ))}
        {rows.map((r) => (
          <div className="contents" key={r.cruce}>
            <span className="self-center text-[10px] text-white/70">{r.cruce}</span>
            {r.vals.map((v, i) => (
              <span
                className="aspect-square rounded-[3px]"
                key={`${r.cruce}-${hours[i]}`}
                style={{ background: color(v) }}
                title={`${r.cruce} ${hours[i]}h · congestión ${Math.round(v * 100)}%`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HBars({ rows }: { rows: { modo: string; h: number }[] }) {
  const max = Math.max(...rows.map((r) => r.h), 1);
  const colors = ["var(--go)", "var(--info)", "var(--wait)", "var(--stop)"];
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.modo}>
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="text-white/75">{r.modo}</span>
            <span className="text-white">{r.h} h</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.h / max) * 100}%`, background: colors[i % colors.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Columns({
  rows,
}: {
  rows: { mes: string; cop: number }[];
}) {
  const max = Math.max(...rows.map((r) => r.cop), 1);
  return (
    <div className="flex h-[148px] items-end gap-2">
      {rows.map((r) => (
        <div className="flex flex-1 flex-col items-center gap-1" key={r.mes}>
          <span className="text-[10px] text-[var(--go)]">{r.cop}</span>
          <div
            className="w-full rounded-t-md bg-[linear-gradient(180deg,var(--go),color-mix(in_srgb,var(--go)_30%,#12141c))]"
            style={{ height: `${(r.cop / max) * 110}px` }}
          />
          <span className="text-[9px] text-[var(--mute)]">{r.mes}</span>
        </div>
      ))}
    </div>
  );
}
