import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/End-sem",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/End-sem",
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
