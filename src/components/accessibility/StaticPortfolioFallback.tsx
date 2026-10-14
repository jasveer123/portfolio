import Image from "next/image";

/**
 * Used when WebGL is unavailable or the device is very low-powered: a still of
 * the scene behind the fully functional HTML portfolio. Navigation, case-study
 * views, the timeline and every link keep working through the HTML controls.
 */
export function StaticPortfolioFallback() {
  return (
    <>
      <Image
        className="stage-poster"
        src="/projector/poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ opacity: 1, filter: "brightness(0.8) saturate(0.95)" }}
      />
      <p className="sr-only">Interactive 3D projector unavailable on this device — showing the static portfolio.</p>
    </>
  );
}
