"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { motion, useTransform, type MotionValue, motionValue } from "framer-motion";
import { playlist } from "@/config";

const zeroMotion = motionValue(0);

type DeskPose = {
  left?: string;
  right?: string;
  top: string;
  rotate: number;
  scale?: number;
  opacity?: number;
  zIndex?: number;
};

type DeskItemProps = {
  children: ReactNode;
  pose: DeskPose;
  delay?: number;
  drag?: boolean;
  /** Parallax depth — higher = moves more with mouse (chaos mode) */
  depth?: number;
  parallaxX?: MotionValue<number>;
  parallaxY?: MotionValue<number>;
};

export function DeskItem({
  children,
  pose,
  delay = 0,
  drag = true,
  depth = 0,
  parallaxX,
  parallaxY,
}: DeskItemProps) {
  const horizontal =
    pose.right != null
      ? { right: pose.right, left: "auto" as const }
      : { left: pose.left ?? "0%", right: "auto" as const };

  const px = useTransform(parallaxX ?? zeroMotion, (v) => v * depth);
  const py = useTransform(parallaxY ?? zeroMotion, (v) => v * depth);

  return (
    <motion.div
      drag={drag}
      dragMomentum={false}
      dragElastic={0.12}
      initial={{ opacity: 0, scale: 0.88, rotate: pose.rotate }}
      animate={{
        ...horizontal,
        top: pose.top,
        rotate: pose.rotate,
        scale: pose.scale ?? 1,
        opacity: pose.opacity ?? 1,
        zIndex: pose.zIndex ?? 20,
      }}
      style={{
        ...horizontal,
        top: pose.top,
        x: parallaxX ? px : undefined,
        y: parallaxY ? py : undefined,
      }}
      transition={{
        delay,
        type: "spring",
        stiffness: 180,
        damping: 22,
      }}
      whileHover={drag ? { scale: (pose.scale ?? 1) * 1.04, zIndex: 40 } : undefined}
      whileDrag={
        drag ? { scale: (pose.scale ?? 1) * 1.06, zIndex: 50, cursor: "grabbing" } : undefined
      }
      className={`absolute touch-none select-none will-change-transform ${
        (pose.opacity ?? 1) < 0.4
          ? "pointer-events-none"
          : "pointer-events-auto cursor-grab"
      }`}
      data-cursor="grab"
    >
      {children}
    </motion.div>
  );
}

type CutoutProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

function Cutout({ src, alt, width, height, className = "", priority }: CutoutProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      draggable={false}
      className={`pointer-events-none h-auto w-full drop-shadow-[0_14px_28px_rgba(0,0,0,0.18)] ${className}`}
    />
  );
}

type DeskMusicCtx = {
  playing: boolean;
  toggle: () => void;
  track: (typeof playlist)[number];
};

const DeskMusicContext = createContext<DeskMusicCtx | null>(null);

export function DeskMusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const track = playlist[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing]);

  return (
    <DeskMusicContext.Provider
      value={{
        playing,
        toggle: () => setPlaying((p) => !p),
        track,
      }}
    >
      <audio ref={audioRef} src={track.audioSrc} preload="metadata" />
      {children}
    </DeskMusicContext.Provider>
  );
}

function useDeskMusic() {
  const ctx = useContext(DeskMusicContext);
  if (!ctx) throw new Error("useDeskMusic must be used within DeskMusicProvider");
  return ctx;
}

/** Vinyl — primary play control */
export function MusicToy({ compact = false }: { compact?: boolean }) {
  const { playing, toggle, track } = useDeskMusic();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-3 rounded-2xl border border-ink/10 bg-white/95 p-3 text-left shadow-lg backdrop-blur"
        aria-label={playing ? "Pause track" : "Play track"}
      >
        <div className="relative h-14 w-14 shrink-0">
          <Image
            src="/assets/desk/desk-vinyl.png"
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
            draggable={false}
          />
        </div>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[12px] font-semibold text-ink">
            {track.title}
          </span>
          <span className="block truncate font-mono text-[11px] text-ink-muted">
            {track.artist}
          </span>
          <span className="mt-1 block font-mono text-[10px] text-ink-muted">
            {playing ? "playing · tap to pause" : "tap to play"}
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="w-[150px]">
      <button
        type="button"
        onClick={toggle}
        className="block w-full text-left"
        aria-label={playing ? "Pause track" : "Play track"}
      >
        <motion.div
          animate={{ rotate: playing ? 360 : 0 }}
          transition={
            playing
              ? { duration: 4, repeat: Infinity, ease: "linear" }
              : { duration: 0.4 }
          }
        >
          <Cutout
            src="/assets/desk/desk-vinyl.png"
            alt="Vinyl record"
            width={900}
            height={717}
            priority
          />
        </motion.div>
      </button>
      <div className="mt-2 rounded-lg bg-white/80 px-2 py-1.5 backdrop-blur-sm">
        <p className="truncate font-mono text-[11px] text-ink">{track.title}</p>
        <p className="truncate font-mono text-[10px] text-ink-muted">{track.artist}</p>
        <p className="mt-1 font-mono text-[9px] text-ink-muted">
          {playing ? "playing · tap to pause" : "tap to play · drag me"}
        </p>
      </div>
    </div>
  );
}

