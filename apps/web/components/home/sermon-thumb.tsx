"use client";

import { useState } from "react";
import Image from "next/image";

// YouTube only guarantees the 480x360 hqdefault; maxresdefault (1280x720) exists
// for most videos. The featured card is shown ~1000px wide, so try the sharp one
// first and drop back to hqdefault if YouTube 404s it.
export function SermonThumb({
  src,
  fallbackSrc,
  sizes,
  className,
}: {
  src: string;
  fallbackSrc: string;
  sizes: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(src);
  return (
    <Image
      src={current}
      alt=""
      fill
      sizes={sizes}
      className={className}
      onLoad={(e) => {
        // YouTube serves a 120x90 grey placeholder (200 OK) for some missing maxres images.
        if (e.currentTarget.naturalWidth <= 120 && current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
      onError={() => current !== fallbackSrc && setCurrent(fallbackSrc)}
    />
  );
}
