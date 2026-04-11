import type { Metadata } from "next";
import { Caveat, Fraunces, IBM_Plex_Mono, Sora } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kuldeep.cc"),
  title: {
    default: "Kuldeep Paul | Marketing, AI, and Product",
    template: "%s | Kuldeep Paul",
  },
  description:
    "Portfolio, writing, and work notes from Kuldeep Paul, Head of Marketing at Maxim AI, exploring the overlap between AI, data science, product, and modern marketing.",
  keywords: [
    "AI Marketing",
    "Marketing Automation",
    "Data Science",
    "Growth Marketing",
    "Product Marketing",
    "Marketing Systems",
    "Maxim AI",
    "Applied Data Science",
  ],
  authors: [{ name: "Kuldeep Paul", url: "https://kuldeep.cc" }],
  creator: "Kuldeep Paul",
  publisher: "Kuldeep Paul",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kuldeep.cc",
    siteName: "Kuldeep Paul",
    title: "Kuldeep Paul | Marketing, AI, and Product",
    description:
      "A bright editorial portfolio and journal about AI-native growth, product storytelling, and data-aware marketing systems.",
    images: [
      {
        url: "/og-images/home.png",
        width: 1200,
        height: 630,
        alt: "Kuldeep Paul | Marketing, AI, and Product",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kuldeep Paul | Marketing, AI, and Product",
    description:
      "Building data-driven marketing systems that scale with AI. Head of Marketing at Maxim AI.",
    creator: "@don_fedora",
    site: "@don_fedora",
    images: ["/og-images/home.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://kuldeep.cc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${fraunces.variable} ${caveat.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <div className="page-shell">
          <SiteHeader />
          <main className="relative z-10 flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
