import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { imageSize } from "image-size";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import { tagIcons } from "./tagIcons";

const videoExtensions = /\.(mp4|webm)$/i;
const remoteRe = /^https?:\/\//i;

/**
 * Read intrinsic pixel dimensions for a frontmatter image so the feed can
 * reserve each tile's box and pack the justified wall without layout shift.
 * Only local `/public` paths are probed (header-only, no decode): remote URLs
 * and missing/empty paths return undefined, and the tile falls back to a
 * default aspect ratio. Runs at build/SSR only — never ships to the client.
 */
function probeImageDimensions(
  image?: string
): { width: number; height: number } | undefined {
  if (!image || image.trim() === "") return undefined;
  if (/^https?:\/\//i.test(image)) return undefined; // remote — not on disk
  try {
    // Frontmatter paths are root-absolute ("/me/foo.webp") and may be
    // percent-encoded (one Hebrew filename is); decode + strip the leading
    // slash to resolve under /public.
    const rel = decodeURIComponent(image).replace(/^\/+/, "");
    const buf = fs.readFileSync(path.join(process.cwd(), "public", rel));
    const { width, height, orientation } = imageSize(buf);
    if (!width || !height) return undefined;
    // EXIF orientation 5–8 = rotated 90°/270°: phone photos store landscape
    // pixels with a rotate flag, and browsers + the next/image optimizer render
    // the swapped (corrected) aspect. Return those corrected dimensions so the
    // reserved box matches the displayed image — otherwise a width/height attr
    // built from the raw pixels squashes the photo. (Same rule as probeAspect.)
    const rotated = !!orientation && orientation >= 5;
    return {
      width: rotated ? height : width,
      height: rotated ? width : height,
    };
  } catch {
    return undefined;
  }
}

/**
 * Orientation-corrected aspect ratio (width / height) for a LOCAL image, read
 * header-only at build time. Phone photos carry EXIF orientation (5–8 = rotated
 * 90°/270°), so the displayed aspect swaps the probed dimensions. Remote URLs and
 * unreadable/zero-size files return undefined → <MediaRow> measures them instead.
 */
function probeAspect(src: string): number | undefined {
  if (!src || remoteRe.test(src)) return undefined;
  try {
    const rel = decodeURIComponent(src).replace(/^\/+/, "");
    const buf = fs.readFileSync(path.join(process.cwd(), "public", rel));
    const { width, height, orientation } = imageSize(buf);
    if (!width || !height) return undefined;
    const rotated = !!orientation && orientation >= 5;
    const w = rotated ? height : width;
    const h = rotated ? width : height;
    return w / h;
  } catch {
    return undefined;
  }
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

// Local /public path (not a remote or protocol-relative URL).
const isLocalPath = (src: string) =>
  src.startsWith("/") && !src.startsWith("//");

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
  if (!isLocalPath(src)) {
    return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async">`;
  }
  return `<img src="${optimizerUrl(src, 1200)}" alt="${alt}" loading="lazy" decoding="async">`;
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
      if (videoExtensions.test(src)) {
        const caption = alt ? `<figcaption>${alt}</figcaption>` : "";
        return `<figure><video src="${src}" controls playsinline preload="metadata"></video>${caption}</figure>`;
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
        type: videoExtensions.test(src) ? "video" : "image",
        src,
        alt: m[2] ?? "",
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
    .use(html, { sanitize: false })
    .process(matterResult.content);

  let htmlStr = processed.toString();
  let mediaRows: MediaItem[][] = [];

  if (groupMedia) {
    const grouped = groupMediaRuns(htmlStr);
    htmlStr = grouped.html;
    mediaRows = grouped.runs.map((run) =>
      run.map((it) => {
        if (it.type !== "image") return it; // video: keep raw src, measured live
        const aspect = probeAspect(it.src);
        if (!isLocalPath(it.src)) return { ...it, aspect }; // remote: leave as-is
        // Local: serve the optimized URL + srcset, same as lone body images.
        return {
          ...it,
          aspect,
          src: optimizerUrl(it.src, 1200),
          srcSet: optimizerSrcSet(it.src),
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
  const dims = probeImageDimensions(data.image);

  const base: ContentItem = {
    kind,
    slug,
    title: data.title,
    date: data.date,
    image: data.image,
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
