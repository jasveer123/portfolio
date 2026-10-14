import type { StaticImageData } from "next/image";
import { placePhotos } from "./personal-data";
import photo1 from "@/images/grid/photo1.jpeg";
import photo4 from "@/images/grid/photo4.jpeg";
import photo6 from "@/images/grid/photo6.jpeg";
import photo8 from "@/images/grid/photo8.jpeg";
import photo9 from "@/images/grid/photo9.jpeg";
import photo10 from "@/images/grid/photo10.jpeg";

export type Track = { id: number; title: string; artist: string; cover: string; audioSrc: string };

export const playlist: Track[] = [
  { id: 1, title: "Ahista Ahista", artist: "Kazinama", cover: "/music/cover/ahista.jpeg", audioSrc: "/music/Ahista.mp3" },
  { id: 2, title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars", cover: "/music/cover/die.png", audioSrc: "/music/Diewithsmile.mp3" },
  { id: 3, title: "Ishq", artist: "Faheem Abdullah", cover: "/music/cover/ishq.jpeg", audioSrc: "/music/ishq.mp3" },
  { id: 4, title: "Kaen", artist: "Playlist pick", cover: "/music/cover/kaen.jpg", audioSrc: "/music/kaen.mp3" },
  { id: 5, title: "La Vita Ing", artist: "Playlist pick", cover: "/music/cover/dua.jpg", audioSrc: "/music/lavitaing.mp3" },
];

/** Personal photographs from the previous portfolio gallery. */
export const photographs: { src: StaticImageData; alt: string }[] = [
  { src: photo1, alt: "Sunset over clouds seen from an aeroplane window" },
  { src: photo4, alt: "Sunset over a river with a moored boat" },
  { src: photo8, alt: "Golden wheat field against a low sun" },
  { src: photo9, alt: "Mountain road through tall pine trees" },
  { src: photo6, alt: "Tree-lined path in dappled light" },
  { src: photo10, alt: "Woven lanterns glowing among hanging plants" },
  ...placePhotos.map(({ src, alt }) => ({ src, alt })),
];