export function FolderToy() {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="relative w-[140px] text-left"
      aria-label="Toggle project folder"
    >
      <motion.div animate={{ y: open ? -6 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
        <Cutout
          src="/assets/desk/desk-folder.png"
          alt="Project folder"
          width={900}
          height={603}
        />
      </motion.div>
      {open && (
        <p className="mt-1 text-center font-mono text-[9px] text-ink-muted">opened · tap again</p>
      )}
    </button>
  );
}

export function EditorPaletteToy() {
  return (
    <div className="w-[92px]">
      <Cutout
        src="/assets/desk/desk-tools.png"
        alt="Desk tools"
        width={730}
        height={872}
      />
    </div>
  );
}

export function NotebookToy() {
  return (
    <div className="w-[168px]">
      <Cutout
        src="/assets/desk/desk-notebook.png"
        alt="Open notebook"
        width={900}
        height={678}
      />
    </div>
  );
}

export function BookStackToy() {
  return (
    <div className="w-[150px]">
      <Cutout
        src="/assets/desk/desk-books.png"
        alt="Stack of books"
        width={900}
        height={626}
      />
    </div>
  );
}

export function PenToy() {
  return (
    <div className="w-[120px]">
      <Cutout src="/assets/desk/desk-pen.png" alt="Fountain pen" width={899} height={529} />
    </div>
  );
}

export function LighterToy() {
  const [lit, setLit] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setLit((v) => !v)}
      className="relative w-[48px]"
      aria-label="Toggle lighter"
    >
      <Cutout
        src="/assets/desk/desk-lighter.png"
        alt="Lighter"
        width={349}
        height={876}
      />
      {lit && (
        <motion.div
          className="pointer-events-none absolute -top-3 left-1/2 h-7 w-3.5 -translate-x-1/2 rounded-full bg-gradient-to-t from-[#ff6a00] to-[#ffd166] blur-[0.5px]"
          animate={{ scaleY: [1, 1.2, 0.92, 1], opacity: [0.85, 1, 0.8, 1] }}
          transition={{ duration: 0.45, repeat: Infinity }}
        />
      )}
    </button>
  );
}

export function CookingToy() {
  const [spilled, setSpilled] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setSpilled((s) => !s)}
      className="relative w-[150px]"
      aria-label={spilled ? "Reset coffee" : "Spill coffee"}
    >
      <Cutout
        src={spilled ? "/assets/desk/desk-coffee-spill.png" : "/assets/desk/desk-coffee.png"}
        alt={spilled ? "Spilled coffee" : "Coffee mug"}
        width={spilled ? 900 : 873}
        height={spilled ? 586 : 571}
      />
      {!spilled &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-[8%] h-7 w-1.5 -translate-x-1/2 rounded-full bg-white/70"
            style={{ marginLeft: (i - 1) * 10 }}
            animate={{ y: [-2, -18], opacity: [0.55, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.22 }}
          />
        ))}
    </button>
  );
}

/** Marshall headphones — play music */
export function HeadphonesToy() {
  const { playing, toggle, track } = useDeskMusic();

  return (
    <div className="w-[120px]">
      <button
        type="button"
        onClick={toggle}
        className="block w-full text-left"
        aria-label={playing ? "Pause playlist" : "Play playlist"}
      >
        <motion.div
          animate={playing ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          transition={
            playing
              ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
        >
          <Cutout
            src="/assets/desk/desk-marshall.png"
            alt="Marshall headphones"
            width={900}
            height={900}
            priority
          />
        </motion.div>
      </button>
      <div className="mt-1.5 rounded-lg bg-white/80 px-2 py-1.5 backdrop-blur-sm">
        <p className="font-mono text-[10px] font-semibold text-ink">Play music</p>
        <p className="truncate font-mono text-[9px] text-ink-muted">
          {playing ? `${track.title} · playing` : "tap headphones"}
        </p>
      </div>
    </div>
  );
}

/** Cool articulated desk lamp — tap for glow */
export function LampToy() {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className="relative w-[100px]"
      aria-label={on ? "Turn lamp off" : "Turn lamp on"}
    >
      {on && (
        <motion.div
          className="pointer-events-none absolute -inset-10 -z-10 rounded-full"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            opacity: [0.55, 0.9, 0.65],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(circle at 40% 35%, rgba(255,210,120,0.8) 0%, rgba(255,180,80,0.35) 40%, transparent 70%)",
          }}
        />
      )}
      <Cutout
        src={on ? "/assets/desk/desk-lamp-on.png" : "/assets/desk/desk-lamp-off.png"}
        alt={on ? "Desk lamp on" : "Desk lamp off"}
        width={on ? 646 : 648}
        height={900}
      />
    </button>
  );
}

export function GuitarToy() {
  const [strum, setStrum] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setStrum((n) => n + 1)}
      className="w-[72px]"
      aria-label="Strum guitar"
    >
      <motion.div
        key={strum}
        animate={strum === 0 ? { rotate: 0 } : { rotate: [0, -3, 2.5, -1.5, 0] }}
        transition={{ duration: 0.45 }}
      >
        <Cutout
          src="/assets/desk/desk-guitar.png"
          alt="Yamaha acoustic guitar"
          width={350}
          height={900}
        />
      </motion.div>
    </button>
  );
}

export function MacBookToy() {
  const [awake, setAwake] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setAwake((v) => !v)}
      className="relative w-[190px] text-left"
      aria-label={awake ? "Sleep MacBook" : "Wake MacBook"}
    >
      <Cutout
        src={awake ? "/assets/desk/desk-macbook.png" : "/assets/desk/desk-macbook-off.png"}
        alt={awake ? "MacBook coding" : "MacBook asleep"}
        width={900}
        height={awake ? 629 : 645}
      />
      <p className="mt-1.5 rounded-md bg-white/80 px-2 py-1 font-mono text-[9px] text-ink-muted backdrop-blur-sm">
        {awake ? "screen on · tap to sleep" : "tap to wake · open terminal"}
      </p>
    </button>
  );
}

export function StickyNoteToy() {
  return (
    <div className="w-[118px]">
      <Cutout
        src="/assets/desk/desk-sticky.png"
        alt='Sticky note: "ship clear interfaces"'
        width={663}
        height={700}
      />
    </div>
  );
}
