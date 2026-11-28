import {
  cloudinaryImageSrcSet,
  cloudinaryImageUrl,
} from "../lib/cloudinary-image";

type ImageLayout = "card" | "detail";

const LAYOUT: Record<
  ImageLayout,
  {
    width: number;
    srcSet: readonly [number, number];
    sizes: string;
    displayWidth: number;
    displayHeight: number;
    className: string;
  }
> = {
  card: {
    width: 600,
    srcSet: [400, 800],
    sizes: "(max-width: 1024px) 100vw, 409px",
    displayWidth: 409,
    displayHeight: 200,
    className: "aspect-[409/200] h-auto w-full object-cover",
  },
  detail: {
    width: 1200,
    srcSet: [800, 1600],
    sizes: "(max-width: 1280px) 100vw, 960px",
    displayWidth: 960,
    displayHeight: 400,
    className: "aspect-[960/400] h-auto w-full object-cover",
  },
};

type OptimizedImageProps = {
  src: string;
  alt: string;
  layout: ImageLayout;
  loading?: "lazy" | "eager";
  className?: string;
};

export function OptimizedImage({
  src,
  alt,
  layout,
  loading = "lazy",
  className,
}: OptimizedImageProps) {
  const preset = LAYOUT[layout];

  return (
    <img
      src={cloudinaryImageUrl(src, { width: preset.width })}
      srcSet={cloudinaryImageSrcSet(src, preset.srcSet)}
      sizes={preset.sizes}
      alt={alt}
      width={preset.displayWidth}
      height={preset.displayHeight}
      loading={loading}
      decoding="async"
      className={className ?? preset.className}
    />
  );
}
