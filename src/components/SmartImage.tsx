import Image from "next/image";
import type { CSSProperties } from "react";

interface SmartImageProps {
  src: string;
  alt: string;
  // Use fill for containers that already reserve the box (e.g. feed tiles).
  fill?: boolean;
  // Intrinsic pixel size, when known (probed at build time). Required for
  // optimized non-fill rendering; without it we fall back to a plain <img>.
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

// A local /public path — not a protocol-relative ("//cdn/…") or absolute
// ("https://…") remote URL.
const isLocal = (src: string) => src.startsWith("/") && !src.startsWith("//");

/**
 * Renders next/image for local /public files so they're optimized (resized,
 * AVIF/WebP, responsive srcset), and falls back to a plain lazy <img> for remote
 * URLs or images whose intrinsic size we couldn't measure. next/image needs
 * either a configured remote host or known dimensions, and content here can
 * carry arbitrary remote image URLs (e.g. LinkedIn's CDN) — the fallback keeps
 * those working without per-domain config. Both paths lazy-load and decode async.
 */
const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
  style,
}) => {
  const optimizable = isLocal(src) && (fill || (!!width && !!height));

  if (!optimizable) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
        style={style}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        style={style}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
    />
  );
};

export default SmartImage;
