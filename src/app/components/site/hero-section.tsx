"use client";

import { useCallback, useEffect, useState, type PointerEvent, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronDown, Coffee, Music2 } from "lucide-react";
import { profile } from "@/config";
import { useSectionTheme } from "./theme-provider";
import {
  BookStackToy,
  CookingToy,
  DeskItem,
  DeskMusicProvider,
  FolderToy,
  GuitarToy,
  HeadphonesToy,
  LampToy,
  LighterToy,
  MacBookToy,
  MusicToy,
  NotebookToy,
  PenToy,
  StickyNoteToy,
} from "./desk-toys";

type HeroMode = "chaos" | "clean" | "music";

function BroomIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3v9" />
      <path d="M8 12h8" />
      <path d="M7 12c0 4 1.5 8 5 9 3.5-1 5-5 5-9" />
      <path d="M9 15.5h6" />
      <path d="M8.5 18h7" />
    </svg>
  );
}

type Pose = {
  left?: string;
  right?: string;
  top: string;
  rotate: number;
  scale?: number;
  opacity?: number;
  zIndex?: number;
};

type DeskKey =
  | "lamp"
  | "notebook"
  | "coffee"
  | "books"
  | "pen"
  | "lighter"
  | "sticky"
  | "guitar"
  | "headphones"
  | "macbook"
  | "folder"
  | "vinyl";

const POSES: Record<"chaos" | "music", Record<DeskKey, Pose>> = {
  chaos: {
    lamp: { left: "3%", top: "10%", rotate: -18, scale: 1 },
    notebook: { left: "10%", top: "36%", rotate: -14, scale: 1 },
    coffee: { left: "1%", top: "58%", rotate: 16, scale: 1.05 },
    books: { left: "18%", top: "72%", rotate: -10, scale: 1 },
    pen: { left: "28%", top: "86%", rotate: 28, scale: 1 },
    lighter: { left: "6%", top: "84%", rotate: -22, scale: 1 },
    sticky: { left: "24%", top: "44%", rotate: 18, scale: 1.05 },
    guitar: { left: "82%", top: "8%", rotate: 12, scale: 1 },
    headphones: { left: "86%", top: "38%", rotate: -16, scale: 1 },
    macbook: { left: "72%", top: "56%", rotate: 8, scale: 1 },
    folder: { left: "78%", top: "78%", rotate: -14, scale: 1 },
    vinyl: { left: "68%", top: "14%", rotate: 6, opacity: 0, scale: 0.6, zIndex: 5 },
  },
  music: {
    lamp: { left: "4%", top: "14%", rotate: -6, opacity: 0.3, scale: 0.7 },
    notebook: { left: "10%", top: "36%", rotate: -4, opacity: 0.22, scale: 0.65 },
    coffee: { left: "5%", top: "56%", rotate: 6, opacity: 0.25, scale: 0.65 },
    books: { left: "16%", top: "68%", rotate: -4, opacity: 0.2, scale: 0.6 },
    pen: { left: "24%", top: "78%", rotate: 10, opacity: 0.18, scale: 0.65 },
    lighter: { left: "10%", top: "78%", rotate: 0, opacity: 0.2, scale: 0.65 },
    sticky: { left: "22%", top: "44%", rotate: 4, opacity: 0.25, scale: 0.65 },
    guitar: { left: "88%", top: "10%", rotate: 4, opacity: 0.28, scale: 0.65 },
    headphones: { left: "86%", top: "32%", rotate: -4, opacity: 0.35, scale: 0.8 },
    macbook: { left: "76%", top: "52%", rotate: 2, opacity: 0.22, scale: 0.65 },
    folder: { left: "88%", top: "68%", rotate: -4, opacity: 0.2, scale: 0.65 },
    vinyl: {
      left: "50%",
      top: "62%",
      rotate: 0,
      opacity: 0,
      scale: 0.8,
      zIndex: 5,
    },
  },
};

