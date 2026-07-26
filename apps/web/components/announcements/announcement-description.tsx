"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Truncated description with a "Read more" toggle that only appears when
 * the text actually overflows its 2-line clamp — measured via
 * scrollHeight > clientHeight, the standard -webkit-line-clamp detection
 * trick, rather than shown unconditionally regardless of length.
 *
 * Lives inside AnnouncementCard's outer `<Link>` (the whole card navigates
 * on click), so the toggle is a `<button>` with stopPropagation/
 * preventDefault to expand in place instead of following the link.
 */
export function AnnouncementDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function measure() {
      const el = textRef.current;
      if (!el || expanded) return;
      setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [description, expanded]);

  // Collapses back on an outside click or on scroll ("snaps back"), so the
  // expanded state doesn't linger once the user's attention has moved on.
  useEffect(() => {
    if (!expanded) return;

    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    function handleScroll() {
      setExpanded(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [expanded]);

  return (
    <div ref={containerRef}>
      <p
        ref={textRef}
        className={expanded ? "text-sm text-current/70" : "line-clamp-2 text-sm text-current/70"}
      >
        {description}
      </p>
      {/* Fixed-height slot (h-5 = text-sm's own line height) reserved
          whether or not the button actually renders — otherwise a card
          with a short, untruncated description ends up visibly shorter
          than its siblings that do show "Read more", producing a ragged
          grid row. */}
      <div className="mt-1 h-5">
        {isTruncated && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="inline-block text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}
