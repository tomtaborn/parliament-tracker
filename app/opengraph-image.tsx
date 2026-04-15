import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Parliament Tracker — Select Committee Accountability";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1A1A18",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <span style={{ color: "#C41E3A", fontSize: "18px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Parliament
          </span>
          <span style={{ color: "#FAFAF8", fontSize: "18px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Tracker
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            color: "#FAFAF8",
            fontSize: "64px",
            fontWeight: 600,
            lineHeight: 1.05,
            maxWidth: "800px",
          }}
        >
          Parliament&apos;s ignored homework.
        </div>

        {/* Subhead */}
        <div
          style={{
            color: "#A0A09C",
            fontSize: "24px",
            marginTop: "24px",
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Government departments ranked by overdue parliamentary responses.
        </div>

        {/* Red accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "8px",
            background: "#C41E3A",
          }}
        />
      </div>
    ),
    size
  );
}
