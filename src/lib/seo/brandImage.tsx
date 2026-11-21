import { ImageResponse } from "next/og";

// Brand cards drawn with text and the site colors only (no photographs, no generated imagery).
const INK = "#0B0C15";
const AMBER = "#F6B312";
const ON_INK = "#F4F5FA";
const MUTED = "#A9AEC6";

export const ogSize = { width: 1200, height: 630 };

export function ogImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          padding: "72px 80px",
          borderLeft: `18px solid ${AMBER}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", fontSize: 40, fontWeight: 800, color: ON_INK, letterSpacing: 4, textTransform: "uppercase", lineHeight: 1.1 }}>
          <span>Imperium</span>
          <span style={{ color: AMBER }}>Solutions</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, color: ON_INK, lineHeight: 1.05, letterSpacing: -1 }}>
            Managed support and back office teams
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: MUTED }}>
            Customer support, virtual assistance, and operations, run on your hours.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: AMBER, fontWeight: 700 }}>imperiumsolutionsinc.com</div>
      </div>
    ),
    { ...ogSize },
  );
}

export function logoImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: INK,
          borderBottom: `20px solid ${AMBER}`,
          fontSize: 66,
          fontWeight: 800,
          color: ON_INK,
          letterSpacing: 3,
          textTransform: "uppercase",
          lineHeight: 1.15,
        }}
      >
        <span>Imperium</span>
        <span style={{ color: AMBER, fontSize: 56 }}>Solutions</span>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
