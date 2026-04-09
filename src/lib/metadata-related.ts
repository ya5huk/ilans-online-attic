import type { Metadata } from "next";

type siteTypes = "book" | "article" | "website" | "profile";
export interface MetadataGenParams {
  title: string;
  desc: string;
  img: string;
  imgalt: string;
  path: string;
  sitetype: siteTypes;
  datepublished?: Date;
  keywords?: string[];
  inLanguage?: string;
  wordCount?: number;
  articleSection?: string;
  dateModified?: Date;
}

export const genMetadata = (
  metadataParams: MetadataGenParams
): Metadata => {
  const canonicalUrl = `https://www.ilansonlineattic.com${metadataParams.path}`;
  return {
    title: metadataParams.title,
    description: metadataParams.desc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metadataParams.title,
      description: metadataParams.desc,
      url: canonicalUrl,
      siteName: "Ilan's Online Attic",
      images: [
        {
          url: metadataParams.img,
          alt: metadataParams.imgalt,
        },
      ],
      locale: metadataParams.inLanguage || "en-US",
      type: metadataParams.sitetype,
    },
    twitter: {
      card: "summary_large_image",
      title: metadataParams.title,
      description: metadataParams.desc,
      images: [metadataParams.img],
      site: '@ilan_yashuk'
    },
  }
};

const schemaTypeMap: Record<string, string> = {
  article: "BlogPosting",
  profile: "ProfilePage",
  website: "WebSite",
  book: "Book",
};

export const genJsonLd = (metadata: MetadataGenParams) => {
  const canonicalUrl = `https://www.ilansonlineattic.com${metadata.path}`;
  const schemaType = schemaTypeMap[metadata.sitetype] || metadata.sitetype;
  const isContentType = schemaType === "BlogPosting" || schemaType === "Book";
  const isProfilePage = schemaType === "ProfilePage";

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: metadata.title,
    description: metadata.desc,
    image: metadata.img,
    url: canonicalUrl,
    ...(isContentType && {
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      author: {
        "@type": "Person",
        name: "Ilan Yashuk",
        sameAs: [
          "https://www.linkedin.com/in/ilan-yashuk/",
          "https://www.instagram.com/ilan_yashuk/",
        ],
      },
      publisher: {
        "@type": "Organization",
        name: "Ilan's Online Attic",
      },
      datePublished: metadata.datepublished
        ? metadata.datepublished.toISOString().split("T")[0]
        : undefined,
      dateModified: metadata.dateModified
        ? metadata.dateModified.toISOString().split("T")[0]
        : metadata.datepublished
          ? metadata.datepublished.toISOString().split("T")[0]
          : undefined,
      wordCount: metadata.wordCount,
      articleSection: metadata.articleSection,
    }),
    ...(isProfilePage && {
      mainEntity: {
        "@type": "Person",
        name: "Ilan Yashuk",
        sameAs: [
          "https://www.linkedin.com/in/ilan-yashuk/",
          "https://www.instagram.com/ilan_yashuk/",
        ],
      },
    }),
    inLanguage: metadata.inLanguage,
    keywords: metadata.keywords,
  };
}