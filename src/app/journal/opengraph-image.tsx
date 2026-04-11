import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Journal | Kuldeep Paul";
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
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#20181d",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Blog
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "rgba(255, 125, 77, 0.15)",
                color: "#ff7d4d",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Marketing
            </div>
            <div
              style={{
                background: "rgba(169, 140, 255, 0.15)",
                color: "#a98cff",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              AI
            </div>
            <div
              style={{
                background: "rgba(104, 213, 212, 0.15)",
                color: "#68d5d4",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Growth
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#20181d",
              lineHeight: 1.05,
              maxWidth: "1000px",
            }}
          >
            Thoughts on AI-native marketing
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#645760",
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            Practical notes on building marketing that matches the pace of AI
            product development.
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
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#20181d",
              }}
            >
              Kuldeep Paul
            </div>
            <div
              style={{
                fontSize: 20,
                color: "#645760",
              }}
            >
              kuldeep.cc/journal
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
