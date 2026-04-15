import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#C41E3A",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "24px",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "96px",
            fontWeight: 700,
            fontFamily: "serif",
            lineHeight: 1,
          }}
        >
          P
        </span>
      </div>
    ),
    size
  );
}
