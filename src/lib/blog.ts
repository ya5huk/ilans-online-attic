import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import { tagIcons } from "./tagIcons";

const postsDirectory = path.join(process.cwd(), "posts");

function addImageCaptions(htmlStr: string): string {
  return htmlStr.replace(
    /<img\s+src="([^"]*)"(?:\s+alt="([^"]*)")?(?:\s*\/)?>/g,
    (_, src, alt) => {
      if (!alt) return `<img src="${src}" alt="">`;
      return `<figure><img src="${src}" alt="${alt}"><figcaption>${alt}</figcaption></figure>`;
    }
  );
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  image?: string;
  tags: string; // i.e. "linkedin", "training", etc. Split by comma
  lang: string;
  content: string;
  excerpt: string;
}

export { tagIcons };

export async function getAllPosts(): Promise<BlogPost[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const matterResult = matter(fileContents);

        // Process markdown to HTML
        const processedContent = await remark()
          .use(remarkGfm)
          .use(html)
          .process(matterResult.content);

        const contentHtml = addImageCaptions(processedContent.toString());

        // Create excerpt
        const maxCharAmount = 150;
        const plainContent = matterResult.content
          .replace(/[#*`\[\]]/g, "")
          .trim();
        const excerpt =
          plainContent.slice(0, maxCharAmount) +
          (plainContent.length > maxCharAmount ? "..." : "");

        return {
          slug,
          title: matterResult.data.title,
          date: matterResult.data.date,
          image: matterResult.data.image,
          tags: matterResult.data.tags,
          lang: matterResult.data.lang,
          content: contentHtml,
          excerpt,
        };
      })
  );

  // Sort posts by date (newest first)
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    // Process markdown to HTML
    const processedContent = await remark()
      .use(remarkGfm)
      .use(html, { sanitize: false })
      .process(matterResult.content);

    const contentHtml = addImageCaptions(processedContent.toString());

    // Create excerpt
    const plainContent = matterResult.content.replace(/[#*`\[\]]/g, "").trim();
    const excerpt =
      plainContent.slice(0, 200) + (plainContent.length > 200 ? "..." : "");

    return {
      slug,
      title: matterResult.data.title,
      date: matterResult.data.date,
      image: matterResult.data.image,
      tags: matterResult.data.tags,
      lang: matterResult.data.lang,
      content: contentHtml,
      excerpt,
    };
  } catch (error) {
    return null;
  }
}
