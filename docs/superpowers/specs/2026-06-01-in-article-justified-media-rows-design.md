# In-article justified media rows

## Goal

When a blog post has **2+ consecutive images/videos**, pack them side-by-side into
justified rows on desktop — the same "if they fit, they fit" behavior as the
landing-page wall — while keeping them **stacked on mobile**. A lone media item is
unchanged.

Example: december's `trap-bar-deadlift.jpg` (displays portrait) + `100kg-clean-fail.jpg`
(portrait) currently stack vertically; they should sit two-up on desktop. Two vertical
videos should likewise fit side-by-side.

## Scope

- **In:** runs of 2+ consecutive media (images *and* videos, any mix) inside `/posts` markdown.
- **Out:** the frontmatter cover image; single inline images (keep today's centered figure);
  the landing-page wall (already done); tile chrome (date strip, title, teal border, hover
  zoom) — in-article we want **only the packing**, each item with its caption underneath.

## Key facts driving the design

- Content column is `max-w-3xl` (768px) on desktop (`(site-routes)/layout.tsx`).
- Article body is server HTML via `dangerouslySetInnerHTML` in the `/yap/[articlename]` page.
- remark emits each block on its own line; consecutive media are adjacent `<p><img ...></p>`
  lines (videos included — markdown image syntax renders as `<img>` regardless of extension;
  `addImageCaptions` later turns `.mp4/.webm` into `<video>`).
- **EXIF orientation matters:** `image-size` reports `trap-bar-deadlift.jpg` as 5712×4284
  (landscape) but `orientation:6` → browser shows it **portrait**. Aspect must be
  orientation-corrected (swap w/h for orientation 5–8).
- **Videos need real ratios** and they're mixed (1920×1080 *and* 1080×1920). `ffprobe` is not
  on Vercel → measure videos in the browser.

## Approach: browser-measured justified rows (chosen)

Reuse the landing page's `justified-layout` package, but resolve sizes client-side so
rotated photos, rotated videos, and remote images are always correct and future media needs
no extra steps. Images additionally get a build-time aspect estimate so desktop image rows
**don't shift**.

### 1. Detect runs at build (`src/lib/blog.ts`)

In the markdown pipeline, before `addImageCaptions`:

- Split the remark HTML into lines. A "media line" matches `^<p><img src="..." alt="..."></p>$`.
- Group consecutive media lines into runs.
- **Run of 1:** leave the line in place (existing `addImageCaptions` turns it into a centered
  `<figure>` / `<video>` exactly as today).
- **Run of 2+:** replace the lines with a marker comment `<!--MEDIAROW:k-->` and push the
  run's items into a `mediaRows[k]` array. Each item: `{ type: "image" | "video", src, alt,
  aspect? }`, where `aspect` is set for **local images** via `image-size` (orientation-corrected)
  and left undefined for videos/remote (measured client-side).
- Run `addImageCaptions` on the remaining (non-run) HTML so single images/inline images behave
  as before.
- `processMarkdown` returns `{ data, content, excerpt, mediaRows }`; `ContentItem` gains
  `mediaRows?: MediaItem[][]`.

### 2. Render (`/yap/[articlename]/page.tsx`)

`post.content` now contains `<!--MEDIAROW:k-->` markers between top-level blocks. Split the
HTML on the marker regex and interleave:

- HTML chunks → `dangerouslySetInnerHTML` inside a `display:contents` wrapper (so `.prose`
  child spacing is unaffected).
- Each marker `k` → `<MediaRow items={post.mediaRows[k]} />`.

### 3. `MediaRow` client component (`src/components/MediaRow.tsx`)

- Measure container width with `ResizeObserver` (SSR width ≈ 768, mirroring `JustifiedWall`'s
  `SSR_WIDTH`).
- Track per-item aspect: start from the build-time `aspect` (images) and override on load
  (`img.naturalWidth/Height`, `video.videoWidth/Height` — both reflect true displayed size).
- **Width < ~640px (mobile):** render stacked full-width figures + captions — identical to a
  normal article image. Satisfies "not in mobile though".
- **Otherwise:** call `justifiedLayout(aspects, { containerWidth, boxSpacing: 8,
  targetRowHeight: 340 })` to decide **row breaks**, then render each row as a flexbox where
  each `<figure>` uses `flex: <aspect> 1 0` (flex-grow ∝ aspect ratio) with the media at
  `width:100%; height:auto`. This equalizes each row's media height, keeps full images (no
  crop), stays responsive, and lets each caption flow naturally beneath its item.
- Re-pack on width change or when a measurement updates an aspect.

### 4. Styling (`src/app/globals.css`)

- `.media-row` rows: flex, `gap: 8px`, `my-6`.
- Figures inside a row reuse existing `figcaption` styling; drop the per-image `max-h` cap
  inside rows (row height is governed by `targetRowHeight`). Keep the teal drop-shadow on media.
- Mobile stacked state matches existing `.prose figure` look.

## Testing / verification

- Build (`npm run build`) succeeds; static params for all posts generate.
- december post: gym+clean pair two-up on desktop, stacked on phone width; captions intact.
- march/april post: a run that includes videos packs (portrait video beside portrait video;
  landscape video takes its own row).
- my_first_project_hebrew (remote images, RTL): runs still pack (client-measured), no crash.
- hod_akev (images separated by text): unchanged — each image stays single/centered.
- Single images everywhere else: unchanged.

## Risks / notes

- Brief layout settle on rows **containing video/remote** (measured on load); image-only rows
  use build-time aspects so they don't shift on desktop. Mobile re-packs to stacked on mount
  (same trade-off the landing wall already accepts).
- HTML-splitting is safe because markers sit between complete top-level blocks.
- No new dependencies (`justified-layout` and `image-size` are already installed).
