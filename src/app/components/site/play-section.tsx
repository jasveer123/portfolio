"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { playlist } from "@/config";
import { DoodleMusic } from "../doodle/icons";
import { useSectionTheme } from "./theme-provider";

export function PlaySection() {
  useSectionTheme("mist", "play");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const track = playlist[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.audioSrc;
    audio.load();
    if (playing) {
      void audio.play().catch(() => setPlaying(false));
    }
    // only rebind when track changes; `playing` read intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, track.audioSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (!audio.duration) return;
      setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnded = () => setIndex((i) => (i + 1) % playlist.length);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      await audio.play();
      setPlaying(true);
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    setIndex((i) => (i + 1) % playlist.length);
    setScore((s) => s + 2);
  };

  const prev = () => {
    setIndex((i) => (i - 1 + playlist.length) % playlist.length);
  };

  return (
    <section id="play" data-scene="mist" className="flex min-h-[max(560px,100svh)] flex-col justify-center px-5 py-24 sm:px-10 lg:px-16">
      <audio ref={audioRef} preload="metadata" />
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-ink-muted">
              Play · Interactive
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.4rem,7vw,4.5rem)] font-semibold tracking-tight text-ink">
              Music quest
            </h2>
            <p className="mt-3 max-w-md text-ink-muted">
              Hit play, skip tracks, rack up vibe points. A tiny game for when the portfolio
              needs a soundtrack.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-ink/20 bg-canvas-elevated px-4 py-2 font-mono text-sm text-ink">
            <DoodleMusic className="h-4 w-4 text-signal" />
            Vibe score: {score}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            layout
            className="rounded-[2rem] border-2 border-dashed border-ink/15 bg-ink p-6 text-canvas sm:p-8"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-[1.4rem] border border-canvas/15 sm:mx-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={track.cover}
                      alt={track.title}
                      fill
                      className="object-cover"
                      sizes="176px"
                    />
                  </motion.div>
                </AnimatePresence>
                {playing && (
                  <div className="absolute inset-x-4 bottom-3 flex items-end justify-center gap-1">
                    {[0, 1, 2, 3, 4].map((bar) => (
                      <motion.span
                        key={bar}
                        className="w-1.5 rounded-full bg-signal"
                        animate={{ height: [8, 22, 10, 26, 8] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: bar * 0.08,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs uppercase tracking-[0.2em] text-signal">Now playing</p>
                <h3 className="mt-2 font-display text-3xl font-semibold">{track.title}</h3>
                <p className="mt-1 text-canvas/65">{track.artist}</p>

                <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-canvas/15">
                  <div
                    className="h-full rounded-full bg-signal transition-[width] duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-6 flex items-center justify-center gap-3 sm:justify-start">
                  <button
                    type="button"
                    onClick={prev}
                    className="grid h-11 w-11 place-items-center rounded-full border border-canvas/20 hover:bg-canvas/10"
                    aria-label="Previous track"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggle()}
                    className="grid h-14 w-14 place-items-center rounded-full bg-signal text-ink hover:brightness-110"
                    aria-label={playing ? "Pause" : "Play"}
                  >
                    {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="grid h-11 w-11 place-items-center rounded-full border border-canvas/20 hover:bg-canvas/10"
                    aria-label="Next track"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                  <Volume2 className="ml-2 hidden h-4 w-4 text-canvas/50 sm:block" />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="rounded-[2rem] border-2 border-dashed border-ink/15 bg-canvas-elevated p-4 sm:p-5">
            <p className="mb-3 px-2 text-xs uppercase tracking-[0.18em] text-ink-muted">
              Pick a track · +2 vibe
            </p>
            <ul className="space-y-2">
              {playlist.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setIndex(i);
                      setPlaying(true);
                      setScore((s) => s + 2);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                      i === index
                        ? "bg-ink text-canvas"
                        : "hover:bg-ink/[0.04] text-ink"
                    }`}
                  >
                    <span className="relative h-11 w-11 overflow-hidden rounded-xl">
                      <Image src={item.cover} alt="" fill className="object-cover" sizes="44px" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{item.title}</span>
                      <span
                        className={`block truncate text-xs ${
                          i === index ? "text-canvas/60" : "text-ink-muted"
                        }`}
                      >
                        {item.artist}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] opacity-60">0{i + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