const DESK_ITEMS: { key: DeskKey; node: ReactNode; delay: number; depth: number }[] = [
  { key: "lamp", node: <LampToy />, delay: 0.05, depth: 1.85 },
  { key: "notebook", node: <NotebookToy />, delay: 0.08, depth: 1.05 },
  { key: "coffee", node: <CookingToy />, delay: 0.1, depth: 1.55 },
  { key: "books", node: <BookStackToy />, delay: 0.12, depth: 0.9 },
  { key: "pen", node: <PenToy />, delay: 0.14, depth: 2.0 },
  { key: "lighter", node: <LighterToy />, delay: 0.16, depth: 1.7 },
  { key: "sticky", node: <StickyNoteToy />, delay: 0.11, depth: 1.4 },
  { key: "guitar", node: <GuitarToy />, delay: 0.09, depth: 1.2 },
  { key: "headphones", node: <HeadphonesToy />, delay: 0.13, depth: 1.65 },
  { key: "macbook", node: <MacBookToy />, delay: 0.15, depth: 0.95 },
  { key: "folder", node: <FolderToy />, delay: 0.17, depth: 1.15 },
];

/** Clean mode: 4 · 3 · 3 */
const CLEAN_ROWS: { key: DeskKey; node: ReactNode; className?: string }[][] = [
  [
    { key: "lamp", node: <LampToy />, className: "w-[68px]" },
    { key: "guitar", node: <GuitarToy />, className: "w-[52px]" },
    { key: "headphones", node: <HeadphonesToy />, className: "w-[84px]" },
    { key: "pen", node: <PenToy />, className: "w-[86px]" },
  ],
  [
    { key: "macbook", node: <MacBookToy />, className: "w-[140px]" },
    { key: "sticky", node: <StickyNoteToy />, className: "w-[86px]" },
    { key: "lighter", node: <LighterToy />, className: "w-[34px]" },
  ],
  [
    { key: "books", node: <BookStackToy />, className: "w-[104px]" },
    { key: "notebook", node: <NotebookToy />, className: "w-[112px]" },
    { key: "coffee", node: <CookingToy />, className: "w-[96px]" },
  ],
];

const MODES: {
  id: HeroMode;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
}[] = [
  { id: "chaos", label: "Chaos", icon: ({ className }) => <Coffee className={className} strokeWidth={1.75} /> },
  { id: "clean", label: "Clean", icon: BroomIcon },
  { id: "music", label: "Music", icon: ({ className }) => <Music2 className={className} strokeWidth={1.75} /> },
];

function IdentityCopy({ mode }: { mode: HeroMode }) {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`font-display font-semibold leading-[0.96] tracking-[-0.04em] text-ink ${
          mode === "clean"
            ? "text-[clamp(2.8rem,6.5vw,4.75rem)]"
            : "text-[clamp(2.8rem,8vw,5rem)]"
        }`}
      >
        {profile.name}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`mt-5 font-mono text-ink ${
          mode === "clean" ? "text-lg sm:text-xl" : "text-base"
        }`}
      >
        {profile.role}
      </motion.p>
      <p
        className={`mt-1.5 font-mono italic text-ink-muted ${
          mode === "clean" ? "text-base" : "text-sm"
        }`}
      >
        Code &amp; Craft
      </p>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className={`mt-7 leading-relaxed text-ink-muted ${
          mode === "clean"
            ? "text-base sm:text-lg sm:leading-relaxed"
            : "max-w-md text-[15px] sm:text-base"
        }`}
      >
        a thoughtful process of shipping interfaces that feel clear, fast, and a little
        delightful — for research, AI, and fintech.
      </motion.p>

      {mode === "clean" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-8 space-y-5"
        >
          <p className="text-base leading-relaxed text-ink/75 sm:text-[17px]">
            I care about the small things — typography, timing, and flows that feel calm
            under pressure. If it needs a tutorial, it isn&apos;t done yet.
          </p>
          <p className="font-mono text-sm text-ink-muted">
            {profile.location} · {profile.yearsExperience} years · {profile.availability}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="#work"
              className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition-transform hover:-translate-y-0.5"
            >
              Recently Made
            </a>
            <a
              href={profile.social.email}
              className="rounded-xl border border-ink/20 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/40"
            >
              Let&apos;s chat
            </a>
          </div>
        </motion.div>
      )}
    </>
  );
}

