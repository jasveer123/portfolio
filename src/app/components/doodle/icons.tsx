import type { CSSProperties } from "react";

type IconProps = { className?: string; style?: CSSProperties };

export const DoodleSpark = ({ className = "", style }: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} style={style} aria-hidden>
    <path
      d="M32 4c2 10 6 16 14 22-8 4-12 12-14 22-2-10-6-16-14-22 8-4 12-12 14-22Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M48 10v10M53 15H43" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

export const DoodleMusic = ({ className = "", style }: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} style={style} aria-hidden>
    <path
      d="M24 44a8 8 0 1 1-2-5.5V14l28-6v30"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="46" cy="44" r="8" stroke="currentColor" strokeWidth="2.4" />
  </svg>
);

export const DoodleArrow = ({ className = "", style }: IconProps) => (
  <svg viewBox="0 0 80 40" fill="none" className={className} style={style} aria-hidden>
    <path
      d="M4 28c18-18 36-18 58-8"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M52 12l16 8-12 12"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DoodleCircle = ({ className = "", style }: IconProps) => (
  <svg viewBox="0 0 120 120" fill="none" className={className} style={style} aria-hidden>
    <path
      d="M20 62c4-28 28-46 52-44s42 24 38 50-30 42-54 40S16 88 20 62Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const DoodleCode = ({ className = "", style }: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} style={style} aria-hidden>
    <path
      d="M22 18 8 32l14 14M42 18l14 14-14 14M36 12 28 52"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
