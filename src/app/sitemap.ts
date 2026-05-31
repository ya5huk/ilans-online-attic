import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

type Entry = { slug: string; date: Date };

const FALLBACK_DATE = new Date(2025, 0, 1);

const parseDate = (dateStr: string): Date => {
  const [mm, dd, yyyy] = (dateStr || "").split(" ")[0].split("/").map(Number);
  return new Date(yyyy, (mm || 1) - 1, dd || 1);
};

// Read a root content dir → entries, skipping non-md and "_"-prefixed templates.
const readDir = (dir: string): Entry[] => {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), dir))
      .filter(
        (f) => (f.endsWith(".md") || f.endsWith(".mdx")) && !f.startsWith("_")
      )
      .map((f) => {
        const slug = f.replace(/\.(md|mdx)$/, "");
        const { data } = matter(
          fs.readFileSync(path.join(process.cwd(), dir, f), "utf8")
        );
        return { slug, date: data.date ? parseDate(data.date) : FALLBACK_DATE };
      });
  } catch {
    return [];
  }
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.ilansonlineattic.com";

  const posts = readDir("posts");
  const images = readDir("images");
  const projects = readDir("projects");

  const latest = (entries: Entry[]) =>
    entries.reduce((max, e) => (e.date > max ? e.date : max), FALLBACK_DATE);

  const latestPostDate = latest(posts);

  const route = (
    urlPath: string,
    lastModified: Date,
    changeFrequency: "weekly" | "monthly" = "monthly"
  ) => ({ url: `${baseUrl}${urlPath}`, lastModified, changeFrequency });

  return [
    route("/", latestPostDate, "weekly"),
    route("/writing", latestPostDate, "weekly"),
    route("/images", latest(images), "weekly"),
    route("/projects", latest(projects), "weekly"),
    ...posts.map((p) => route(`/yap/${p.slug}`, p.date)),
    ...images.map((i) => route(`/pics/${i.slug}`, i.date)),
    ...projects.map((pr) => route(`/projects/${pr.slug}`, pr.date)),
  ];
}
