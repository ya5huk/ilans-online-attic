import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats from the built-in optimizer (AVIF first, then WebP).
    // Local /public images are optimized; remote markdown URLs are left as plain
    // <img> (see SmartImage) so arbitrary hosts never need per-domain config.
    formats: ["image/avif", "image/webp"],
  },
  // The content loaders (src/lib/blog.ts + src/app/sitemap.ts) read markdown via
  // fs.readFileSync(path.join(process.cwd(), <dynamic dir>)). Next's Output File
  // Tracing can't resolve the dynamic segment, so it conservatively globs the
  // ENTIRE project root into every server function — sweeping in the ~358MB .git
  // history and the ~298MB public/ folder, which blew the [feed] function past the
  // 300MB limit. Neither is needed at runtime (public is served as static assets
  // and through the image optimizer; .git is irrelevant), so drop both from every
  // function trace. Content dirs (posts/, images/, projects/, about.md) are left
  // in — those reads are real.
  outputFileTracingExcludes: {
    "*": ["./.git/**", "./public/**"],
  },
};

export default nextConfig;
