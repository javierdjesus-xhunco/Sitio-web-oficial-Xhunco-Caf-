import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zbsmwhzmmriiotkzkdtv.supabase.co",
      },
    ],
  },
};

export default nextConfig;