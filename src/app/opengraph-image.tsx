import { ImageResponse } from "next/og";

export const dynamic = "force-static";
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
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #fffcf8 0%, #fff9f4 50%, #fffaf5 100%)",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo/Branding */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontSize: "56px",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "#20181d",
              }}
            >
              Kuldeep
            </span>
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff7d4d 0%, #ff7d4d 100%)",
                marginBottom: "8px",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginLeft: "8px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "2px",
                background: "linear-gradient(90deg, rgba(255,125,77,0.9) 0%, rgba(169,140,255,0.45) 100%)",
              }}
            />
            <span
              style={{
                fontSize: "38px",
                fontStyle: "italic",
                color: "#ff7d4d",
              }}
            >
              Paul
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: "900px",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: "#20181d",
              margin: 0,
            }}
          >
            Building data-driven marketing systems that scale with AI
          </h1>
          <p
            style={{
              fontSize: "28px",
              color: "#635d65",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Head of Marketing at Maxim AI • MSc in Applied Data Science
          </p>
        </div>

        {/* Footer Tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "18px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#9b9399",
            fontFamily: "monospace",
          }}
        >
          <span>Issue 01</span>
          <span>/</span>
          <span>2026</span>
        </div>

        {/* Large ghosted background text */}
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            right: "40px",
            fontSize: "280px",
            fontWeight: 900,
            letterSpacing: "-0.08em",
            color: "#20181d",
            opacity: 0.04,
            lineHeight: 1,
          }}
        >
          KP
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
