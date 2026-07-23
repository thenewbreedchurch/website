import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    // Pins the workspace root to this app instead of Next inferring it from
    // whichever lockfile is nearest up the tree — this machine has an
    // unrelated project with its own package-lock.json a few directories up.
    root: path.join(__dirname, "..", ".."),
  },
};

export default nextConfig;
