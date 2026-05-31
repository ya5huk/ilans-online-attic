import type { ContentItem } from "@/lib/blog";

const cleanLabel = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

const formatDate = (date: string) => {
  const [m, d, y] = date.split(" ")[0].split("/");
  return new Date(`${y}-${m}-${d}`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Shared detail layout for an image or project page.
 *
 * Images use a side-by-side layout: a smaller image on the left and the text
 * column on the right (date → header → description), stacking on mobile.
 * Projects keep the stacked layout (title, date, full image, body) plus their
 * tools and links.
 */
const DetailView: React.FC<{ item: ContentItem }> = ({ item }) => {
  const meta = (
    <span className="text-gray-400 font-ui">
      {item.period || formatDate(item.date)}
    </span>
  );

  const body = (
    <article
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: item.content }}
    />
  );

  if (item.kind === "image") {
    return (
      <main>
        <div className="mx-auto flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
          {item.image && (
            <div className="w-full md:w-2/5 md:shrink-0">
              <img
                src={item.image}
                alt={item.title}
                className="w-full image-shadow"
              />
            </div>
          )}

          <div className="flex-1 space-y-2">
            {meta}
            <h1 className="text-4xl">{item.title}</h1>
            <div className="pt-2">{body}</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="mx-auto space-y-2">
        <h1 className="text-4xl">{item.title}</h1>
        {meta}

        {item.image && (
          <div className="my-4">
            <img
              src={item.image}
              alt={item.title}
              className="w-full object-cover image-shadow mb-6"
            />
          </div>
        )}

        <div className="pt-2">{body}</div>

        {item.tools && (
          <div className="flex flex-wrap gap-2 mt-4">
            {item.tools
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .map((t) => (
                <span
                  key={t}
                  className="bg-[var(--third)] text-white text-sm px-2.5 py-1 font-ui"
                >
                  {t}
                </span>
              ))}
          </div>
        )}

        {item.links && item.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {item.links.map((l) => (
              <a
                key={l}
                href={l}
                target="_blank"
                rel="noopener noreferrer"
                className="link-button"
              >
                {cleanLabel(l)}
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default DetailView;
