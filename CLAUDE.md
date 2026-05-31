# The project

This repo represents my personal website - www.ilansonlineattic.com where I share pictures, blog posts, projects and more. Mainly, it exists to be a room for my thoughts and writing that I like to express from time to time.

# Package manager

This project uses **npm** (the tracked lockfile is `package-lock.json`). Always use `npm` — e.g. `npm run dev`, `npm run build`, `npm install`. Do NOT use `pnpm`, `yarn`, or `bun`; they would create a conflicting lockfile.

# Dev server vs build

Never run `npm run build` while a dev server (`npm run dev`) is running, or vice versa. They share the same `.next/` directory, and running one while the other is live corrupts the cache (e.g. `ENOENT: ... _buildManifest.js.tmp...`). If the cache breaks: stop the server, `rm -rf .next`, then start fresh.

# Blog posts

Blog posts are viewed in route `/yap/[articlename]`. They are saved in `/posts` as `.md` files and transformed to fully beautiful blog posts using markdown parser.

Blogs are categorized by:

1. Language - English & Hebrew
2. Tags - As written in `/lib/tagIcons.ts`
