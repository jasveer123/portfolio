"use client";

import Image, { type StaticImageData } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useExperience } from "@/lib/experience-store";
import { audio } from "@/lib/audio-manager";
import { airplaneMessages, belief, curiosity, enjoy, music, placePhotos, places, wallNote } from "@/lib/personal-data";

const PLACE_SLIDES = [{ ...places.photo, word: "Long roads" }, ...placePhotos];

type CardId = "music" | "places" | "enjoy" | "curiosity" | "belief";

type Spot = { x: number; y: number; r: number; z: number; mount: "tape" | "pin" };

/** Hand-placed, not a grid. x / y are % of the wall area. */
const SPOTS: Record<CardId, Spot> = {
  music: { x: 4, y: 7, r: -6, z: 4, mount: "tape" },
  places: { x: 25, y: 1, r: 3.5, z: 8, mount: "pin" },
  enjoy: { x: 47, y: 11, r: -2.5, z: 4, mount: "tape" },
  curiosity: { x: 70, y: 3, r: 5, z: 8, mount: "pin" },
  belief: { x: 29, y: 57, r: -5, z: 4, mount: "pin" },
};

const LANDINGS = [
  { x: 10, y: 80 },
  { x: 52, y: 86 },
  { x: 74, y: 78 },
  { x: 20, y: 88 },
];

/**
 * Projector off → Jasveer the person. Shown on the wall once the lamp has
 * cooled; settles away again when the projector warms up.
 */
