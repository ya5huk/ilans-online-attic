import { getAllPosts } from "@/lib/blog";

export async function GET() {
  const posts = await getAllPosts();

  const lines: string[] = [
    "# Ilan's Online Attic — Full Content",
    "",
    `> ${posts.length} blog posts. Last updated: ${new Date().toISOString().split("T")[0]}`,
    "",
  ];

  for (const post of posts) {
    const langLabel = post.lang === "he_IL" ? "Hebrew" : "English";
    const plainContent = post.content
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .trim();

    lines.push(`---`);
    lines.push(``);
    lines.push(`## ${post.title}`);
    lines.push(``);
    lines.push(`- Date: ${post.date}`);
    lines.push(`- Tags: ${post.tags}`);
    lines.push(`- Language: ${langLabel}`);
    lines.push(`- URL: https://www.ilansonlineattic.com/yap/${post.slug}`);
    lines.push(``);
    lines.push(plainContent);
    lines.push(``);
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
