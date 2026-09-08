import { ImageResponse } from "next/og";

export function brandIcon(size: number, maskable = false) {
  const inset = maskable ? 0.22 : 0.16;
  const housingH = size * (1 - inset * 2) * 0.72;
  const housingW = housingH / 1.72;
  const lamp = housingW * 0.42;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07060a",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            width: housingW,
            height: housingH,
            background: "#101218",
            borderRadius: housingH,
            border: `${Math.max(2, size * 0.012)}px solid rgba(255,255,255,0.2)`,
            paddingTop: housingH * 0.08,
            paddingBottom: housingH * 0.08,
          }}
        >
          <div
            style={{
              width: lamp,
              height: lamp,
              borderRadius: lamp,
              background: "#ff3b3b",
            }}
          />
          <div
            style={{
              width: lamp,
              height: lamp,
              borderRadius: lamp,
              background: "#ffbf24",
            }}
          />
          <div
            style={{
              width: lamp,
              height: lamp,
              borderRadius: lamp,
              background: "#2ef28a",
            }}
          />
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
