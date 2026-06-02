// Build-time image dimension manifest generator.
//
// Walks /public, probes every raster image's intrinsic width/height/orientation
// (header-only via image-size), and writes the result to
// src/lib/imageDimensions.json keyed by public-relative path ("me/foo.webp").
//
// Why this exists: src/lib/blog.ts used to read these bytes at build time with a
// dynamic `fs.readFileSync(process.cwd()/public/<var>)`. Next.js Output File
// Tracing can't resolve the dynamic path, so it bundled the ENTIRE /public folder
// (~300MB) into every serverless function that imports blog.ts — blowing the
// 300MB function limit. Reading from this static manifest instead keeps /public
// out of the function bundle entirely.
//
// Runs automatically before `next build` (npm "prebuild"). Re-run by hand after
// adding/replacing images: `npm run gen:dimensions`.

import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, relative, sep } from "path";
import { imageSize } from "image-size";

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");
const OUT_FILE = join(ROOT, "src", "lib", "imageDimensions.json");

// Raster formats image-size can probe. SVG/video are skipped (no intrinsic raster
// size needed: videos are measured live in the browser, SVGs scale).
const RASTER_RE = /\.(jpe?g|png|webp)$/i;

/** Recursively collect every raster image path under `dir`. */
function walk(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    if (name === ".DS_Store") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) found.push(...walk(full));
    else if (RASTER_RE.test(name)) found.push(full);
  }
  return found;
}

const files = walk(PUBLIC_DIR).sort(); // sorted → stable, reviewable diffs
const manifest = {};
let probed = 0;
let skipped = 0;

for (const file of files) {
  // Forward-slash, public-relative key — matches blog.ts's normalized lookup.
  const key = relative(PUBLIC_DIR, file).split(sep).join("/");
  try {
    const { width, height, orientation } = imageSize(readFileSync(file));
    if (!width || !height) {
      skipped++;
      continue;
    }
    // Omit orientation when absent/upright (0/undefined) to keep entries lean.
    manifest[key] =
      orientation && orientation > 1
        ? { width, height, orientation }
        : { width, height };
    probed++;
  } catch {
    skipped++; // unreadable/unsupported — blog.ts falls back to a default aspect
  }
}

writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `image-dimensions: ${probed} entries -> ${relative(ROOT, OUT_FILE)}` +
    (skipped ? ` (${skipped} skipped)` : "")
);
