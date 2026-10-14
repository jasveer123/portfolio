"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { experienceStore, useExperience } from "@/lib/experience-store";
import { audio } from "@/lib/audio-manager";
import { photographs, playlist } from "@/lib/play-data";
import { ControlIcon } from "@/components/accessibility/SlideSymbol";

export function PlayProjection() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const wiredRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const sound = useExperience((s) => s.soundEnabled);
  const reduced = useExperience((s) => s.reducedMotion);
  const track = playlist[index];

  /** Route the element through Web Audio (analyser + global mute) on first play. */
  const wire = useCallback(() => {
    const el = audioRef.current;
    if (!el || wiredRef.current) return;
    audio.unlock();
    const ctx = audio.context;
    const dest = audio.musicDestination();
    if (!ctx || !dest) return;
    try {
      const src = ctx.createMediaElementSource(el);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;
      src.connect(analyser).connect(dest);
      analyserRef.current = analyser;
      wiredRef.current = true;
    } catch {
      /* already wired or unsupported — plays directly */
    }
  }, []);

  // without Web Audio the element itself honours mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = !sound && !wiredRef.current;
  }, [sound]);

  const play = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;
    wire();
    try {
      await el.play();
      setPlaying(true);
      audio.setMusicPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [wire]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    audio.setMusicPlaying(false);
  }, []);

  const change = (i: number) => {
    const n = (i + playlist.length) % playlist.length;
    setIndex(n);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.src = track.audioSrc;
    if (playing) void el.play().catch(() => setPlaying(false));
    // `playing` intentionally read without re-running on toggle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.audioSrc]);

  // stop the music when leaving the Play slide
  useEffect(() => {
    const el = audioRef.current;
    return () => {
      el?.pause();
      audio.setMusicPlaying(false);
    };
  }, []);

  // pause when the projector is switched off
  useEffect(
    () =>
      experienceStore.subscribe((s, p) => {
        if (s.projectorState === "cooling" && p.projectorState !== "cooling") pause();
      }),
    [pause],
  );

  // circular waveform around the record
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const data = new Uint8Array(128);
    const draw = () => {
      const size = canvas.clientWidth * Math.min(2, window.devicePixelRatio);
      if (canvas.width !== size) {
        canvas.width = size;
        canvas.height = size;
      }
      const c = size / 2;
      ctx.clearRect(0, 0, size, size);
      const analyser = analyserRef.current;
      if (analyser && playing) analyser.getByteFrequencyData(data);
      else data.fill(0);
      const bars = 96;
      const r0 = size * 0.41;
      ctx.lineCap = "round";
      ctx.lineWidth = Math.max(1.5, size / 220);
      for (let i = 0; i < bars; i++) {
        const v = data[Math.floor((i / bars) * 90)] / 255;
        const a = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const len = size * (0.008 + v * 0.07);
        ctx.strokeStyle = `rgba(169, 87, 58, ${0.25 + v * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
        ctx.lineTo(c + Math.cos(a) * (r0 + len), c + Math.sin(a) * (r0 + len));
        ctx.stroke();
      }
      if (playing && !reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

  return (
    <article className="proj" aria-labelledby="play-title">
      <p className="kicker">Slide 04 · Play</p>
      <h1 id="play-title" className="title-lg">
        Off the clock.
      </h1>
      <p className="muted" style={{ margin: "0.5em 0 1.6em", maxWidth: "52ch" }}>
        A few tracks from my playlist, and photographs from walks and travel. Press play — the projector hum steps
        aside.
      </p>

      <section className="play-grid" aria-label="Music player">
        <div className="record">
          <canvas ref={canvasRef} aria-hidden="true" />
          <div className="vinyl" data-playing={playing ? "1" : "0"}>
            <div className="label-art">
              <Image src={track.cover} alt="" fill sizes="120px" />
            </div>
          </div>
        </div>

        <div>
          <p className="label">Now on the turntable</p>
          <h2 className="title-md" style={{ fontSize: "clamp(22px, 2.8cqi, 32px)" }} aria-live="polite">
            {track.title}
          </h2>
          <p className="muted" style={{ margin: "0.2em 0 1em" }}>
            {track.artist}
          </p>
          <div className="transport">
            <button type="button" className="round-btn" aria-label="Previous track" onClick={() => change(index - 1)}>
              <ControlIcon name="prev" />
            </button>
            <button
              type="button"
              className="round-btn lg"
              aria-label={playing ? "Pause" : "Play"}
              aria-pressed={playing}
              onClick={() => (playing ? pause() : void play())}
            >
              <ControlIcon name={playing ? "pause" : "play"} size={20} />
            </button>
            <button type="button" className="round-btn" aria-label="Next track" onClick={() => change(index + 1)}>
              <ControlIcon name="next" />
            </button>
            <button
              type="button"
              className="round-btn"
              aria-label={sound ? "Mute all sound" : "Unmute sound"}
              aria-pressed={!sound}
              onClick={() => experienceStore.getState().setSoundEnabled(!sound)}
            >
              <ControlIcon name={sound ? "sound" : "mute"} />
            </button>
          </div>
          <ol className="tracklist" aria-label="Playlist">
            {playlist.map((t, i) => (
              <li key={t.id}>
                <button type="button" aria-current={i === index} onClick={() => change(i)}>
                  <span>
                    {String(i + 1).padStart(2, "0")} · {t.title}
                  </span>
                  <span className="muted">{t.artist}</span>
                </button>
              </li>
            ))}
          </ol>
          <audio
            ref={audioRef}
            preload="none"
            onEnded={() => change(index + 1)}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
          />
        </div>
      </section>

      <section aria-labelledby="photos-title" style={{ marginTop: "2em" }}>
        <h2 id="photos-title" className="label">
          Photographs
        </h2>
        <ul className="photo-strip">
          {photographs.map((p) => (
            <li key={p.alt}>
              <figure>
                <div className="ph">
                  <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 10vw, 30vw" placeholder="blur" />
                </div>
              </figure>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
