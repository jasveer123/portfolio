import type { StaticImageData } from "next/image";
import hills from "@/images/grid/photo9.jpeg";
import river from "@/images/grid/photo4.jpeg";
import wheat from "@/images/grid/photo8.jpeg";
import sky from "@/images/grid/photo1.jpeg";
import lanterns from "@/images/grid/photo10.jpeg";
import place01 from "@/images/places/place-01.jpg";
import place02 from "@/images/places/place-02.jpg";
import place03 from "@/images/places/place-03.jpg";
import place04 from "@/images/places/place-04.jpg";
import place05 from "@/images/places/place-05.jpg";
import place06 from "@/images/places/place-06.jpg";
import place07 from "@/images/places/place-07.jpg";
import place08 from "@/images/places/place-08.jpg";
import place09 from "@/images/places/place-09.jpg";
import place10 from "@/images/places/place-10.jpg";
import place11 from "@/images/places/place-11.jpg";
import place12 from "@/images/places/place-12.jpg";
import place13 from "@/images/places/place-13.jpg";
import place14 from "@/images/places/place-14.jpg";
import place15 from "@/images/places/place-15.jpg";

/**
 * The personal wall (shown while the projector is off).
 * Everything here is meant to be edited — write it in your own words.
 * Lines marked EDIT are placeholders drafted from the portfolio, not facts.
 */

export const wallNote = "The work is off. The person is still here.";

export type GuitarTrack = { title: string; note?: string; src: string };

/**
 * Instrumental guitar for the Music Polaroid.
 * Put audio files you have the rights to use in public/music/guitar/ and list
 * them here, e.g. { title: "Evening Blues", note: "instrumental", src: "/music/guitar/evening-blues.mp3" }.
 * While the list is empty the Polaroid simply shows the guitar.
 */
export const music = {
  caption: "Music",
  heading: "My favourite instrumentals",
  tracks: [
    { title: "Still Got the Blues", note: "instrumental", src: "/music/guitar/still-got-the-blues.mp3" },
    { title: "Hotel California", note: "solo", src: "/music/guitar/hotel-california-solo.mp3" },
    { title: "Back in Black", note: "instrumental", src: "/music/guitar/back-in-black.mp3" },
  ] as GuitarTrack[],
};

export type WallPhoto = { src: StaticImageData; alt: string; word: string };

/** Photographs from places I've been — scroll through them on the open Places Polaroid. */
export const placePhotos: WallPhoto[] = [
  { src: place01, alt: "A warmly lit bar with a glowing table lamp and brick walls", word: "Amber evenings" },
  { src: place02, alt: "A café with hanging terracotta lanterns and wooden tables", word: "Lanterns & long lunches" },
  { src: place03, alt: "A thin-crust pizza on a marble table, seen from above", word: "Wood-fired Sundays" },
  { src: place04, alt: "A table of pasta, pizza and drinks", word: "Slow dinners" },
  { src: place05, alt: "A wood-panelled bookshop with lit shelves", word: "Old bookshops" },
  { src: place06, alt: "A hill café with plates hung on a white wall", word: "White walls, painted plates" },
  { src: place07, alt: "A cosy lounge with a stone fireplace and red lamps", word: "A fire in the hills" },
  { src: place08, alt: "People outside an old building on a steep hill street", word: "Up the hill" },
  { src: place09, alt: "A crowd outside a heritage café front", word: "Queues worth waiting for" },
  { src: place10, alt: "A valley filled with clouds seen from a hilltop", word: "Above the clouds" },
  { src: place11, alt: "A latte and a pizza on a wooden café table", word: "Coffee, always" },
  { src: place12, alt: "A bakery counter under wooden beams", word: "Bakery counters" },
  { src: place13, alt: "A café with yellow walls and exposed beams", word: "Yellow walls, good light" },
  { src: place14, alt: "A café with a painted dog mural and globe lights", word: "Dogs on the walls" },
  { src: place15, alt: "A dim café interior with an arched doorway", word: "Late cafés" },
];

export type Place = { name: string; memory: string; x: number; y: number };

export const places = {
  caption: "Places",
  photo: { src: hills as StaticImageData, alt: "A quiet mountain road through tall pines" },
  // kinds of places, not addresses; x / y place each pin on the little sketch map (0–100)
  stops: [
    { name: "The hills", memory: "Pine air, cold mornings, long quiet roads.", x: 46, y: 14 },
    { name: "The beaches", memory: "Salt wind and slow sunsets.", x: 24, y: 72 },
    { name: "Open fields", memory: "Golden wheat and a sky with room to think.", x: 70, y: 56 },
  ] satisfies Place[],
  // EDIT: the memory on the back of the photograph
  memory: "Long drives, cold air and pine trees — the best ideas tend to arrive when the laptop is closed.",
};

export const enjoy = {
  caption: "Things I enjoy",
  // EDIT: your favourite quote for the book page
  quote: { text: "The best way to predict the future is to invent it.", by: "Alan Kay" },
  /** photographs the camera can "develop" into new Polaroids */
  developed: [
    { src: river as StaticImageData, alt: "Sunset over a river with a moored boat" },
    { src: wheat as StaticImageData, alt: "Golden wheat field against a low sun" },
    { src: sky as StaticImageData, alt: "Sunset over clouds from an aeroplane window" },
    { src: lanterns as StaticImageData, alt: "Woven lanterns glowing among plants" },
  ],
};

/** EDIT regularly — swap the question and notes as your curiosity moves on. */
export const curiosity = {
  caption: "Current curiosity",
  question: "How should AI agents use tools safely?",
  notes: [
    "Model Context Protocol — tools as contracts, not magic",
    "Permissions that a person can actually read",
    "Logs you could hand to someone else and they'd understand",
  ],
};

export const belief = {
  caption: "Small belief",
  text: "Stay curious enough to remain a beginner.",
};

export const airplaneMessages = [
  "Try the guitar pick.",
  "Turn a photograph over.",
  "Some ideas need time.",
  "Switch the projector back on.",
];
