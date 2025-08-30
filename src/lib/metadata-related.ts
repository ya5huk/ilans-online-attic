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
}

export const genMetadata = (
  metadataParams: MetadataGenParams
): Metadata => {
  return {
    title: metadataParams.title,
    description: metadataParams.desc,
    openGraph: {
      title: metadataParams.title,
      description: metadataParams.desc,
      url: `https://ilansonlineattic.com${metadataParams.path}`,
      siteName: "Ilan's Online Attic",
      images: [
        {
          url: metadataParams.img,
          alt: metadataParams.imgalt,
        },
      ],
      locale: "en-US",
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

export const genJsonLd = (metadata: MetadataGenParams) => {
  return {
    "@context": "https://schema.org",
    "@type": metadata.sitetype,
    name: metadata.title,
    description: metadata.desc,
    image: metadata.img,
    url: `https://ilansonlineattic.com${metadata.path}`,
    author: {
      "@type": "Person",
      name: "Ilan Yashuk"
    },
    publisher: {
      "@type": "Organization",
      name: "Ilan's Online Attic"
    },
    datePublished: metadata.datepublished ? metadata.datepublished.toISOString().split('T')[0] : undefined,
  };
}