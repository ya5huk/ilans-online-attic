import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import { tagIcons } from "./tagIcons";
import { remarkShiki } from "./highlight";
import imageDimensions from "./imageDimensions.json";
import mediaConversions from "./mediaConversions.json";
import mediaPosters from "./mediaPosters.json";

const videoExtensions = /\.(mp4|webm|mov)$/i;
const remoteRe = /^https?:\/\//i;

// Local /public path (not a remote or protocol-relative URL).
const isLocalPath = (src: string) =>
  src.startsWith("/") && !src.startsWith("//");

type RawImageDimensions = {
  width: number;
  height: number;
  orientation?: number;
};

// Intrinsic pixel dimensions for every local /public image, precomputed at build
// time by scripts/gen-image-dimensions.mjs (run via the "prebuild" npm hook).
// Reading from this static manifest — instead of an fs.readFileSync with a
// dynamic /public path — keeps Next.js Output File Tracing from bundling the
// entire ~300MB /public folder into each serverless function. Keyed by
// public-relative path ("me/foo.webp").
const IMAGE_DIMENSIONS = imageDimensions as Record<string, RawImageDimensions>;
const MEDIA_CONVERSIONS = mediaConversions as Record<string, string>;
const MEDIA_POSTERS = mediaPosters as Record<string, string>;

