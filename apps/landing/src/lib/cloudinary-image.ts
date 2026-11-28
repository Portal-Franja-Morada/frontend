const CLOUDINARY_HOST = "res.cloudinary.com";
const UPLOAD_MARKER = "/image/upload/";

export type CloudinaryImageOptions = {
  width: number;
};

function transformSegment(segment: string): boolean {
  if (!segment || /^v\d+$/.test(segment)) {
    return false;
  }
  return segment.includes(",") || /^[a-z0-9]+_[^/]+/i.test(segment);
}

function afterUploadPath(pathname: string): string | null {
  const index = pathname.indexOf(UPLOAD_MARKER);
  if (index === -1) {
    return null;
  }
  return pathname.slice(index + UPLOAD_MARKER.length);
}

function hasExistingTransforms(afterUpload: string): boolean {
  const first = afterUpload.split("/")[0] ?? "";
  return transformSegment(first);
}

function buildTransform(width: number): string {
  return `f_auto,q_auto,c_limit,w_${width}`;
}

function insertTransform(pathname: string, width: number): string | null {
  const afterUpload = afterUploadPath(pathname);
  if (afterUpload === null) {
    return null;
  }
  if (hasExistingTransforms(afterUpload)) {
    return null;
  }

  const transform = buildTransform(width);
  const markerIndex = pathname.indexOf(UPLOAD_MARKER);
  const prefix = pathname.slice(0, markerIndex + UPLOAD_MARKER.length);
  const versionMatch = afterUpload.match(/^(v\d+\/)(.*)/);

  if (versionMatch) {
    return `${prefix}${transform}/${versionMatch[1]}${versionMatch[2]}`;
  }

  return `${prefix}${transform}/${afterUpload}`;
}

/** Optimiza URLs de Cloudinary con transformaciones de entrega; otras URLs se devuelven sin cambios. */
export function cloudinaryImageUrl(
  url: string,
  { width }: CloudinaryImageOptions,
): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.hostname !== CLOUDINARY_HOST) {
    return url;
  }

  const nextPath = insertTransform(parsed.pathname, width);
  if (nextPath === null) {
    return url;
  }

  parsed.pathname = nextPath;
  return parsed.toString();
}

export function cloudinaryImageSrcSet(
  url: string,
  widths: readonly [number, number],
): string {
  return widths
    .map((w) => `${cloudinaryImageUrl(url, { width: w })} ${w}w`)
    .join(", ");
}
