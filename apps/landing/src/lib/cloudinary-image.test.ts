import { describe, expect, it } from "vitest";
import { cloudinaryImageUrl } from "./cloudinary-image";

const RAW =
  "https://res.cloudinary.com/demo/image/upload/v1730000000/portal/production/novedades/foto.png";
const TRANSFORMED =
  "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_400/sample.jpg";
const EXTERNAL = "https://cdn.example.com/banner.jpg";

describe("cloudinaryImageUrl", () => {
  it("inserta transformaciones en una URL de Cloudinary sin ellas", () => {
    expect(cloudinaryImageUrl(RAW, { width: 600 })).toBe(
      "https://res.cloudinary.com/demo/image/upload/v1730000000/f_auto,q_auto,c_limit,w_600/portal/production/novedades/foto.png",
    );
  });

  it("devuelve URLs externas sin modificar", () => {
    expect(cloudinaryImageUrl(EXTERNAL, { width: 600 })).toBe(EXTERNAL);
  });

  it("no altera URLs que ya incluyen transformaciones", () => {
    expect(cloudinaryImageUrl(TRANSFORMED, { width: 800 })).toBe(TRANSFORMED);
  });

  it("no altera URLs de Cloudinary sin segmento /image/upload/", () => {
    const rawVideo = "https://res.cloudinary.com/demo/video/upload/v1/clip.mp4";
    expect(cloudinaryImageUrl(rawVideo, { width: 600 })).toBe(rawVideo);
  });
});
