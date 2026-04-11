import React from "react";
import { ImageResponse } from "@vercel/og";
import fs from "fs";
import path from "path";
import contentData from "../src/data/generated/content-data.json" assert { type: "json" };

const OUTPUT_DIR = path.join(process.cwd(), "public", "og-images");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const logoComponent = (size: "large" | "small" = "large") => {
  const fontSize = size === "large" ? 44 : 40;
  const dotSize = size === "large" ? 18 : 16;
  const lineWidth = size === "large" ? 32 : 28;
  const paulFontSize = size === "large" ? 22 : 20;
  const marginLeft = size === "large" ? 32 : 28;
  const marginTop = size === "large" ? -8 : -6;
  const gap = size === "large" ? 10 : 6;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: `${gap}px`,
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize,
            fontWeight: 600,
            letterSpacing: "-0.09em",
            color: "#20181d",
          }}
        >
          Kuldeep
        </span>
        <div
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.65) 30%, rgba(255,125,77,0.92) 31%, rgba(255,125,77,0.82) 100%)",
            border: "1px solid rgba(32,24,29,0.08)",
            marginBottom: "8px",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: `${gap}px`,
          marginLeft: `${marginLeft}px`,
          marginTop: `${marginTop}px`,
        }}
      >
        <div
          style={{
            width: lineWidth,
            height: 1,
            background:
              "linear-gradient(90deg, rgba(255,125,77,0), rgba(255,125,77,0.9), rgba(169,140,255,0.45))",
          }}
        />
        <span
          style={{
            fontFamily: "cursive",
            fontSize: paulFontSize,
            fontStyle: "italic",
            color: "#ff7d4d",
          }}
        >
          Paul
        </span>
      </div>
    </div>
  );
};

async function generateImage(jsx: React.ReactElement, filename: string) {
  const response = new ImageResponse(jsx, {
    width: 1200,
    height: 630,
  });

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`✓ Generated ${filename}`);
}

async function generateHomeOG() {
  await generateImage(
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
        <div style={{ display: "flex", gap: "16px" }}>
          {["Marketing", "AI", "Product"].map((tag, i) => (
            <div
              key={tag}
              style={{
                background:
                  i === 0
                    ? "rgba(255, 125, 77, 0.15)"
                    : i === 1
                      ? "rgba(169, 140, 255, 0.15)"
                      : "rgba(104, 213, 212, 0.15)",
                color:
                  i === 0
                    ? "#ff7d4d"
                    : i === 1
                      ? "#a98cff"
                      : "#68d5d4",
                padding: "8px 20px",
                borderRadius: "8px",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
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
          {logoComponent("large")}
          <div style={{ fontSize: 24, color: "#645760" }}>
            Portfolio, Blog & Case Studies
          </div>
        </div>
      </div>
    ),
    "home.png"
  );
}

async function generateJournalOG() {
  await generateImage(
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
          <div style={{ display: "flex", gap: "12px" }}>
            {["Marketing", "AI", "Growth"].map((tag, i) => (
              <div
                key={tag}
                style={{
                  background:
                    i === 0
                      ? "rgba(255, 125, 77, 0.15)"
                      : i === 1
                        ? "rgba(169, 140, 255, 0.15)"
                        : "rgba(104, 213, 212, 0.15)",
                  color:
                    i === 0
                      ? "#ff7d4d"
                      : i === 1
                        ? "#a98cff"
                        : "#68d5d4",
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

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
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
          {logoComponent("large")}
        </div>
      </div>
    ),
    "journal.png"
  );
}

async function generateCaseStudiesOG() {
  await generateImage(
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
            Case Studies
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {["Analytics", "AI", "Systems"].map((tag, i) => (
              <div
                key={tag}
                style={{
                  background:
                    i === 0
                      ? "rgba(169, 140, 255, 0.15)"
                      : i === 1
                        ? "rgba(255, 125, 77, 0.15)"
                        : "rgba(104, 213, 212, 0.15)",
                  color:
                    i === 0
                      ? "#a98cff"
                      : i === 1
                        ? "#ff7d4d"
                        : "#68d5d4",
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

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#20181d",
              lineHeight: 1.05,
              maxWidth: "1000px",
            }}
          >
            Real-world results
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#645760",
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            Case studies showcasing how I build scalable, data-driven marketing
            systems that enable small teams to drive measurable growth.
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
          {logoComponent("large")}
        </div>
      </div>
    ),
    "case-studies.png"
  );
}

async function generateBlogPostOGs() {
  for (const post of contentData.blogPosts) {
    const tags = Array.isArray(post.tags) ? post.tags.slice(0, 3) : [];
    await generateImage(
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
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#20181d",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Blog
            </span>
            <div style={{ display: "flex", gap: "12px" }}>
              {tags.map((tag, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255, 125, 77, 0.15)",
                    color: "#ff7d4d",
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
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "#20181d",
                lineHeight: 1.1,
                maxWidth: "1040px",
              }}
            >
              {post.title}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#645760",
                lineHeight: 1.4,
                maxWidth: "900px",
              }}
            >
              {post.excerpt.slice(0, 150)}
              {post.excerpt.length > 150 ? "..." : ""}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
                <span style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 40,
                  fontWeight: 600,
                  letterSpacing: "-0.09em",
                  color: "#20181d",
                }}>
                  Kuldeep
                </span>
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.65) 30%, rgba(255,125,77,0.92) 31%, rgba(255,125,77,0.82) 100%)",
                  border: "1px solid rgba(32,24,29,0.08)",
                  marginBottom: "8px",
                }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "28px", marginTop: "-6px" }}>
                <div style={{
                  width: 28,
                  height: 1,
                  background: "linear-gradient(90deg, rgba(255,125,77,0), rgba(255,125,77,0.9), rgba(169,140,255,0.45))",
                }} />
                <span style={{
                  fontFamily: "cursive",
                  fontSize: 20,
                  fontStyle: "italic",
                  color: "#ff7d4d",
                }}>
                  Paul
                </span>
              </div>
            </div>
            <div style={{ fontSize: 20, color: "#645760" }}>
              {post.date} · {post.readingTime}
            </div>
          </div>
        </div>
      ),
      `blog-${post.slug}.png`
    );
  }
}

