import { describe, expect, it } from "vitest";
import { cloudinaryImageUrl } from "./cloudinary-image";

const RAW_WITH_VERSION =
  "https://res.cloudinary.com/demo/image/upload/v1730000000/portal/production/novedades/foto.png";
const RAW_NO_VERSION =
  "https://res.cloudinary.com/demo/image/upload/portal/production/novedades/foto.png";
const RAW_DEVELOPMENT =
  "https://res.cloudinary.com/dcarquqc/image/upload/v1795833397/portal/development/novedades/jowcdiekqovnz50sqgw5.jpg";
const TRANSFORMED =
  "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_400/sample.jpg";
const EXTERNAL = "https://cdn.example.com/banner.jpg";

describe("cloudinaryImageUrl", () => {
  it("inserta transformaciones antes del version en URLs con carpeta portal/<entorno>/<tipo>/", () => {
    expect(cloudinaryImageUrl(RAW_WITH_VERSION, { width: 600 })).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_600/v1730000000/portal/production/novedades/foto.png",
    );
  });

  it("inserta transformaciones después de /upload/ cuando no hay version", () => {
    expect(cloudinaryImageUrl(RAW_NO_VERSION, { width: 600 })).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_600/portal/production/novedades/foto.png",
    );
  });

  it("inserta transformaciones antes del version en portal/development/novedades", () => {
    expect(cloudinaryImageUrl(RAW_DEVELOPMENT, { width: 400 })).toBe(
      "https://res.cloudinary.com/dcarquqc/image/upload/f_auto,q_auto,c_limit,w_400/v1795833397/portal/development/novedades/jowcdiekqovnz50sqgw5.jpg",
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
