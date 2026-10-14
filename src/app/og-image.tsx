import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared Open Graph card: the scene with the projector on and text in the light. */
export async function renderOgImage({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  const base = await readFile(path.join(process.cwd(), "src/app/og-base.jpg"));
  const src = `data:image/jpeg;base64,${base.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#120e0b" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0 }} />
        <div
          style={{
            position: "absolute",
            // the lit projection rectangle in og-base.jpg (captured at 1200×630)
            left: 314,
            top: 29,
            width: 611,
            height: 409,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 44px",
            color: "#2a221d",
          }}
        >
          <div style={{ fontSize: 18, letterSpacing: 4, textTransform: "uppercase", color: "#3d4530" }}>{kicker}</div>
          <div style={{ fontSize: 58, lineHeight: 1.02, marginTop: 14, fontWeight: 600 }}>{title}</div>
          <div style={{ fontSize: 24, marginTop: 16, color: "#5d5147" }}>{subtitle}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
