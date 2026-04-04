import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.ilansonlineattic.com'

  const postsDirectory = path.join(process.cwd(), 'posts')
  let blogPostFiles: string[] = []

  try {
    blogPostFiles = fs.readdirSync(postsDirectory)
      .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
  } catch (error) {
    console.warn('Posts directory not found or inaccessible')
  }

  // Parse frontmatter date (mm/dd/yyyy) into a Date object
  const parsePostDate = (dateStr: string): Date => {
    const [mm, dd, yyyy] = dateStr.split(' ')[0].split('/').map(Number)
    return new Date(yyyy, (mm || 1) - 1, dd || 1)
  }

  // Find the most recent post date for the blog listing page
  let latestPostDate = new Date(2025, 0, 1)

  const blogRoutes = blogPostFiles.map(file => {
    const slug = file.replace(/\.(md|mdx)$/, '')
    const fullPath = path.join(postsDirectory, file)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(fileContents)
    const postDate = data.date ? parsePostDate(data.date) : new Date(2025, 0, 1)

    if (postDate > latestPostDate) {
      latestPostDate = postDate
    }

    return {
      url: `${baseUrl}/yap/${slug}`,
      lastModified: postDate,
      changeFrequency: 'monthly' as const,
    }
  })

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(2025, 0, 1),
      changeFrequency: 'monthly' as const,
    },
    {
      url: `${baseUrl}/pics`,
      lastModified: new Date(2025, 0, 1),
      changeFrequency: 'monthly' as const,
    },
    {
      url: `${baseUrl}/yap`,
      lastModified: latestPostDate,
      changeFrequency: 'weekly' as const,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(2025, 0, 1),
      changeFrequency: 'monthly' as const,
    },
  ]

  return [...staticRoutes, ...blogRoutes]
}