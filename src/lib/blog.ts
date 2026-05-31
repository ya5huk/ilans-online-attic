import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import { tagIcons } from "./tagIcons";

const videoExtensions = /\.(mp4|webm)$/i;

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

function addImageCaptions(htmlStr: string): string {
  return htmlStr.replace(
    /<img\s+src="([^"]*)"(?:\s+alt="([^"]*)")?(?:\s*\/)?>/g,
    (_, src, alt) => {
      if (videoExtensions.test(src)) {
        const caption = alt ? `<figcaption>${alt}</figcaption>` : "";
        return `<figure><video src="${src}" controls playsinline></video>${caption}</figure>`;
      }
      if (!alt) return `<img src="${src}" alt="">`;
      return `<figure><img src="${src}" alt="${alt}"><figcaption>${alt}</figcaption></figure>`;
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

/** Shared markdown pipeline: frontmatter split + remark→HTML + captions + excerpt. */
async function processMarkdown(raw: string, excerptLength = 150) {
  const matterResult = matter(raw);

  const processed = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(matterResult.content);

  const content = addImageCaptions(processed.toString());

  const plain = toPlainText(matterResult.content);
  const excerpt =
    plain.slice(0, excerptLength) + (plain.length > excerptLength ? "..." : "");

  return { data: matterResult.data, content, excerpt };
}

export type ContentKind = "writing" | "image" | "project";

export interface ContentItem {
  kind: ContentKind;
  slug: string;
  title: string;
  date: string; // mm/dd/yyyy [HH:mm]
  image?: string;
  content: string; // rendered HTML
  excerpt: string;
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
  excerpt: string
): ContentItem {
  const base: ContentItem = {
    kind,
    slug,
    title: data.title,
    date: data.date,
    image: data.image,
    content,
    excerpt,
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
    const { data, content, excerpt } = await processMarkdown(raw, 200);
    return toItem(slug, kind, data, content, excerpt);
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
