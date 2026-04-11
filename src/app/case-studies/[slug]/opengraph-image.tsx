import { ImageResponse } from "next/og";
import { getCaseStudy } from "@/lib/content";

export const runtime = "edge";

export const alt = "Case Study";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "#fff8ef",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Case Study Not Found
        </div>
      ),
      {
        ...size,
      }
    );
  }

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
              fontSize: 24,
              fontWeight: 600,
              color: "#20181d",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Case Study
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            {caseStudy.tags.slice(0, 3).map((tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(169, 140, 255, 0.15)",
                  color: "#a98cff",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#20181d",
              lineHeight: 1.1,
              maxWidth: "1040px",
            }}
          >
            {caseStudy.title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#645760",
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            {caseStudy.description.slice(0, 150)}
            {caseStudy.description.length > 150 ? "..." : ""}
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
              kuldeep.cc
            </div>
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#645760",
            }}
          >
            {caseStudy.date}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
