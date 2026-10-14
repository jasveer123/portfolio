import { renderOgImage, OG_SIZE } from "./og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Jasveer Singh — Software Engineer. A portfolio shown through a vintage slide projector.";

export default function Image() {
  return renderOgImage({ kicker: "Slide 01 · Portfolio", title: "Jasveer Singh", subtitle: "Software Engineer — full-stack, AI & LLM products, research tech" });
}
