import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Kuldeep Paul | Marketing, AI, and Product";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #fff8ef 0%, #fff2df 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "rgba(255, 125, 77, 0.15)",
              color: "#ff7d4d",
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Marketing
          </div>
          <div
            style={{
              background: "rgba(169, 140, 255, 0.15)",
              color: "#a98cff",
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            AI
          </div>
          <div
            style={{
              background: "rgba(104, 213, 212, 0.15)",
              color: "#68d5d4",
              padding: "8px 20px",
              borderRadius: "8px",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Product
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#20181d",
              lineHeight: 1,
              maxWidth: "1000px",
            }}
          >
            Kuldeep Paul
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#645760",
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            Building data-driven marketing systems that scale with AI. Head of
            Marketing at Maxim AI.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#20181d",
            }}
          >
            kuldeep.cc
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#645760",
            }}
          >
            Portfolio, Blog & Case Studies
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