function splitUrlSuffix(src: string): { pathname: string; suffix: string } {
  const match = src.match(/^([^?#]*)([?#].*)?$/);
  return { pathname: match?.[1] ?? src, suffix: match?.[2] ?? "" };
}

function localPublicKey(src?: string): string | undefined {
  if (!src || src.trim() === "" || remoteRe.test(src) || !isLocalPath(src)) {
    return undefined;
  }
  const { pathname } = splitUrlSuffix(src);
  try {
    return decodeURIComponent(pathname).replace(/^\/+/, "");
  } catch {
    return undefined;
  }
}

function servedMediaSrc(src: string): string {
  const key = localPublicKey(src);
  if (!key) return src;
  const converted = MEDIA_CONVERSIONS[key];
  if (!converted) return src;
  return `/${converted}${splitUrlSuffix(src).suffix}`;
}

function posterMediaSrc(src: string): string | undefined {
  const key = localPublicKey(src);
  const servedKey = localPublicKey(servedMediaSrc(src));
  const poster =
    (key && MEDIA_POSTERS[key]) || (servedKey && MEDIA_POSTERS[servedKey]);
  return poster ? `/${poster}` : undefined;
}

function isVideoMedia(src: string): boolean {
  return videoExtensions.test(splitUrlSuffix(servedMediaSrc(src)).pathname);
}

/**
 * Resolve a frontmatter/markdown image path to its manifest entry. Frontmatter
 * paths are root-absolute ("/me/foo.webp") and may be percent-encoded (one Hebrew
 * filename is), so decode + strip the leading slash to match the manifest's
 * public-relative keys. Remote URLs and unprobed paths return undefined.
 */
function lookupDimensions(src?: string): RawImageDimensions | undefined {
  const rel = localPublicKey(servedMediaSrc(src ?? ""));
  if (!rel) return undefined;
  return IMAGE_DIMENSIONS[rel];
}

/**
 * Apply EXIF orientation to a manifest entry. Orientation 5–8 = rotated 90°/270°:
 * phone photos store landscape pixels with a rotate flag, and browsers + the
 * next/image optimizer render the swapped (corrected) aspect. Returning the
 * corrected dimensions keeps each reserved tile box matching the displayed image
 * — otherwise a width/height built from the raw pixels squashes the photo.
 */
function correctedDimensions(
  dims: RawImageDimensions | undefined
): { width: number; height: number } | undefined {
  if (!dims || !dims.width || !dims.height) return undefined;
  const rotated = !!dims.orientation && dims.orientation >= 5;
  return {
    width: rotated ? dims.height : dims.width,
    height: rotated ? dims.width : dims.height,
  };
}

/**
 * Orientation-corrected intrinsic dimensions for a LOCAL frontmatter image, so
 * the feed can reserve each tile's box and pack the justified wall without layout
 * shift. Remote URLs and missing/unprobed paths return undefined → the tile falls
 * back to a default aspect ratio. Manifest-backed: never touches the filesystem.
 */
function probeImageDimensions(
  image?: string
): { width: number; height: number } | undefined {
  return correctedDimensions(lookupDimensions(image));
}

/**
 * Orientation-corrected aspect ratio (width / height) for a LOCAL image. Remote
 * URLs and unprobed files return undefined → <MediaRow> measures them in the
 * browser instead.
 */
function probeAspect(src: string): number | undefined {
  const dims = correctedDimensions(lookupDimensions(src));
  return dims ? dims.width / dims.height : undefined;
}

/** Parse a "mm/dd/yyyy" or "mm/dd/yyyy HH:mm" frontmatter date into a Date. */
export function parseDate(dateStr: string): Date {
  const [datePart, timePart] = (dateStr || "").split(" ");
  const [mm, dd, yyyy] = datePart.split("/").map(Number);
  if (timePart) {
    const [hh, min] = timePart.split(":").map(Number);
    return new Date(yyyy, (mm || 1) - 1, dd || 1, hh, min);
  }
  return new Date(yyyy, (mm || 1) - 1, dd || 1);
}

/** Newest-first comparator usable across every content kind. */
export const byDateDesc = (a: ContentItem, b: ContentItem) =>
  parseDate(b.date).getTime() - parseDate(a.date).getTime();

// Widths offered to the optimizer for responsive grouped-media (<MediaRow>) srcsets.
const BODY_IMG_WIDTHS = [640, 828, 1080, 1200];

/**
 * Route a local image through Next's built-in optimizer (resize + AVIF/WebP).
 * Decode first so already percent-encoded paths (Hebrew filenames) aren't
 * double-encoded. Markdown HTML and the client <MediaRow> can't host a React
 * <Image>, so we emit the same URL the component would have produced.
 */
export function optimizerUrl(src: string, width: number): string {
  let decoded = src;
  try {
    decoded = decodeURIComponent(src);
  } catch {
    /* malformed escape — fall back to the raw path */
  }
  return `/_next/image?url=${encodeURIComponent(decoded)}&w=${width}&q=75`;
}

/** Responsive srcset across the body image widths, for a local /public path. */
export function optimizerSrcSet(src: string): string {
  return BODY_IMG_WIDTHS.map((w) => `${optimizerUrl(src, w)} ${w}w`).join(", ");
}

/** An optimized <img> for a lone body image. Local files are resized + served as
 *  AVIF/WebP via the optimizer; remote URLs are left untouched. Deliberately no
 *  srcset/sizes/width-height: a sizes-defined width fights `.prose img`'s
 *  max-height cap and squashes portrait photos, so we keep the plain <img> shape
 *  the browser already sizes correctly and only swap in the optimized source. */
function buildBodyImg(src: string, alt: string): string {
  const servedSrc = servedMediaSrc(src);
  if (!isLocalPath(servedSrc)) {
    return `<img src="${servedSrc}" alt="${alt}" loading="lazy" decoding="async">`;
  }
  return `<img src="${optimizerUrl(servedSrc, 1200)}" alt="${alt}" loading="lazy" decoding="async">`;
}

/**
 * Post-process rendered markdown: optimize/lazy-load images, defer video loads,
 * and wrap captioned media in <figure>. Local images are resized + served as
 * AVIF/WebP via the optimizer; videos get preload="metadata" so a long post
 * doesn't auto-download every (multi-MB) clip up front.
 */
function addImageCaptions(htmlStr: string): string {
  return htmlStr.replace(
    /<img\s+src="([^"]*)"(?:\s+alt="([^"]*)")?(?:\s*\/)?>/g,
    (_, src, alt) => {
      if (isVideoMedia(src)) {
        const caption = alt ? `<figcaption>${alt}</figcaption>` : "";
        const poster = posterMediaSrc(src);
        const posterAttr = poster ? ` poster="${poster}"` : "";
        return `<figure><video src="${servedMediaSrc(src)}"${posterAttr} controls playsinline preload="metadata"></video>${caption}</figure>`;
      }
      if (!alt) return buildBodyImg(src, "");
      return `<figure>${buildBodyImg(src, alt)}<figcaption>${alt}</figcaption></figure>`;
    }
  );
}

/**
 * Reduce markdown to a plain-text preview: drop images, keep link text, strip
 * formatting markers, and collapse whitespace. Keeps excerpts — and the SEO meta
 * descriptions built from them — free of raw `![](...)` / `[](...)` syntax.
 */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images: ![alt](url) → drop
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links: [text](url) → text
    .replace(/<[^>]+>/g, "") // inline HTML / autolinks
    .replace(/^\s{0,3}>+\s?/gm, "") // blockquote markers
    .replace(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm, "") // list markers
    .replace(/[#*`\[\]]/g, "") // headings / emphasis / code / stray brackets
    .replace(/\s+/g, " ") // collapse whitespace + newlines
    .trim();
}

// A maximal sequence of "media paragraphs" — <p> blocks whose entire content is
// one or more <img> (remark renders BOTH authoring styles this way: each `![](…)`
// on its own line becomes a separate <p><img></p>, while several with no blank line
// between become a single multi-<img> <p> that spans lines — hence `\s` must cross
// newlines). Consecutive such paragraphs (separated only by whitespace) form one run.
const MEDIA_PARAGRAPHS = /(?:<p>(?:\s*<img\b[^>]*>)+\s*<\/p>\s*)+/g;
// src (+ optional alt) of one <img>; remark emits attributes as `src` then `alt`.
const IMG_IN_RUN = /<img src="([^"]*)"(?: alt="([^"]*)")?[^>]*>/g;

// remark serializes mdast → an HTML string, so alt text arrives with special
// characters entity-encoded (an apostrophe becomes "&#x27;"). The lone-media path
// is unaffected — its alt lands back inside HTML that the browser decodes — but
// grouped media render through <MediaRow>, where alt is a plain React string
// (text node + attribute). React does NOT decode entities in strings, so "&#x27;"
// would paint literally. Decode the handful hast-util-to-html emits so the stored
// MediaItem.alt is true plain text. Single pass (no re-scan) avoids cascade-decoding
// a literal "&amp;#x27;" down to "'". Non-ASCII (e.g. Hebrew) is never encoded, so
// it passes through untouched.
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};
function decodeHtmlEntities(text: string): string {
  return text.replace(
    /&(?:#x([0-9a-fA-F]+)|#(\d+)|([a-zA-Z][a-zA-Z0-9]*));/g,
    (match, hex, dec, name) => {
      if (hex) {
        const code = parseInt(hex, 16);
        return code <= 0x10ffff ? String.fromCodePoint(code) : match;
      }
      if (dec) {
        const code = parseInt(dec, 10);
        return code <= 0x10ffff ? String.fromCodePoint(code) : match;
      }
      return NAMED_ENTITIES[name] ?? match; // unknown named entity: leave verbatim
    }
  );
}

/**
 * Replace each run of 2+ consecutive media (images/videos) with a
 * `<!--MEDIAROW:k-->` marker and collect the run's items into `runs[k]`. Handles
 * both authoring styles — images separated by blank lines and images with no blank
 * line between — and any mix. Videos are included (markdown image syntax renders as
 * <img> regardless of extension). A lone image is left untouched for the normal
 * figure/video treatment in addImageCaptions. Pure — aspect probing is the caller's.
 */
function groupMediaRuns(htmlStr: string): { html: string; runs: MediaItem[][] } {
  const runs: MediaItem[][] = [];
  const out = htmlStr.replace(MEDIA_PARAGRAPHS, (block) => {
    const run: MediaItem[] = [];
    for (const m of block.matchAll(IMG_IN_RUN)) {
      const src = m[1];
      run.push({
        type: isVideoMedia(src) ? "video" : "image",
        src,
        alt: decodeHtmlEntities(m[2] ?? ""),
      });
    }
    if (run.length < 2) return block; // lone image → unchanged
    runs.push(run);
    return `<!--MEDIAROW:${runs.length - 1}-->`;
  });
  return { html: out, runs };
}

/** Shared markdown pipeline: frontmatter split + remark→HTML + captions + excerpt.
 *  When groupMedia is set, runs of 2+ consecutive media are pulled into mediaRows
 *  and the body is returned as ordered parts (bodyParts) for <ArticleBody>. */
async function processMarkdown(raw: string, excerptLength = 150, groupMedia = false) {
  const matterResult = matter(raw);

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkShiki)
    .use(html, { sanitize: false })
    .process(matterResult.content);

  let htmlStr = processed.toString();
  let mediaRows: MediaItem[][] = [];

  if (groupMedia) {
    const grouped = groupMediaRuns(htmlStr);
    htmlStr = grouped.html;
    mediaRows = grouped.runs.map((run) =>
      run.map((it) => {
        const src = servedMediaSrc(it.src);
        if (it.type !== "image")
          return { ...it, src, poster: posterMediaSrc(it.src) }; // video: measured live
        const aspect = probeAspect(src);
        if (!isLocalPath(src)) return { ...it, src, aspect }; // remote: leave as-is
        // Local: serve the optimized URL + srcset, same as lone body images.
        return {
          ...it,
          aspect,
          src: optimizerUrl(src, 1200),
          srcSet: optimizerSrcSet(src),
        };
      })
    );
  }

  const captioned = addImageCaptions(htmlStr);

  // Split the rendered body on run markers into ordered parts ({html} | {run}) so
  // the article renders without any marker string being stored or serialized;
  // `content` is the marker-free HTML kept for word count / SEO / llms text.
  const segments = captioned.split(/<!--MEDIAROW:(\d+)-->/g);
  const bodyParts: BodyPart[] = [];
  segments.forEach((seg, i) => {
    if (i % 2 === 1) bodyParts.push({ run: Number(seg) });
    else if (seg !== "") bodyParts.push({ html: seg });
  });
  const content = segments.filter((_, i) => i % 2 === 0).join("");

  const plain = toPlainText(matterResult.content);
  const excerpt =
    plain.slice(0, excerptLength) + (plain.length > excerptLength ? "..." : "");

  return { data: matterResult.data, content, excerpt, mediaRows, bodyParts };
}

export type ContentKind = "writing" | "image" | "project";

export interface MediaItem {
  type: "image" | "video";
  src: string;
  alt: string;
  /** Orientation-corrected width/height for a LOCAL image, probed at build.
   *  Undefined for videos/remote → measured in the browser by <MediaRow>. */
  aspect?: number;
  /** Optimizer srcset for a LOCAL image (paired with an optimized `src`). */
  srcSet?: string;
  /** Poster thumbnail for videos, generated at build time when available. */
  poster?: string;
}

/** A rendered article body is an ordered list of HTML chunks and media runs. */
export type BodyPart = { html: string } | { run: number };

export interface ContentItem {
  kind: ContentKind;
  slug: string;
  title: string;
  date: string; // mm/dd/yyyy [HH:mm]
  image?: string;
  width?: number; // intrinsic px of `image`, when probeable at build time
  height?: number; // intrinsic px of `image`, when probeable at build time
  content: string; // rendered HTML (marker-free; for word count / SEO / llms text)
  excerpt: string;
  mediaRows?: MediaItem[][]; // runs of 2+ consecutive media; set on single-item fetches
  bodyParts?: BodyPart[]; // ordered render parts (HTML chunks + media runs)
  // writing only:
  tags?: string; // comma-separated, e.g. "books,philosophy"
  lang?: string; // "en_US" | "he_IL"
  // project only:
  links?: string[];
  tools?: string;
  period?: string;
}

/** Build a typed ContentItem from parsed frontmatter for the given kind. */
function toItem(
  slug: string,
  kind: ContentKind,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  content: string,
  excerpt: string,
  mediaRows: MediaItem[][] = [],
  bodyParts: BodyPart[] = []
): ContentItem {
  const image =
    typeof data.image === "string" ? servedMediaSrc(data.image) : data.image;
  const dims = probeImageDimensions(image);

  const base: ContentItem = {
    kind,
    slug,
    title: data.title,
    date: data.date,
    image,
    width: dims?.width,
    height: dims?.height,
    content,
    excerpt,
    mediaRows,
    bodyParts,
  };

  if (kind === "writing") {
    return { ...base, tags: data.tags ?? "", lang: data.lang ?? "en_US" };
  }
  if (kind === "project") {
    return {
      ...base,
      links: data.links
        ? String(data.links)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      tools: data.tools,
      period: data.period,
    };
  }
  return base; // image
}

/**
 * Load every `.md` file in a root content directory as ContentItems, newest
 * first. Files starting with "_" (e.g. `_example.md` templates) are ignored.
 */
export async function getCollection(
  dir: string,
  kind: ContentKind
): Promise<ContentItem[]> {
  const directory = path.join(process.cwd(), dir);

  let fileNames: string[] = [];
  try {
    fileNames = fs.readdirSync(directory);
  } catch {
    return [];
  }

  const items = await Promise.all(
    fileNames
      .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");
        const raw = fs.readFileSync(path.join(directory, fileName), "utf8");
        const { data, content, excerpt } = await processMarkdown(
          raw,
          kind === "writing" ? 800 : 320
        );
        return toItem(slug, kind, data, content, excerpt);
      })
  );

  return items.sort(byDateDesc);
}

