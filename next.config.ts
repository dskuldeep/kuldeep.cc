import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      // Headroom for long posts; images are externalized to R2 client-side
      // before save, so payloads stay text-sized in practice.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
