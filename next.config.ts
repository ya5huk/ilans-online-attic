import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats from the built-in optimizer (AVIF first, then WebP).
    // Local /public images are optimized; remote markdown URLs are left as plain
    // <img> (see SmartImage) so arbitrary hosts never need per-domain config.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
