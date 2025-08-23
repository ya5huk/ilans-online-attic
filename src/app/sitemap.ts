import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ilansonlineattic.com' // Replace with your actual domain

  // Get all blog posts from /posts directory
  const postsDirectory = path.join(process.cwd(), 'posts')
  let blogPosts: string[] = []

  try {
    blogPosts = fs.readdirSync(postsDirectory)
      .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
      .map(file => file.replace(/\.(md|mdx)$/, ''))
  } catch (error) {
    console.warn('Posts directory not found or inaccessible')
  }

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
    },
    {
      url: `${baseUrl}/pics`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
    },
    {
      url: `${baseUrl}/yap`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,

    },
  ]

  // Dynamic blog post routes
  const blogRoutes = blogPosts.map(slug => ({
    url: `${baseUrl}/yap/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
  }))

  return [...staticRoutes, ...blogRoutes]
}