/** Load a single content item by slug from a root content directory. */
export async function getItemBySlug(
  dir: string,
  slug: string,
  kind: ContentKind
): Promise<ContentItem | null> {
  // "_"-prefixed files are ignored templates — never expose them as a page.
  if (slug.startsWith("_")) return null;
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), dir, `${slug}.md`),
      "utf8"
    );
    const { data, content, excerpt, mediaRows, bodyParts } =
      await processMarkdown(raw, 200, true);
    return toItem(slug, kind, data, content, excerpt, mediaRows, bodyParts);
  } catch {
    return null;
  }
}

export interface AboutContent {
  title: string;
  image?: string;
  content: string;
}

const ABOUT_BIRTHDATE = new Date(2004, 8, 14); // Sept 14, 2004

/** Load the root `about.md`, rendering `{{age}}` into the current age. */
export async function getAboutContent(): Promise<AboutContent | null> {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "about.md"), "utf8");
    const { data, content } = await processMarkdown(raw);

    const age = Math.floor(
      (Date.now() - ABOUT_BIRTHDATE.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
    return {
      title: data.title,
      image: data.image,
      content: content.replaceAll("{{age}}", String(age)),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Back-compat + per-collection convenience wrappers
// ---------------------------------------------------------------------------

export type BlogPost = ContentItem;
export { tagIcons };

export const getAllPosts = () => getCollection("posts", "writing");
export const getPostBySlug = (slug: string) =>
  getItemBySlug("posts", slug, "writing");

export const getAllImages = () => getCollection("images", "image");
export const getImageBySlug = (slug: string) =>
  getItemBySlug("images", slug, "image");

export const getAllProjects = () => getCollection("projects", "project");
export const getProjectBySlug = (slug: string) =>
  getItemBySlug("projects", slug, "project");
