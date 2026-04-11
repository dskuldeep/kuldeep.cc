import { ImageResponse } from "next/og";
import { getBlogPost, getBlogPosts } from "@/lib/content";

export const dynamic = "force-static";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return new ImageResponse(
      <div style={{ display: "flex" }}>Post not found</div>,
      { ...size }
    );
  }

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
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "38px",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "#20181d",
              }}
            >
              Kuldeep
            </span>
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#ff7d4d",
                marginBottom: "6px",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#9b9399",
              fontFamily: "monospace",
              paddingLeft: "20px",
              borderLeft: "2px solid #e8e4e6",
            }}
          >
            JOURNAL
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            maxWidth: "1000px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: "68px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#20181d",
              margin: 0,
            }}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p
              style={{
                fontSize: "24px",
                color: "#635d65",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {post.excerpt.slice(0, 150)}...
            </p>
          )}
        </div>

        {/* Footer with date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "#9b9399",
              fontFamily: "monospace",
            }}
          >
            {post.date}
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "#9b9399",
              background: "rgba(255, 125, 77, 0.1)",
              padding: "8px 20px",
              borderRadius: "24px",
              border: "1px solid rgba(255, 125, 77, 0.2)",
            }}
          >
            Blog Post
          </div>
        </div>

        {/* Large ghosted background text */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "40px",
            fontSize: "240px",
            fontWeight: 900,
            letterSpacing: "-0.08em",
            color: "#20181d",
            opacity: 0.03,
            lineHeight: 1,
          }}
        >
          BLOG
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