export function PersonalWall() {
  const state = useExperience((s) => s.projectorState);
  const view = useExperience((s) => s.viewMode);
  const reduced = useExperience((s) => s.reducedMotion);
  // client-only: the wall belongs to the live scene, not the server-rendered page
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const show = mounted && state === "off" && view === "framed";
  const [open, setOpen] = useState<CardId | null>(null);
  const [breeze, setBreeze] = useState(0);
  const [slide, setSlide] = useState(0);
  const [prints, setPrints] = useState<{ id: number; src: StaticImageData; alt: string; x: number; y: number; r: number }[]>([]);

  useEffect(() => {
    if (!show) setOpen(null);
  }, [show]);

  useEffect(() => {
    if (open !== "places") setSlide(0);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const develop = useCallback(() => {
    setPrints((p) => {
      if (p.length >= 4) return p;
      const photo = enjoy.developed[p.length % enjoy.developed.length];
      const spots = [
        { x: 86, y: 44 },
        { x: 14, y: 46 },
        { x: 64, y: 44 },
        { x: 88, y: 66 },
      ];
      const at = spots[p.length];
      return [...p, { id: Date.now(), src: photo.src, alt: photo.alt, ...at, r: Math.random() * 12 - 6 }];
    });
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="wall"
          className="pwall"
          role="region"
          aria-label="Personal wall — projector off"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, delay: reduced ? 0 : 0.5 } }}
          exit={{ opacity: 0, transition: { duration: reduced ? 0.1 : 0.5 } }}
        >
          <AnimatePresence>
            {open && (
              <motion.button
                type="button"
                aria-label="Put the photograph back"
                className="pwall-dim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(null)}
              />
            )}
          </AnimatePresence>

          <Polaroid id="music" index={0} open={open} setOpen={setOpen} breeze={breeze} reduced={reduced} caption={music.caption}>
            {(isOpen) => <MusicFace open={isOpen} wallVisible={show} />}
          </Polaroid>
          <Polaroid
            id="places"
            index={1}
            open={open}
            setOpen={setOpen}
            breeze={breeze}
            reduced={reduced}
            caption={places.caption}
            liveCaption={open === "places" ? PLACE_SLIDES[slide].word : undefined}
          >
            {(isOpen) => <PlacesFace open={isOpen} slide={slide} setSlide={setSlide} reduced={reduced} />}
          </Polaroid>
          <Polaroid id="enjoy" index={2} open={open} setOpen={setOpen} breeze={breeze} reduced={reduced} caption={enjoy.caption}>
            {(isOpen) => <EnjoyFace open={isOpen} onDevelop={develop} />}
          </Polaroid>
          <Polaroid id="curiosity" index={3} open={open} setOpen={setOpen} breeze={breeze} reduced={reduced} caption={curiosity.caption}>
            {(isOpen) => <CuriosityFace open={isOpen} />}
          </Polaroid>
          <Polaroid id="belief" index={4} open={open} setOpen={setOpen} breeze={breeze} reduced={reduced} caption={belief.caption} variant="note">
            {(isOpen) => <BeliefFace open={isOpen} />}
          </Polaroid>

          {prints.map((p) => (
            <motion.figure
              key={p.id}
              className="ppol ppol-print"
              style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: 5 }}
              initial={{ opacity: 0, y: -40, rotate: p.r - 20, scale: 1.3 }}
              animate={{ opacity: 1, y: 0, rotate: p.r, scale: 1 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              <span className="ppol-tape" aria-hidden="true" />
              <div className="ppol-photo">
                <Image src={p.src} alt={p.alt} fill sizes="120px" />
              </div>
            </motion.figure>
          ))}

          <motion.p
            className="pwall-note"
            initial={{ opacity: 0, rotate: 6, y: 10 }}
            animate={{ opacity: 1, rotate: 2, y: 0, transition: { delay: reduced ? 0 : 1.6, duration: 0.8 } }}
          >
            <span className="ppol-tape" aria-hidden="true" />
            {wallNote}
          </motion.p>

          <HangingHeadphones breeze={breeze} reduced={reduced} />
          <PaperAirplane onBreeze={() => setBreeze((b) => b + 1)} reduced={reduced} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ cards */

function Polaroid({
  id,
  index,
  open,
  setOpen,
  breeze,
  reduced,
  caption,
  variant = "photo",
  liveCaption,
  children,
}: {
  id: CardId;
  index: number;
  open: CardId | null;
  setOpen: (id: CardId | null) => void;
  breeze: number;
  reduced: boolean;
  caption: string;
  variant?: "photo" | "note";
  liveCaption?: string;
  children: (open: boolean) => React.ReactNode;
}) {
  const spot = SPOTS[id];
  const isOpen = open === id;
  const controls = useAnimationControls();

  // the airplane's breeze reaches each card in turn
  useEffect(() => {
    if (!breeze || reduced) return;
    const t = setTimeout(
      () => void controls.start({ rotate: [spot.r, spot.r + 5, spot.r - 3, spot.r + 1, spot.r], transition: { duration: 1.1 } }),
      350 + spot.x * 14,
    );
    return () => clearTimeout(t);
  }, [breeze, controls, reduced, spot.r, spot.x]);

  return (
    <motion.div
      layout
      className={`ppol ${variant === "note" ? "ppol-note" : ""} ${isOpen ? "is-open" : ""}`}
      style={isOpen ? { zIndex: 30 } : { left: `${spot.x}%`, top: `${spot.y}%`, zIndex: spot.z }}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -24, rotate: spot.r - 10 }}
      animate={{ opacity: 1, y: 0, rotate: isOpen ? 0 : spot.r, transition: { delay: reduced ? 0 : 0.7 + index * 0.14, type: "spring", stiffness: 140, damping: 16 } }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 14, transition: { duration: 0.35, delay: index * 0.04 } }}
      transition={{ layout: { type: "spring", stiffness: 170, damping: 22 } }}
    >
      <motion.div animate={controls} className="ppol-inner">
        {spot.mount === "tape" ? <span className="ppol-tape" aria-hidden="true" /> : <span className="ppol-pin" aria-hidden="true" />}
        {!isOpen && (
          <button type="button" className="ppol-hit" aria-label={`Open ${caption}`} onClick={() => setOpen(id)} />
        )}
        {children(isOpen)}
        {variant === "photo" && (
          <p className="ppol-caption" aria-live={liveCaption ? "polite" : undefined}>
            {liveCaption ?? caption}
          </p>
        )}
        {isOpen && (
          <button type="button" className="ppol-close" aria-label="Put it back" onClick={() => setOpen(null)}>
            ×
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

/** Music: guitar strings shiver on hover; the pick opens the instrumental tracks. */
function MusicFace({ open, wallVisible }: { open: boolean; wallVisible: boolean }) {
  const [listOpen, setListOpen] = useState(false);
  const [track, setTrack] = useState<number | null>(null);
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const sound = useExperience((s) => s.soundEnabled);
  const tracks = music.tracks;

  useEffect(() => {
    if (!open) setListOpen(false);
  }, [open]);

  useEffect(() => {
    if (audioEl.current) audioEl.current.muted = !sound;
  }, [sound]);

  // any audio fades out when the wall goes away (projector back on)
  useEffect(() => {
    const el = audioEl.current;
    if (wallVisible || !el || el.paused) return;
    const fade = setInterval(() => {
      el.volume = Math.max(0, el.volume - 0.08);
      if (el.volume <= 0.01) {
        el.pause();
        clearInterval(fade);
      }
    }, 50);
    return () => clearInterval(fade);
  }, [wallVisible]);
  useEffect(() => () => audioEl.current?.pause(), []);

  const playTrack = (i: number) => {
    if (!audioEl.current) audioEl.current = new Audio();
    const el = audioEl.current;
    el.muted = !sound;
    if (track === i && !el.paused) {
      el.pause();
      setTrack(null);
      return;
    }
    el.src = tracks[i].src;
    el.volume = 0.7;
    void el.play().catch(() => setTrack(null));
    setTrack(i);
  };

  return (
    <div className="ppol-photo ppol-guitar">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <rect width="120" height="120" fill="#5f6b47" />
        <rect width="120" height="120" fill="url(#gWarm)" />
        <defs>
          <radialGradient id="gWarm" cx="40%" cy="35%" r="80%">
            <stop offset="0" stopColor="#f3d9a6" stopOpacity="0.35" />
            <stop offset="1" stopColor="#1d140c" stopOpacity="0.4" />
          </radialGradient>
        </defs>
        <g transform="rotate(-28 60 64)">
          <rect x="56" y="6" width="8" height="54" rx="2" fill="#3b2516" />
          <rect x="53" y="2" width="14" height="10" rx="2" fill="#2b1a10" />
          <ellipse cx="60" cy="74" rx="22" ry="20" fill="#b5713a" />
          <ellipse cx="60" cy="96" rx="27" ry="22" fill="#b5713a" />
          <ellipse cx="60" cy="80" rx="8" ry="8" fill="#2b1a10" />
          <rect x="49" y="102" width="22" height="4" rx="1" fill="#3b2516" />
          <g className="g-strings" stroke="#efe2c4" strokeWidth="0.6">
            {[-3, -1.8, -0.6, 0.6, 1.8, 3].map((d, i) => (
              <line key={i} x1={60 + d} y1="8" x2={60 + d} y2="104" style={{ animationDelay: `${i * 30}ms` }} />
            ))}
          </g>
        </g>
      </svg>
      <AnimatePresence>
        {open && tracks.length > 0 && (
          <motion.button
            type="button"
            className="g-pick"
            aria-label={listOpen ? "Hide the instrumentals" : "Show the instrumentals"}
            aria-expanded={listOpen}
            initial={{ x: 0, opacity: 0, rotate: 0 }}
            animate={{ x: "62%", opacity: 1, rotate: 18 }}
            exit={{ x: 0, opacity: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 120 }}
            onClick={() => setListOpen((v) => !v)}
          >
            <span>pick</span>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && listOpen && (
          <motion.ol
            className="g-playlist"
            aria-label={music.heading}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <li className="g-heading hand" aria-hidden="true">
              {music.heading} <span>♥</span>
            </li>
            {tracks.map((t, i) => (
              <li key={t.src}>
                <button type="button" aria-pressed={track === i} onClick={() => playTrack(i)}>
                  <span>{track === i ? "❚❚" : "▶"}</span> {t.title} {t.note && <em>{t.note}</em>}
                </button>
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Places: a route draws on hover. Open it and scroll (or swipe / arrow keys)
 * through photographs one by one; turn it over for the memory and the map.
 */
function PlacesFace({
  open,
  slide,
  setSlide,
  reduced,
}: {
  open: boolean;
  slide: number;
  setSlide: (fn: (n: number) => number) => void;
  reduced: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [dir, setDir] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const lastStep = useRef(0);
  const touchX = useRef<number | null>(null);
  const total = PLACE_SLIDES.length;

  useEffect(() => {
    if (!open) setFlipped(false);
  }, [open]);

  const step = useCallback(
    (d: 1 | -1) => {
      const now = performance.now();
      if (now - lastStep.current < 420) return; // one photo per scroll gesture
      lastStep.current = now;
      setDir(d);
      setSlide((n) => Math.min(total - 1, Math.max(0, n + d)));
    },
    [setSlide, total],
  );

  // scroll wheel / trackpad: one photograph per gesture (needs a non-passive listener)
  useEffect(() => {
    const el = ref.current;
    if (!el || !open || flipped) return;
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 4) return;
      e.preventDefault();
      step(delta > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") step(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") step(-1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, flipped, step]);

  const xs = places.stops.map((s) => `${s.x}%`);
  const ys = places.stops.map((s) => `${s.y}%`);
  const photo = PLACE_SLIDES[open ? slide : 0];

  return (
    <div
      ref={ref}
      className="ppol-flip"
      data-flipped={flipped ? "1" : "0"}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 30) step(dx < 0 ? 1 : -1);
      }}
    >
      <div className="ppol-face ppol-front">
        <div className="ppol-photo">
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={open ? slide : 0}
              className="slide-img"
              custom={dir}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir * 24, scale: 1.03 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -24 }}
              transition={{ duration: reduced ? 0.15 : 0.55, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 30vw, 60vw" placeholder="blur" />
            </motion.div>
          </AnimatePresence>
          {slide === 0 && (
            <svg className="route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M8 88 C 30 70, 22 52, 46 46 S 70 30, 92 12" />
            </svg>
          )}
          {open && !flipped && (
            <>
              <button type="button" className="slide-nav prev" aria-label="Previous photograph" disabled={slide === 0} onClick={() => step(-1)}>
                ‹
              </button>
              <button type="button" className="slide-nav next" aria-label="Next photograph" disabled={slide === total - 1} onClick={() => step(1)}>
                ›
              </button>
              <span className="slide-count" aria-hidden="true">
                {slide + 1} / {total}
              </span>
              {slide === 0 && <span className="slide-hint hand">scroll for more</span>}
            </>
          )}
        </div>
      </div>
      <div className="ppol-face ppol-back" aria-hidden={!flipped}>
        <p className="hand">{places.memory}</p>
        <div className="mini-map" aria-label="Places on the map">
          {places.stops.map((s) => (
            <span key={s.name} className="mini-stop" style={{ left: `${s.x}%`, top: `${s.y}%` }} title={s.memory}>
              <i /> {s.name}
            </span>
          ))}
          <motion.span
            className="mini-pin"
            aria-hidden="true"
            animate={{ left: [...xs, xs[0]], top: [...ys, ys[0]] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <ul className="mini-list">
          {places.stops.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> — {s.memory}
            </li>
          ))}
        </ul>
      </div>
      {open && (
        <button type="button" className="ppol-turn" onClick={() => setFlipped((f) => !f)}>
          {flipped ? "Turn back ↺" : "Turn over ↻"}
        </button>
      )}
    </div>
  );
}

/** Things I enjoy: steaming coffee, a book with one page, a camera that develops new Polaroids. */
function EnjoyFace({ open, onDevelop }: { open: boolean; onDevelop: () => void }) {
  const [page, setPage] = useState(false);
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    if (!open) setPage(false);
  }, [open]);

  return (
    <div className="ppol-photo ppol-enjoy">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <rect width="120" height="120" fill="#e3d2ad" />
        <rect y="78" width="120" height="42" fill="#7a4f2e" />
        {/* coffee */}
        <g className="steam" stroke="#fff6e4" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M22 50 c-4 -6 4 -10 0 -16" />
          <path d="M30 52 c-4 -6 4 -10 0 -16" />
        </g>
        <rect x="16" y="56" width="22" height="24" rx="3" fill="#f2ead8" />
        <path d="M38 62 q8 0 8 7 t-8 7" stroke="#f2ead8" strokeWidth="3" fill="none" />
        <rect x="18" y="57" width="18" height="4" fill="#4a2c18" />
        {/* books */}
        <rect x="50" y="68" width="34" height="7" fill="#5f6b47" />
        <rect x="52" y="61" width="30" height="7" fill="#a9573a" />
        <rect x="54" y="54" width="27" height="7" fill="#2f4a5c" />
        {/* camera */}
        <rect x="86" y="58" width="28" height="20" rx="3" fill="#2b231c" />
        <circle cx="100" cy="68" r="6" fill="#6d665c" stroke="#d6b679" strokeWidth="1.2" />
        <rect x="90" y="54" width="8" height="5" fill="#2b231c" />
      </svg>
      {open && (
        <>
          <button type="button" className="enjoy-hit enjoy-book" aria-label="Open the book" onClick={() => (audio.play("paper"), setPage((p) => !p))} />
          <button
            type="button"
            className="enjoy-hit enjoy-camera"
            aria-label="Take a photograph"
            onClick={() => {
              audio.play("flash");
              setFlash((f) => f + 1);
              setTimeout(onDevelop, 450);
            }}
          />
        </>
      )}
      <AnimatePresence>
        {flash > 0 && (
          <motion.span
            key={flash}
            className="enjoy-flash"
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {page && (
          <motion.blockquote
            className="enjoy-page"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p>“{enjoy.quote.text}”</p>
            <cite>— {enjoy.quote.by}</cite>
          </motion.blockquote>
        )}
      </AnimatePresence>
      {open && <p className="enjoy-hint">Try the book, or the camera.</p>}
    </div>
  );
}

/** Current curiosity: a handwritten question appears; open for the notes. */
function CuriosityFace({ open }: { open: boolean }) {
  const [n, setN] = useState(0);
  const q = curiosity.question;
  useEffect(() => {
    if (n >= q.length) return;
    const t = setTimeout(() => setN((x) => x + 1), n === 0 ? 1500 : 55);
    return () => clearTimeout(t);
  }, [n, q.length]);

  return (
    <div className="ppol-photo ppol-paper">
      <p className="hand cur-q">
        {q.slice(0, n)}
        <span className="cur-caret" aria-hidden="true" />
      </p>
      <span className="sr-only">{q}</span>
      <AnimatePresence>
        {open && (
          <motion.div className="cur-notes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ul>
              {curiosity.notes.map((x) => (
                <li key={x} className="hand">
                  {x}
                </li>
              ))}
            </ul>
            <svg viewBox="0 0 120 40" aria-hidden="true" className="cur-sketch">
              <rect x="4" y="10" width="30" height="18" rx="3" />
              <rect x="86" y="10" width="30" height="18" rx="3" />
              <path d="M36 19 C 52 4, 68 34, 84 19" />
              <path d="M78 15 l6 4 -6 4" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Small belief: a folded note that opens. */
function BeliefFace({ open }: { open: boolean }) {
  return (
    <div className="belief" data-open={open ? "1" : "0"}>
      <div className="belief-under">
        <p className="hand">{belief.text}</p>
      </div>
      <div className="belief-flap">
        <span className="hand">a small belief</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- headphones */

/** Headphones hanging on a brass nail; a click (or the airplane's breeze) sets them swinging. */
function HangingHeadphones({ breeze, reduced }: { breeze: number; reduced: boolean }) {
  const controls = useAnimationControls();
  const swing = (strength: number) => {
    if (reduced) return;
    const a = strength;
    void controls.start({
      rotate: [0, a, -a * 0.72, a * 0.48, -a * 0.3, a * 0.16, -a * 0.07, 0],
      transition: { duration: 2.8, ease: "easeInOut" },
    });
  };
  useEffect(() => {
    if (!breeze) return;
    const t = setTimeout(() => swing(5), 350 + 88 * 14);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breeze]);

  return (
    <motion.div
      className="hang"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: reduced ? 0 : 1.3, type: "spring", stiffness: 120, damping: 14 } }}
      exit={{ opacity: 0 }}
    >
      <span className="hang-nail" aria-hidden="true" />
      <motion.button
        type="button"
        className="hang-swing"
        aria-label="Headphones on a nail — give them a push"
        animate={controls}
        whileHover={reduced ? undefined : { rotate: 2 }}
        onClick={() => {
          audio.play("hang");
          swing(14);
        }}
      >
        <svg viewBox="0 0 120 130" aria-hidden="true">
          <defs>
            <linearGradient id="hpLeather" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#3a332d" />
              <stop offset="1" stopColor="#14100d" />
            </linearGradient>
          </defs>
          {/* headband hooked over the nail */}
          <path d="M22 86 C 18 30, 102 30, 98 86" fill="none" stroke="url(#hpLeather)" strokeWidth="11" strokeLinecap="round" />
          <path d="M24 84 C 21 36, 99 36, 96 84" fill="none" stroke="#5a5048" strokeWidth="0.8" strokeDasharray="2 2.4" />
          {/* yokes */}
          <rect x="16" y="78" width="10" height="16" rx="2" fill="#2a241f" />
          <rect x="94" y="78" width="10" height="16" rx="2" fill="#2a241f" />
          {/* ear cups */}
          <rect x="8" y="88" width="26" height="34" rx="9" fill="url(#hpLeather)" />
          <rect x="86" y="88" width="26" height="34" rx="9" fill="url(#hpLeather)" />
          <rect x="12" y="93" width="18" height="24" rx="6" fill="none" stroke="#4a423a" strokeWidth="1" />
          <rect x="90" y="93" width="18" height="24" rx="6" fill="none" stroke="#4a423a" strokeWidth="1" />
          {/* Marshall script logo across each cup */}
          {[21, 99].map((cx) => (
            <text
              key={cx}
              x={cx}
              y="106.5"
              textAnchor="middle"
              fill="#f4efe4"
              transform={`rotate(-8 ${cx} 105)`}
              style={{ font: "italic 600 6.4px var(--font-hand), 'Brush Script MT', cursive", letterSpacing: "-0.1px" }}
            >
              Marshall
            </text>
          ))}
          <circle cx="21" cy="115" r="1.8" fill="#c79a4a" />
          <circle cx="99" cy="115" r="1.8" fill="#c79a4a" />
          {/* coiled cable */}
          <path d="M21 122 c 0 6, -4 6, -2 10 s 4 4, 2 8" fill="none" stroke="#1d1814" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </motion.button>
    </motion.div>
  );
}

/* --------------------------------------------------------------- airplane */

function PaperAirplane({ onBreeze, reduced }: { onBreeze: () => void; reduced: boolean }) {
  const [pos, setPos] = useState({ x: 13, y: 74 });
  const [flying, setFlying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const controls = useAnimationControls();
  const flights = useRef(0);

  const fly = async () => {
    if (flying) return;
    setFlying(true);
    setMessage(null);
    audio.play("paper");
    const others = LANDINGS.filter((l) => Math.abs(l.x - pos.x) > 15);
    const land = others[(flights.current++ + Math.floor(Math.random() * others.length)) % others.length];
    onBreeze();
    if (reduced) {
      await controls.start({ left: `${land.x}%`, top: `${land.y}%`, transition: { duration: 0.2 } });
    } else {
      // up off the wall, a long curve across the photographs, then a glide down
      await controls.start({
        left: [`${pos.x}%`, `${pos.x + 6}%`, "34%", "62%", "86%", "70%", `${land.x}%`],
        top: [`${pos.y}%`, `${pos.y - 18}%`, "6%", "28%", "10%", "48%", `${land.y}%`],
        rotate: [0, -25, -8, 12, -20, 160, 180],
        zIndex: [6, 6, 6, 9, 9, 3, 6],
        scale: [1, 1.15, 1, 1.05, 1, 0.95, 1],
        transition: { duration: 3.4, ease: "easeInOut", times: [0, 0.08, 0.3, 0.5, 0.68, 0.86, 1] },
      });
      controls.set({ rotate: 0 });
    }
    setPos(land);
    setFlying(false);
    if (Math.random() < 0.65) {
      setMessage(airplaneMessages[Math.floor(Math.random() * airplaneMessages.length)]);
      setTimeout(() => setMessage(null), 4500);
    }
  };

  return (
    <motion.div className="plane" initial={false} animate={controls} style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: 6 }}>
      <button type="button" className="plane-hit" aria-label="Throw the paper airplane" onClick={fly} disabled={flying}>
        <svg viewBox="0 0 64 32" aria-hidden="true">
          <path d="M2 16 L62 2 L30 30 L26 19 Z" fill="#f3ecdb" stroke="#8a7a62" strokeWidth="0.8" />
          <path d="M26 19 L62 2 L22 17 Z" fill="#ddd0b3" />
        </svg>
      </button>
      <AnimatePresence>
        {message && (
          <motion.span className="plane-msg hand" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {message}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