export function HeroSection() {
  useSectionTheme("sage", "top");
  const [mode, setMode] = useState<HeroMode>("chaos");

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 60, damping: 17, mass: 0.38 });
  const springY = useSpring(rawY, { stiffness: 60, damping: 17, mass: 0.38 });
  const textX = useTransform(springX, (v) => v * 0.35);
  const textY = useTransform(springY, (v) => v * 0.3);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (mode !== "chaos") return;
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      rawX.set(nx * 48);
      rawY.set(ny * 38);
    },
    [mode, rawX, rawY]
  );

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  useEffect(() => {
    if (mode !== "chaos") {
      rawX.set(0);
      rawY.set(0);
    }
  }, [mode, rawX, rawY]);

  return (
    <section
      id="top"
      data-scene="sage"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate min-h-[max(720px,100svh)] overflow-hidden px-5 pb-36 pt-28 sm:px-8"
    >
      <DeskMusicProvider>
        {/* Chaos / music — absolute scatter */}
        {mode !== "clean" && (
          <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
            {DESK_ITEMS.map((item) => {
              const pose = POSES[mode][item.key];
              return (
                <DeskItem
                  key={item.key}
                  pose={pose}
                  delay={item.delay}
                  depth={mode === "chaos" ? item.depth : 0}
                  parallaxX={mode === "chaos" ? springX : undefined}
                  parallaxY={mode === "chaos" ? springY : undefined}
                  drag={mode !== "music" || (pose.opacity ?? 1) > 0.5}
                >
                  {item.node}
                </DeskItem>
              );
            })}
          </div>
        )}

        {/* Clean — equal padded two columns, assets spread in WIDTH */}
        {mode === "clean" ? (
          <div className="relative z-10 mx-auto grid min-h-[62vh] w-full max-w-6xl grid-cols-1 items-start gap-10 pt-2 lg:grid-cols-2 lg:gap-20 lg:pt-4">
            <div className="flex flex-col justify-start text-left">
              <IdentityCopy mode="clean" />
            </div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="flex flex-col gap-8 sm:gap-10"
            >
              {CLEAN_ROWS.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className={`grid items-start justify-items-center gap-x-5 sm:gap-x-7 ${
                    row.length === 4
                      ? "grid-cols-4"
                      : row.length === 3
                        ? "grid-cols-3"
                        : "grid-cols-2"
                  }`}
                >
                  {row.map((item, i) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.04 * (rowIndex * 4 + i),
                        type: "spring",
                        stiffness: 220,
                        damping: 20,
                      }}
                      className={`pointer-events-auto ${item.className ?? ""}`}
                    >
                      {item.node}
                    </motion.div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          <>
            {mode !== "music" && (
              <div className="mb-6 lg:hidden">
                <div className="flex gap-4 overflow-x-auto pb-2">
                  <div className="w-[110px] shrink-0">
                    <HeadphonesToy />
                  </div>
                  <div className="w-[70px] shrink-0">
                    <LampToy />
                  </div>
                  <div className="w-[60px] shrink-0">
                    <GuitarToy />
                  </div>
                  <div className="w-[150px] shrink-0">
                    <MacBookToy />
                  </div>
                  {mode === "chaos" && (
                    <>
                      <div className="w-[100px] shrink-0">
                        <StickyNoteToy />
                      </div>
                      <div className="w-[110px] shrink-0">
                        <CookingToy />
                      </div>
                      <div className="w-[40px] shrink-0">
                        <LighterToy />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <motion.div
              style={
                mode === "chaos"
                  ? { x: textX, y: textY }
                  : undefined
              }
              className="relative z-10 mx-auto flex min-h-[58vh] max-w-xl flex-col items-center justify-center text-center will-change-transform"
            >
              <IdentityCopy mode={mode} />
            </motion.div>
          </>
        )}

        {/* Mode dock */}
        <div className="pointer-events-auto absolute bottom-6 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-3 px-4">
          {mode === "music" && (
            <div className="w-full max-w-[320px]">
              <MusicToy compact />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/90 p-1.5 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.35)] backdrop-blur-md">
            {MODES.map(({ id, label, icon: Icon }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  aria-label={label}
                  aria-pressed={active}
                  title={label}
                  className={`grid h-11 w-11 place-items-center rounded-xl transition-all ${
                    active
                      ? "bg-ink text-canvas shadow-sm"
                      : "text-ink/55 hover:bg-ink/[0.05] hover:text-ink"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </button>
              );
            })}
          </div>
          <p className="font-mono text-[10px] text-ink-muted">
            {mode === "chaos" && "chaos · move cursor · parallax desk"}
            {mode === "clean" && "clean · equal columns · assets wide"}
            {mode === "music" && "music · player above menu"}
          </p>
          <a
            href="#cooking"
            className="text-ink-muted transition-colors hover:text-ink"
            aria-label="Scroll down"
          >
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </a>
        </div>
      </DeskMusicProvider>
    </section>
  );
}