async function generateCaseStudyOGs() {
  for (const caseStudy of contentData.caseStudies) {
    const tags = Array.isArray(caseStudy.tags) ? caseStudy.tags.slice(0, 3) : [];
    await generateImage(
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
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#20181d",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Case Study
            </span>
            <div style={{ display: "flex", gap: "12px" }}>
              {tags.map((tag, i) => (
                <div
                  key={i}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
              alignItems: "flex-end",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
                <span style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 40,
                  fontWeight: 600,
                  letterSpacing: "-0.09em",
                  color: "#20181d",
                }}>
                  Kuldeep
                </span>
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.65) 30%, rgba(255,125,77,0.92) 31%, rgba(255,125,77,0.82) 100%)",
                  border: "1px solid rgba(32,24,29,0.08)",
                  marginBottom: "8px",
                }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "28px", marginTop: "-6px" }}>
                <div style={{
                  width: 28,
                  height: 1,
                  background: "linear-gradient(90deg, rgba(255,125,77,0), rgba(255,125,77,0.9), rgba(169,140,255,0.45))",
                }} />
                <span style={{
                  fontFamily: "cursive",
                  fontSize: 20,
                  fontStyle: "italic",
                  color: "#ff7d4d",
                }}>
                  Paul
                </span>
              </div>
            </div>
            <div style={{ fontSize: 20, color: "#645760" }}>
              {caseStudy.date}
            </div>
          </div>
        </div>
      ),
      `case-study-${caseStudy.slug}.png`
    );
  }
}

async function main() {
  console.log("Generating OpenGraph image...\n");

  await generateHomeOG();
  // Only generate home OG image - used for all pages
  // await generateJournalOG();
  // await generateCaseStudiesOG();
  // await generateBlogPostOGs();
  // await generateCaseStudyOGs();

  console.log("\n✓ OpenGraph image generated successfully!");
  console.log(`  Output directory: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error("Error generating OG images:", error);
  process.exit(1);
});
