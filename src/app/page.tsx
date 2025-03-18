"use client";
import React, { useEffect, useState } from "react";
import { EducationSection } from "./components/portfolio/education-section";
import { IntroSection } from "./components/portfolio/intro-section";
import { ProjectsSection } from "./components/portfolio/projects-section";
import { TechStackSection } from "./components/portfolio/stack-section";
import { SummarySection } from "./components/portfolio/summary-section";
import { PageFooter } from "./components/ui/page-footer";
import { ProfileHeader } from "./components/ui/profile-header";
import Timeline from "./components/portfolio/timeline";
import { Dock } from "./components/ui/dock";
import { Sun, Home, Bulb, Card, Bag, Stack, Arrow } from "./components/icons/shared";
import PinterestGrid from "./components/portfolio/gallary";
import WorkTogether from "./components/portfolio/work-together";
import MusicPlayer from "./components/portfolio/music-player";
import { MusicIcon } from "./components/icons/shared";

export default function Page() {
  const [isMusicPlayerVisible, setIsMusicPlayerVisible] = useState<boolean>(false);
  const [cursorIndex, setCursorIndex] = useState<number>(0);
  const cursorStyles = [
    'url(/cursor.png) 16 16, auto',
    'url(/fly.png) 10 10, auto',
    'url(/kite.png) 16 16, auto'
  ];

  const cycleCursor = () => {
    setCursorIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % cursorStyles.length;
      return nextIndex;
    });
  };

  useEffect(() => {
    document.body.style.cursor = cursorStyles[cursorIndex];
  }, [cursorIndex]);

  const handleArrowClick = () => {
    cycleCursor();
  };

  const toggleMusicPlayer = () => {
    setIsMusicPlayerVisible((prev) => !prev);
  };

  const items = [
    {
      icon: Sun,
      label: "Intro",
      onClick: () => document.querySelector('.intro-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      icon: Home,
      label: "Home",
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    {
      icon: Bulb,
      label: "Timeline",
      onClick: () => document.querySelector('.timeline-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      icon: Stack,
      label: "Tech Stack",
      onClick: () => document.querySelector('.tech-stack-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      icon: Card,
      label: "Projects",
      onClick: () => document.querySelector('.projects-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      icon: Bag,
      label: "Education",
      onClick: () => document.querySelector('.education-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      icon: MusicIcon,
      label: "Music",
      onClick: toggleMusicPlayer
    },
    {
      icon: Arrow,
      label: "Cursor",
      onClick: handleArrowClick
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        window.location.href = "mailto:jasveer3101998@gmail.com?subject=Let's Work Together&body=Hi, I'd love to discuss a project with you!";
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ProfileHeader professions={["Senior Software Engineer", "Blockchain and Ai enthusiast", "Cooking baking"]} />
        <div className="intro-section"><IntroSection /></div>
        <div className="timeline-section"><Timeline /></div>
        <div className="projects-section"><ProjectsSection /></div>
        <div className="tech-stack-section"><TechStackSection /></div>
        <PinterestGrid />
        <div className="education-section"><EducationSection /></div>
        <div className="summary-section"><SummarySection /></div>
        <WorkTogether />
        <PageFooter creator="Jasveer Singh" />
        <Dock items={items} autoHideDelay={5000} />
      </div>
      <MusicPlayer isVisible={isMusicPlayerVisible} toggleVisibility={toggleMusicPlayer} />
    </>
  );
}
