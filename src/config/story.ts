export const beliefs = [
  {
    title: "Clarity beats cleverness",
    body: "If a flow needs a tutorial, the interface isn’t done. I obsess over making complex systems feel obvious.",
  },
  {
    title: "Ship moments, not screens",
    body: "Every click should feel intentional—fast, calm, and a little delightful. Performance is part of the design.",
  },
  {
    title: "Software should empower",
    body: "Whether it’s research ops, AI chat, or payments—I build tools that help people do their best work.",
  },
] as const;

export const storyChapters = [
  { id: "top", label: "Start", cue: "01" },
  { id: "beliefs", label: "Beliefs", cue: "02" },
  { id: "work", label: "Work", cue: "03" },
  { id: "experience", label: "Path", cue: "04" },
  { id: "play", label: "Play", cue: "05" },
  { id: "contact", label: "Connect", cue: "06" },
] as const;

export const playlist = [
  {
    id: 1,
    title: "Ahista Ahista",
    artist: "Kazinama",
    cover: "/music/cover/ahista.jpeg",
    audioSrc: "/music/Ahista.mp3",
  },
  {
    id: 2,
    title: "Die With A Smile",
    artist: "Lady Gaga & Bruno Mars",
    cover: "/music/cover/die.png",
    audioSrc: "/music/Diewithsmile.mp3",
  },
  {
    id: 3,
    title: "Ishq",
    artist: "Faheem Abdullah",
    cover: "/music/cover/ishq.jpeg",
    audioSrc: "/music/ishq.mp3",
  },
  {
    id: 4,
    title: "Kaen",
    artist: "Playlist pick",
    cover: "/music/cover/kaen.jpg",
    audioSrc: "/music/kaen.mp3",
  },
  {
    id: 5,
    title: "La Vita Ing",
    artist: "Playlist pick",
    cover: "/music/cover/dua.jpg",
    audioSrc: "/music/lavitaing.mp3",
  },
] as const;
