"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePrefersReducedMotion } from "@/lib/motion";

interface HeroVideoProps {
  orgName: string;
  ctaLabel: string;
  ctaHref: string;
  external?: boolean;
}

/** Same footage encoded three ways (see public/video). Smaller screens get a much lighter file. */
const RENDITIONS = [
  { minWidth: 1100, src: "/video/hero-1080.mp4" },
  { minWidth: 600, src: "/video/hero-720.mp4" },
  { minWidth: 0, src: "/video/hero-480.mp4" },
] as const;

const POSTER = "/video/hero-poster.jpg";

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

function pickRendition(): string {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  const slowLink = connection?.effectiveType === "2g" || connection?.effectiveType === "3g";
  if (slowLink) return RENDITIONS[2].src;
  return (RENDITIONS.find((r) => window.innerWidth >= r.minWidth) ?? RENDITIONS[2]).src;
}

/**
 * Full-width background video (wearethenew.org style): muted, looping, no
 * controls. The footage has text burned into the picture, so the box is never
 * narrower than 16:9 — the whole frame always shows instead of being cropped to
 * a phone-shaped slice. Phones/tablets get the CTAs in a strip under the video;
 * wide screens float them bottom-right, clear of the burned-in captions.
 *
 * On laptops the box is shorter than 16:9 (capped at 88vh), so the picture is
 * cropped vertically; the crop is anchored near the top (12%) because the
 * channel logo lives in the top 4-16% of the frame while the captions end by ~88%.
 *
 * The poster paints immediately (priority image), the video fades in once it is
 * actually playing, and it never loads at all for visitors who asked for less
 * motion or less data.
 */
export function HeroVideo({ orgName, ctaLabel, ctaHref, external }: HeroVideoProps) {
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Choose the file client-side (Safari ignores <source media>) and only then
  // start loading it. Visitors who asked for less motion or less data never
  // download the video at all — the poster simply stays.
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (reducedMotion || connection?.saveData) return;

    video.src = pickRendition();
    video.load();

    // Only play while the hero is on screen (saves battery/CPU further down the page).
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // play() rejects under iOS Low Power Mode — the poster simply stays.
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      video.removeAttribute("src");
      video.load();
    };
  }, [reducedMotion]);

  return (
    <section ref={sectionRef} className="relative w-full bg-night" aria-label="The New Breed Church">
      <h1 className="sr-only">Welcome to {orgName}</h1>

      <div className="relative h-[min(88vh,56.25vw)] w-full overflow-hidden">
        {/* Served as the plain file (not via /_next/image): it is already a 60 KB JPEG, and the image
            preparer can wedge on a first request that the browser cancels (see patches/next). */}
        <Image src={POSTER} alt="" fill priority unoptimized sizes="100vw" className="object-cover object-[50%_12%]" />
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload nofullscreen noremoteplayback"
          onPlaying={() => setPlaying(true)}
          className={`hero-video absolute inset-0 h-full w-full object-cover object-[50%_12%] transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/3 bg-gradient-to-t from-night/70 to-transparent xl:block" />
      </div>

      <div className="flex flex-wrap justify-center gap-3 px-4 py-6 sm:px-6 xl:absolute xl:bottom-10 xl:right-9 xl:p-0">
        <Link
          href={ctaHref}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="bg-brand-600 px-6 py-4 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-500"
        >
          {ctaLabel}
        </Link>
        <Link
          href="/about"
          className="border border-brand-300 px-6 py-4 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-white/10"
        >
          About us
        </Link>
      </div>
    </section>
  );
}
