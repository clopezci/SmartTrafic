import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // A package-lock in the user profile was making Next trace the wrong root and stall the build.
  outputFileTracingRoot: path.join(process.cwd()),
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
