import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'posts');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  image?: string;
  lang: string;
  content: string;
  excerpt: string;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        // Process markdown to HTML
        const processedContent = await remark()
          .use(remarkGfm)
          .use(html)
          .process(matterResult.content);

        const contentHtml = processedContent.toString();

        // Create excerpt (first 200 characters of content without HTML)
        const plainContent = matterResult.content.replace(/[#*`\[\]]/g, '').trim();
        const excerpt = plainContent.slice(0, 200) + (plainContent.length > 200 ? '...' : '');

        return {
          slug,
          title: matterResult.data.title,
          date: matterResult.data.date,
          image: matterResult.data.image,
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
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // Process markdown to HTML
    const processedContent = await remark()
      .use(remarkGfm)
      .use(html)
      .process(matterResult.content);

    const contentHtml = processedContent.toString();

    // Create excerpt
    const plainContent = matterResult.content.replace(/[#*`\[\]]/g, '').trim();
    const excerpt = plainContent.slice(0, 200) + (plainContent.length > 200 ? '...' : '');

    return {
      slug,
      title: matterResult.data.title,
      date: matterResult.data.date,
      image: matterResult.data.image,
      lang: matterResult.data.lang,
      content: contentHtml,
      excerpt,
    };
  } catch (error) {
    return null;
  }
}
